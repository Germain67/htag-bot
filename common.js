const config = require('./config.json');
var fs = require('fs');

module.exports = {
  printCommandList: function(message) {
    fs.readFile('help.txt', 'utf8', function(err, data) {
        if (err) throw err;
        message.author.sendMessage(data);
    });
  },
  choose: function(message, args, nb) {
    const choices = args.join(' ').split(';');
    if(choices.length < 2){
      message.channel.send('Usage : ' + config.botName + ' [choose | bo5] choice1; choice2 ... [; choiceN]');
    }
    else{
      for(let i = 0; i < nb; i++){
        message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
      }
    }
  },
  say: function(message, args){
    if(args.length < 1){
      message.channel.send('Usage : ' + config.botName + ' say Write your text here');
    }
    else{
      message.channel.send(args.join(' '));
    }
  }
}
