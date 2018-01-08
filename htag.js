const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const rng = require("./rng.js");
const youtube = require("./youtube.js")

client.on("ready", () => {
  console.log("Htag bot started");
});

client.on("message", (message) => {
  //Prevent botception
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  //Extract command
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log('[' + message.author.username + "] " + config.botName + ' ' + command + ' '+ args.join(' '));

  switch (command) {
    case "help":
      //printCommandList();
      break;
    case "isSuperAdmin":
      message.channel.send(message.author.id == config.ownerID);
      break;
    case "choose":
      rng.choose(message, args, 1);
      break;
    case "bo5":
      rng.choose(message, args, 5);
      break;
    case "say":
      if(args.length < 1){
        message.channel.send("Usage : " + config.botName + " say Write your text here");
      }
      else{
        message.channel.send(args.join(' '));
      }
      break;
    case "play":
      youtube.play(args, client, message)
      break;
    case "skip":
      youtube.skip();
      break;
    case "stop":
      youtube.stop(message);
      break;
    case "playing":
      youtube.playing(client, message);
      break;
    case "queue":
      youtube.queue(client, message);
      break;
    case "volume":
      youtube.volume(args, client, message);
      break;
    default:
      message.channel.send("If you want command list : " + config.botName + " help");
  }
});

//Login
client.login(config.token);
