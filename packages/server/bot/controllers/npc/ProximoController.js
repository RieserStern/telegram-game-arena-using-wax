const Random = require('random-js')();
const moment = require('moment');
const numeral = require('numeral');
const agenda = require('services/agenda');
const MenuHelper = require('bot/helpers/menu');
const CharacterModel = require('models/character');
const InventoryItemModel = require('models/inventory_item');
const FeatureModel = require('models/feature');
const FeatureInvestmentModel = require('models/feature_investment');
const CharactersManager = require('bot/managers/CharactersManager');
const ActivityManager = require('bot/managers/ActivityManager');
const AssetsManager = require('bot/managers/AssetsManager');
const SettingsManager = require('bot/managers/SettingsManager');
const { ARENA_PROXIMO } = require('data/features');
const { getPercentageByValue, getTimeLeft } = require('utils');
const { chunk } = require('lodash');

class ProximoController {
  loadCharacter(userId) {
    return CharacterModel.findOne({ userId }).populate({
      path: 'items.weapon',
      populate: { path: 'data' }
    });
  }

  loadFeatureInvestment(userId) {
    return FeatureInvestmentModel.findOne({ userId });
  }

  loadFeature() {
    return FeatureModel.findOne({ name: ARENA_PROXIMO.name }).populate('investments');
  }

  loadFeatureInvestments(param) {
    const searchQuery = { name: ARENA_PROXIMO.name, [param]: { $gt: 0 } };
    const sortQuery = { [param]: 'desc' };

    return FeatureInvestmentModel.find(searchQuery)
      .sort(sortQuery)
      .limit(500)
      .populate({
        path: 'character',
        populate: {
          path: 'clan'
        }
      });
  }

  async loadMiningJob(userId) {
    const jobs = await agenda.jobs({
      name: 'finish_mining',
      'data.userId': userId
    });

    return jobs ? jobs[0] : null;
  }

  async start($) {
    const { userId } = $;
    const character = await this.loadCharacter(userId);
    const busyJob = CharactersManager.getBusyJob(userId);

    if (busyJob && busyJob.name === 'mining') {
      const tx = character.getPhrases();
      const onBack = () => MenuHelper.sendArenaMenu($, tx);
      return this.sendMiningMenu($, tx, character, { onBack });
    }

    return this.sendIndexMenu($, character);
  }

  renderInvestorsList(investments, params = {}) {
    const { gap = 0, pageMessage = '', unitParam } = params;
    const valueIcons = {
      gold: '💰',
      units: '⛏'
    };

    return investments.reduce((list, investment, index) => {
      const characterTag = investment.character.renderTag();
      const invested = investment[unitParam];
      const value = `${valueIcons[unitParam]} ${invested}`;
      const number = gap + index + 1;

      return `${list}\n${number}. ${characterTag} — ${value}`;
    }, pageMessage);
  }

  async sendInvestors($, character, investorsMenu, unitParam) {
    const investments = await this.loadFeatureInvestments(unitParam);
    const tx = character.getPhrases();

    const perPage = 25;

    if (investments.length > perPage) {
      const pages = chunk(investments, perPage);
      const menuItems = pages.map((data, index) => ({
        id: index,
        message: this.renderInvestorsList(data, {
          unitParam,
          gap: perPage * index,
          pageMessage: `<b>${tx.labelPage} ${index + 1}/${pages.length}</b>\n`
        }),
        menu: []
      }));

      await $.runMenu(investorsMenu);
      return $.runPaginatedMenu({
        layout: [2, 2],
        items: menuItems
      });
    }

    const listMessage = this.renderInvestorsList(investments, { unitParam });
    return $.runMenu({
      ...investorsMenu,
      message: `${investorsMenu.message}\n${listMessage}`
    });
  }

  async sendMiningMenu($, tx, character, params = {}) {
    const { userId, userLang, miningEquipment } = character;
    const miningJob = await this.loadMiningJob(userId);

    const backOption = {
      [tx.labelBack]: $ => {
        if (params.onBack) {
          return params.onBack();
        }
        return this.sendHelpMenu($, tx, character);
      }
    };

    if (miningJob) {
      const timeLeft = getTimeLeft(miningJob.attrs.nextRunAt, {
        units: ['h', 'm'],
        language: tx.lang,
        round: true
      });

      let isProcessing = false;
      const startedMessage = character.t('proximoMiningStarted', { timeLeft });

      return $.runMenu({
        layout: 1,
        resizeKeyboard: true,
        message: startedMessage,
        [tx.labelProximoStopMining]: $ => {
          if (!isProcessing) {
            isProcessing = true;
            return this.stopMiningJob($, tx, userId);
          }
        },
        ...backOption
      });
    }

    const miningTimeMax = moment
      .duration(SettingsManager.MINING_JOB_DURATION_MIN, 'minutes')
      .locale(tx.lang)
      .humanize();
    const miningMessage = character.t('proximoMiningMessage', {
      duration: miningTimeMax,
      ante: SettingsManager.MINING_ANTE
    });

    const miningMenu = {
      layout: 1,
      resizeKeyboard: true,
      message: params.message || miningMessage,
      [tx.labelProximoStartMining]: $ => {
        if (miningEquipment && miningEquipment.isBroken) {
          const itemTitle = miningEquipment.getTitle(userLang);
          const message = character.t('itemBroken', { itemTitle });
          return $.runMenu({ ...miningMenu, message });
        }

        return this.startMiningJob($, tx, character);
      },
      ...backOption
    };

    return $.runMenu(miningMenu);
  }

  async startMiningJob($, tx, character) {
    const { userId } = character;

    if (character.inventory.tokens < SettingsManager.MINING_ANTE) {
      const message = character.t('proximoMiningNotEnoughTokens');
      return this.sendMiningMenu($, tx, character, { message });
    }

    const hours = Math.round(SettingsManager.MINING_JOB_DURATION_MIN / 60);
    const duration = `in ${hours} hours`;
    const job = await agenda.schedule(duration, 'finish_mining', { userId });
    const hasMiningPass = await character.hasGamePass('proximoMining');

    CharactersManager.setBusyJob(userId, { name: 'mining', data: job.attrs });

    if (!hasMiningPass) {
      await character.updateOne({ $inc: { 'inventory.tokens': `-${SettingsManager.MINING_ANTE}` } });
    }

    return this.sendMiningMenu($, tx, character);
  }

  async stopMiningJob($, tx, userId) {
    try {
      const character = await this.loadCharacter(userId);
      const miningJob = await this.loadMiningJob(userId);

      if (!miningJob) {
        return this.sendHelpMenu($, tx, character);
      }

      const feature = await this.loadFeature();
      const userInvestment = await this.loadFeatureInvestment(userId);

      const {
        values: { mining },
        miningEquipment
      } = character;

      const investment =
        userInvestment ||
        new FeatureInvestmentModel({
          userId: character.userId,
          feature: feature.id,
          character: character.id,
          name: ARENA_PROXIMO.name
        });

      const { units, lootItems } = await ActivityManager.getMiningReward({
        date: miningJob.attrs.nextRunAt,
        mining: mining,
        completed: false,
        event: 'proximo'
      });

      investment.units += Number(units);

      if (miningEquipment) {
        await character.handleEquipmentUsage(units);
      }

      await investment.save();
      await miningJob.remove();

      const itemTags = await character.saveLoot(lootItems);
      const lootMessage = itemTags.length > 0 ? `${tx['lootMessage.proximoMining']}${itemTags.join('\n')}` : '';
      const message = character.t('proximoMiningFinished', {
        units,
        lootMessage
      });

      CharactersManager.clearBusyJob(userId);

      return this.sendHelpMenu($, tx, character, message);
    } catch (err) {
      console.error('[MINING]: Error stopMiningJob', err);
    }
  }

  sendInvestForm($, tx, character) {
    const formQuestion = character.t('proximoInvestQuestion', {
      gold: character.inventory.gold
    });

    return new Promise(resolve => {
      $.runForm(
        {
          value: {
            q: formQuestion,
            error: tx.proximoInvestError,
            keyboard: [tx.labelCancel],
            validator: (message, callback) => {
              const value = Number(message.text);

              if (message.text === tx.labelCancel) {
                return this.sendHelpMenu($, tx, character);
              }

              if (value && value >= 25 && value <= 10000) {
                return callback(true, value);
              }

              return callback(false);
            }
          }
        },
        resolve
      );
    });
  }

  sendIndexMenu($, character) {
    const tx = character.getPhrases();

    const proximoMainMenu = {
      layout: 1,
      resizeKeyboard: true,
      message: tx.proximoIntroMessage,
      [tx.labelProximoHello]: {
        message: tx.proximoStoryMessage,
        resizeKeyboard: true,
        [tx.labelProximoHelp]: $ => {
          return this.sendHelpMenu($, tx, character);
        },
        [tx.labelProximoBye]: $ => {
          return MenuHelper.sendArenaMenu($, tx);
        },
        [tx.labelBack]: $ => {
          $.runMenu(proximoMainMenu, $.files.proximo);
        }
      },
      [tx.labelProximoHelp]: $ => {
        this.sendHelpMenu($, tx, character);
      },
      [tx.labelBack]: $ => {
        return MenuHelper.sendArenaMenu($, tx);
      },
      anyMatch: $ => {
        $.runMenu(proximoMainMenu, $.files.proximo);
      }
    };

    $.runMenu(proximoMainMenu, $.files.proximo);
  }

  async sendGiftsMenu($, character) {
    const { userId } = $;
    const tx = character.getPhrases();
    const userInvestment = await this.loadFeatureInvestment(userId);

    const { gold, gifts } = userInvestment;
    const { giftGoalGold } = ARENA_PROXIMO;

    const giftsButton = character.t('labelProximoReceiveGift', { gifts });
    const giftsMessage = character.t('proximoGiftsMessage', {
      gold,
      gifts,
      giftGoalGold
    });

    const giftsOption = {
      [giftsButton]: async $ => {
        const giftsCount = await userInvestment.giftsCount();
        const giftsData = AssetsManager.getGiftItems({
          giftEvent: 'proximo',
          giftSize: 'sm'
        });

        if (giftsCount <= 0 || giftsData.length <= 0) {
          return this.sendHelpMenu($, tx, character, tx.proximoNoGiftsMessage);
        }

        const giftData = Random.pick(giftsData);

        const insertGifts = Array(giftsCount).fill({
          userId: userId,
          data: giftData.id
        });

        const giftItems = await InventoryItemModel.insertMany(insertGifts);
        const giftItemsIds = giftItems.map(item => item.id);

        await userInvestment.updateOne({ $inc: { giftsTaken: giftsCount } });
        await character.updateOne({
          $push: { 'inventory.items': { $each: giftItemsIds } }
        });

        const successMessage = character.t('proximoGiftsAddedMessage', {
          gifts: giftsCount
        });

        return this.sendHelpMenu($, tx, character, successMessage);
      }
    };

    const backOption = {
      [tx.labelBack]: $ => {
        return this.sendHelpMenu($, tx, character);
      }
    };

    const proximoGiftsMenu = {
      layout: 1,
      resizeKeyboard: true,
      message: giftsMessage
    };

    if (gifts > 0) {
      return $.runMenu({
        ...proximoGiftsMenu,
        ...giftsOption,
        ...backOption
      });
    }

    return $.runMenu({
      ...proximoGiftsMenu,
      ...backOption
    });
  }

  async sendHelpMenu($, tx, character, customMessage) {
    const feature = await this.loadFeature();
    const progress = feature.getProgress();

    const { goldGoal, unitsGoal, name } = ARENA_PROXIMO;

    const isGoldComplete = progress.gold >= goldGoal;
    const isMiningComplete = progress.units >= unitsGoal;

    const goldPercentage = getPercentageByValue(goldGoal, progress.gold, 2);
    const unitsPercentage = getPercentageByValue(unitsGoal, progress.units, 2);

    const gold = numeral(progress.gold).format('0,0');
    const units = numeral(progress.units).format('0,0');

    const goldProgress = numeral(goldGoal).format('0,0');
    const unitsProgress = numeral(unitsGoal).format('0,0');

    const goldCount = !isGoldComplete
      ? `${gold} / ${goldProgress} <b>(${goldPercentage}%)</b>`
      : `<b>✅ ${tx.labelProximoComplete}</b>`;

    const unitsCount = !isMiningComplete
      ? `${units} / ${unitsProgress} <b>(${unitsPercentage}%)</b>`
      : `<b>✅ ${tx.labelProximoComplete}</b>`;

    const menuMessage = character.t('proximoHelpMessage', {
      goldCount,
      unitsCount
    });

    const handleGoldInvestment = async ({ value }) => {
      const [isEnoughGold, gold] = await character.isEnoughGold(value);

      if (isEnoughGold) {
        const userInvestment = await this.loadFeatureInvestment($.userId);
        const investment =
          userInvestment ||
          new FeatureInvestmentModel({
            userId: character.userId,
            feature: feature.id,
            character: character.id,
            name: name
          });

        investment.gold += Number(value);
        character.inventory.gold -= Number(value);

        await character.save();
        await investment.save();

        const message = character.t('proximoInvestSuccess', { value });
        return this.sendHelpMenu($, tx, character, message);
      }

      const message = character.t('proximoInvestNoGold', { gold });
      return this.sendHelpMenu($, tx, character, message);
    };

    const helpGoldOption = isGoldComplete
      ? {}
      : {
          [tx.labelProximoHelpGold]: $ => {
            this.sendInvestForm($, tx, character).then(handleGoldInvestment);
          }
        };

    const helpMiningOption = isMiningComplete
      ? {}
      : {
          [tx.labelProximoHelpMining]: $ => {
            this.sendMiningMenu($, tx, character);
          }
        };

    const investorsMenu = {
      layout: 2,
      resizeKeyboard: true,
      message: tx.proximoHelpTableMessage,
      [tx.labelProximoHelpInvestors]: $ => {
        const menu = { ...investorsMenu, message: tx.proximoHelpInvestors };
        return this.sendInvestors($, character, menu, 'gold');
      },
      [tx.labelProximoHelpMiners]: $ => {
        const menu = { ...investorsMenu, message: tx.proximoHelpMiners };
        return this.sendInvestors($, character, menu, 'units');
      },
      [tx.labelBack]: $ => {
        $.runMenu(helpMenu);
      }
    };

    const helpMenu = {
      layout: [2, 2, 1],
      resizeKeyboard: true,
      message: customMessage || menuMessage,
      ...helpGoldOption,
      ...helpMiningOption,
      [tx.labelGift]: $ => {
        this.sendGiftsMenu($, character);
      },
      [tx.labelProximoHelpTable]: investorsMenu,
      [tx.labelBack]: $ => {
        this.sendIndexMenu($, character);
      }
    };

    $.runMenu(helpMenu);
  }
}

module.exports = ProximoController;
