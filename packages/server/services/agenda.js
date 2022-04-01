const config = require('config');
const Agenda = require('agenda');
const CharactersManager = require('bot/managers/CharactersManager');

const resetDailyQuestsJob = require('./jobs/reset_daily_quests');
const resetMaximusSeasonJob = require('./jobs/reset_maximus_season');
const resetProximoSeasonJob = require('./jobs/reset_proximo_season');
const dailyLotteryJob = require('./jobs/daily_lottery');
const cancelAbilityJob = require('./jobs/cancel_ability');
const finishMiningJob = require('./jobs/finish_mining');
const handleBankTransaction = require('./jobs/handleBankTransaction');

const agenda = new Agenda({
  db: {
    address: config.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
});

agenda.define('reset_maximus_season', resetMaximusSeasonJob);
agenda.define('reset_proximo_season', resetProximoSeasonJob);
agenda.define('reset_daily_quests', resetDailyQuestsJob);
agenda.define('daily_lottery', dailyLotteryJob);
agenda.define('cancel_ability', cancelAbilityJob);
agenda.define('finish_mining', finishMiningJob);
agenda.define('bank_transaction', handleBankTransaction);

agenda.on('ready', async () => {
  await agenda.start();

  await agenda.every('2 hours', 'daily_lottery');
  await agenda.every('24 hours', 'reset_daily_quests');
  await agenda.every('168 hours', 'reset_maximus_season'); // 7 days
  await agenda.every('240 hours', 'reset_proximo_season'); // 10 days

  const miningJobs = await agenda.jobs({ name: 'finish_mining' });

  miningJobs.forEach(job => {
    CharactersManager.setBusyJob(job.attrs.data.userId, {
      name: 'mining',
      data: job.attrs
    });
  });

  console.info('[Agenda]: Connected!');
  console.info('[Agenda]: %s mining jobs restarted!', miningJobs.length);
});

agenda.on('complete:finish_mining', job => {
  CharactersManager.clearBusyJob(job.attrs.data.userId);
});

module.exports = agenda;
