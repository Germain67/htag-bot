const env = process.env.NODE_ENV || 'dev';
const config = require('./config/' + env + '.json');
var help = require('./help.json');

module.exports = {
  printCommandList: function(message) {
    let helpStr = 'Command list\n```';
    for (var i = 0; i < help.length; i++) {
      helpStr += config.prefix + help[i].command;
      for (var j = 0; j < help[i].arguments.length; j++) {
        helpStr += ' [' + help[i].arguments[j] + ']';
      }
      helpStr += ' : ' + help[i].description + '\n';
    }
    helpStr += '```';
    message.author.send(helpStr);
  },
  choose: function(message, args, nb) {
    const choices = args.join(' ').split(';');
    if(choices.length < 2){
      message.channel.send('Usage : ' + config.prefix + '[choose | bo5] choice1; choice2 ... [; choiceN]');
    }
    else{
      for(let i = 0; i < nb; i++){
        message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
      }
    }
  },
  say: function(message, args){
    if(args.length < 1){
      message.channel.send('Usage : ' + config.prefix + 'say Write your text here');
    }
    else{
      message.channel.send(args.join(' '));
    }
  },
  sendImage: function(message, args, url){
    message.channel.send({
      "embed": {
        title: args.join(' '),
        "image": {
          "url": url,
        }
      }
    });
  }
}
