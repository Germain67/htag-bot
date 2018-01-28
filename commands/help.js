const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');
const help = require('../help.json');

module.exports = {
  printCommandList(message) {
    let helpStr = 'Command list\n```';
    for (let i = 0; i < help.length; i++) {
      helpStr += config.prefix + help[i].command;
      for (let j = 0; j < help[i].arguments.length; j++) {
        helpStr += ` [${help[i].arguments[j]}]`;
      }
      helpStr += ` : ${help[i].description}\n`;
    }
    helpStr += '```';
    message.author.send(helpStr);
  },
};
