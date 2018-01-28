const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');

module.exports = {
  choose(message, args, nb) {
    const choices = args.join(' ').split(';');
    if (choices.length < 2) {
      message.channel.send(`Usage : ${config.prefix}[choose | bo5] [choice1] [; choice2] ... [; choiceN]`);
    }
    else {
      for (let i = 0; i < nb; i++) {
        message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
      }
    }
  },
};
