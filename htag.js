const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const common = require('./common.js');
const youtube = require('./youtube.js');

client.on('ready', () => {
  console.log('Htag bot started');
});

client.on('message', (message) => {
  //Prevent botception
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  //Extract command
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log('[' + message.author.username + '] ' + config.botName + ' ' + command + ' ' + args.join(' '));

  try{
    switch (command) {
      case 'help':
        common.printCommandList(message);
        break;
      case 'admin':
        message.channel.send(message.author.id == config.ownerID);
        break;
      case 'choose':
        common.choose(message, args, 1);
        break;
      case 'bo5':
        common.choose(message, args, 5);
        break;
      case "say":
        common.say(message, args);
        break;
      case 'play':
        youtube.play(args, client, message)
        break;
      case 'skip':
        youtube.skip(message);
        break;
      case 'stop':
        youtube.stop(message);
        break;
      case 'playing':
        youtube.playing(client, message);
        break;
      case 'queue':
        youtube.queue(client, message);
        break;
      case 'volume':
        youtube.volume(args, client, message);
        break;
      default:
    }
  }
  catch (err){
    console.error('Error catched : ' + err);
  }
});

//Login
client.login(config.token);
