const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');

module.exports = {
  sayMessage(message, args) {
    if (args.length < 1) {
      message.channel.send(`Usage : ${config.prefix}say [Write your text here]`);
    }
    else {
      message.channel.send(args.join(' '));
    }
  },
};
