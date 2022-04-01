const FeatureModel = require('../../models/feature');
const CharacterModel = require('../../models/character');
const FeatureInvestmentModel = require('../../models/feature_investment');
const ActivityManager = require('../../bot/managers/ActivityManager');
const SettingsManager = require('../../bot/managers/SettingsManager');
const { ARENA_PROXIMO } = require('../../data/features');
const { mintRandomAsset } = require('../../services/tokens');

const finishMiningJob = async job => {
  const {
    data: { userId },
    nextRunAt
  } = job.attrs;

  const feature = await FeatureModel.findOne({
    name: ARENA_PROXIMO.name
  }).exec();
  const userInvestment = await FeatureInvestmentModel.findOne({
    userId
  }).exec();
  const character = await CharacterModel.findOne({ userId })
    .populate({
      path: 'items.weapon',
      populate: { path: 'data' }
    })
    .exec();
  const tx = character.getPhrases();

  const investment =
    userInvestment ||
    new FeatureInvestmentModel({
      userId: character.userId,
      feature: feature.id,
      character: character.id,
      name: ARENA_PROXIMO.name
    });

  const { units, lootItems } = await ActivityManager.getMiningReward({
    date: nextRunAt,
    mining: character.values.mining,
    completed: true,
    event: 'proximo'
  });

  investment.units += Number(units);

  if (character.miningEquipment) {
    await character.handleEquipmentUsage(units);
  }

  await investment.save();
  await job.remove();

  const itemTags = await character.saveLoot(lootItems);
  const lootMessage = itemTags.length > 0 ? `${tx['lootMessage.proximoMining']}${itemTags.join('\n')}` : '';

  if (character.waxWallet && SettingsManager.MINING_NFT_REWARDS_ENABLED) {
    mintRandomAsset(character.waxWallet, 'common', ['435050', '435048']);
    character.notify('characterNewAssetGift');
  }

  character.notify('proximoMiningFinished', { units, lootMessage });
};

module.exports = finishMiningJob;
