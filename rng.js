const config = require("./config.json");

module.exports = {
  choose: function(message, args, nb) {
    if(args.length < 1){
      message.channel.send("Usage : " + config.botName + " [choose | bo5] choice1; choice2 ... [; choiceN]");
    }
    else{
      const choices = args.join(' ').split(';');
      for(let i = 0; i < nb; i++){
        message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
      }
    }
  }
}
