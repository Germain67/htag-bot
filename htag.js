const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('./config/dev.json') : require('./config/production.json');
const Discord = require('discord.js');
const choose = require('./commands/choose.js');
const help = require('./commands/help.js');
const image = require('./commands/image.js');
const prune = require('./commands/prune.js');
const say = require('./commands/say.js');
const sound = require('./commands/sound.js');
const poll = require('./commands/poll.js');
const youtube = require('./commands/youtube.js');

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`=== ${env} MODE ===`);
  console.log('Htag bot ready');
});

client.on('message', (message) => {
  // Prevent botception
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  // Extract command
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log(`[${message.author.username}] ${config.prefix} ${command} ${args.join(' ')}`);

  try {
    switch (command) {
      case 'help':
        help.printCommandList(message);
        break;
      case 'karim':
        image.sendImage(message, args, 'https://cdn.discordapp.com/attachments/129515718646562817/316142794622107649/unknown.png');
        break;
      case 'jmspinner':
        image.sendImage(message, args, 'http://i.imgur.com/4f4dFd4.jpg');
        break;
      case 'jm1':
        image.sendImage(message, args, 'http://i.imgur.com/lS7Ytt0.png');
        break;
      case 'jm2':
        image.sendImage(message, args, 'http://i.imgur.com/iyGQo3A.jpg');
        break;
      case 'approve':
        image.createImage(message, args, 'gif', 'http://i.imgur.com/dskrSTS.gif', 'http://i.imgur.com/zeb3apI.gif');
        break;
      case 'thinking':
        image.sendImage(message, args, 'https://cdn.discordapp.com/attachments/293119468496879617/316972585101295616/LWcZZJL.gif');
        break;
      case 'admin':
        message.author.send(config.ownerIDs.includes(message.author.id));
        break;
      case 'choose':
        choose.choose(message, args, 1);
        break;
      case 'speak':
        sound.speak(message);
        break;
      case 'bo5':
        choose.choose(message, args, 5);
        break;
      case 'say':
        say.sayMessage(message, args);
        break;
      case 'play':
        youtube.play(args, client, message);
        break;
      case 'prune':
        prune.prune(message, args);
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
      case 'initpoll':
        poll.initPoll(message, args);
        break;
      case 'vote':
        poll.vote(message, args);
        break;
      case 'pollstatus':
        poll.pollStatus(message);
        break;
      case 'endpoll':
        poll.endPoll(message);
        break;
      default:
    }
  }
  catch (err) {
    console.error(`Error catched : ${err}`);
  }
});

// Login
client.login(config.token);
