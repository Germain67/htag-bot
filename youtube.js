const config = require("./config.json");
const YTDL = require('ytdl-core');
const ytapi = require("./youtube-api.js");

var nowplaying = {};
var volume = {};
var servers = {};

function playSong (connection, message) {
  var server = servers[message.guild.id];

  nowplaying[message.guild.id] = server.queue.shift();
  var video = nowplaying[message.guild.id];

  var iconurl = client.user.avatarURL;
  var embed = new Discord.RichEmbed()
      .setAuthor("Music", iconurl)
      .setColor([0, 255, 0])
      .setDescription("**Now Playing:**\n" +
      video.title)
      .setThumbnail(video.thumbnail)
  message.channel.send(embed); // This sends a message of the current music playing

  server.dispatcher = connection.playStream(YTDL(video.url, { filter: "audioonly" })); // This will stream only the audio part of the video.
  if (volume[message.guild.id]) // This checks if the user have set a volume
      server.dispatcher.setVolume(volume[message.guild.id]); // This sets the volume of the stream

  server.dispatcher.on("end", function () {
      nowplaying[message.guild.id] = null;
      if (server.queue.length > 0)
          playSong(connection, message);
      else {
          connection.disconnect();
          server.dispatcher = null;
      }
  });
}

module.exports = {
  play: function (args, client, message) {

    var iconurl = client.user.avatarURL;

    if (!args[0]) {
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([255, 0, 0])
            .setDescription(`**Usage:** ${config.botName} play <link/search query>`)
        message.channel.send(embed);
        return;
    }
    if (!message.member.voiceChannel) {
        message.channel.send("You must be in a voice channel");
        return;
    }
    if (!servers[message.guild.id])
        servers[message.guild.id] = {
            queue: []
        };

    var server = servers[message.guild.id];
    var search;

    if (args[0].toLowerCase().startsWith('http'))
        search = args[0];
    else
        search = message.content.substring(config.prefix.length + args[0].length + 1);

    ytapi.getVideo(search).then(function (video) {

        server.queue.push(video);

        if (server.dispatcher) {
            if (server.queue.length > 0) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([0, 255, 0])
                    .setDescription("**Added to queue:**\n" +
                    video.title)
                    .setThumbnail(video.thumbnail)
                message.channel.send(embed);
            }
        }

        if (!message.guild.voiceConnection)
            message.member.voiceChannel.join().then(function (connection) {
                if (!server.dispatcher)
                    playSong(connection, message);
            })
        else {
            if (!server.dispatcher)
                playSong(message.guild.voiceConnection, message);
        }
    });
  },
  skip: function(){
    var server = servers[message.guild.id];
    if (server.dispatcher) {
        server.dispatcher.end();
    }
  },
  stop: function(message){
    var server = servers[message.guild.id];
    if (message.guild.voiceConnection) {
        message.guild.voiceConnection.disconnect();
        server.queue.splice(0, server.queue.length);
    }
  },
  playing: function(client, message){
    var iconurl = client.user.avatarURL;
    if (nowplaying[message.guild.id]) {
        var video = nowplaying[message.guild.id];
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([0, 255, 0])
            .setDescription("**Now Playing:**\n" +
            video.title)
            .setThumbnail(video.thumbnail)
        message.channel.send(embed);
    }
    else {
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([0, 255, 0])
            .setDescription("No music is playing.")
        message.channel.send(embed);
    }
  },
  queue: function(client, message){
    var iconurl = client.user.avatarURL;
    if (nowplaying[message.guild.id]) {
        var video = nowplaying[message.guild.id];
        var server = servers[message.guild.id];
        var desc = `**Now Playing:**\n${video.title}\n\n`;
        for (var i = 0; i < server.queue.length; i++) {
            if (i == 0) {
                desc = desc + "**Queue:**\n";
                desc = desc + `**${i + 1}.** ${server.queue[i].title}\n`;
            }
            else {
                desc = desc + `**${i + 1}.** ${server.queue[i].title}\n`;
            }
        }
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([0, 255, 0])
            .setDescription(desc)
        message.channel.send(embed);
    }
    else {
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([0, 255, 0])
            .setDescription("No music is playing.")
        message.channel.send(embed);
    }
  },
  volume: function(args, client, message){
    var iconurl = client.user.avatarURL;
    if (!args[0]) {
        var embed = new Discord.RichEmbed()
            .setAuthor("Music", iconurl)
            .setColor([255, 0, 0])
            .setDescription(`**Usage:** ${config.botName}volume <volume>`)
        message.channel.send(embed);
        return;
    }

    if (args[0] < 0 || args[0] > 100) {
        message.channel.send("Invalid Volume! Please provide a volume from 0 to 100.");
        return;
    }

    volume[message.guild.id] = Number(args[0]) / 100;
    var server = servers[message.guild.id];
    if (server.dispatcher) {
        server.dispatcher.setVolume(volume[message.guild.id]);
        message.channel.send(`Volume set: ${args[0]}%`);
    }
  }

}
