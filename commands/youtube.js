const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');
const YTDL = require('ytdl-core');
const ytapi = require('./youtube-api.js');
const Discord = require('discord.js');

const nowplaying = {};
const volume = {};
const servers = {};

function playSong(client, connection, message) {
  const server = servers[message.guild.id];

  nowplaying[message.guild.id] = server.queue.shift();
  const video = nowplaying[message.guild.id];

  const iconurl = client.user.avatarURL;
  const embed = new Discord.RichEmbed()
    .setAuthor('Music', iconurl)
    .setColor([0, 255, 0])
    .setDescription(`**Now Playing:**\n${
      video.title}`)
    .setThumbnail(video.thumbnail);
  message.channel.send(embed); // This sends a message of the current music playing

  server.dispatcher = connection.playStream(YTDL(video.url, { filter: 'audioonly' })); // This will stream only the audio part of the video.
  // This checks if the user have set a volume
  if (volume[message.guild.id]) {
    server.dispatcher.setVolume(volume[message.guild.id]);
  } // This sets the volume of the stream
  server.dispatcher.on('end', () => {
    nowplaying[message.guild.id] = null;
    if (server.queue.length > 0) {
      setTimeout(() => {
        playSong(client, connection, message);
      }, 1000);
    }
    else {
      connection.disconnect();
      server.dispatcher = null;
    }
  });
}

module.exports = {
  play(args, client, message) {
    const iconurl = client.user.avatarURL;

    if (!args[0]) {
      const embed = new Discord.RichEmbed()
        .setAuthor('Music', iconurl)
        .setColor([255, 0, 0])
        .setDescription(`**Usage:** ${config.prefix}play <link/search query>`);
      message.channel.send(embed);
      return;
    }
    if (!message.member.voiceChannel) {
      message.channel.send('You must be in a voice channel');
      return;
    }
    if (!servers[message.guild.id]) {
      servers[message.guild.id] = {
        queue: [],
      };
    }

    const server = servers[message.guild.id];
    const search = args.join(' ');

    ytapi.getVideo(search).then((video) => {
      server.queue.push(video);

      if (server.dispatcher) {
        if (server.queue.length > 0) {
          const embed = new Discord.RichEmbed()
            .setAuthor('Music', iconurl)
            .setColor([0, 255, 0])
            .setDescription(`**Added to queue:**\n${
              video.title}`)
            .setThumbnail(video.thumbnail);
          message.channel.send(embed);
        }
      }

      if (!message.guild.voiceConnection) {
        message.member.voiceChannel.join().then((connection) => {
          if (!server.dispatcher) {
            playSong(client, connection, message);
          }
        });
      }
      else if (!server.dispatcher) {
        playSong(client, message.guild.voiceConnection, message);
      }
    });
  },
  skip(message) {
    const server = servers[message.guild.id];
    if (server.dispatcher) {
      server.dispatcher.end();
    }
  },
  stop(message) {
    const server = servers[message.guild.id];
    if (message.guild.voiceConnection) {
      message.guild.voiceConnection.disconnect();
      server.queue.splice(0, server.queue.length);
    }
  },
  playing(client, message) {
    const iconurl = client.user.avatarURL;
    const embed = new Discord.RichEmbed()
      .setAuthor('Music', iconurl)
      .setColor([0, 255, 0]);
    if (nowplaying[message.guild.id]) {
      const video = nowplaying[message.guild.id];
      embed.setDescription(`**Now Playing:**\n${video.title}`).setThumbnail(video.thumbnail);
    }
    message.channel.send(embed);
  },
  queue(client, message) {
    const iconurl = client.user.avatarURL;
    if (nowplaying[message.guild.id]) {
      const video = nowplaying[message.guild.id];
      const server = servers[message.guild.id];
      let desc = `**Now Playing:**\n${video.title}\n\n`;
      for (let i = 0; i < server.queue.length; i++) {
        if (i === 0) {
          desc = `${desc}**Queue:**\n`;
          desc = `${desc}**${i + 1}.** ${server.queue[i].title}\n`;
        }
        else {
          desc = `${desc}**${i + 1}.** ${server.queue[i].title}\n`;
        }
      }
    }
    const embed = new Discord.RichEmbed()
      .setAuthor('Music', iconurl)
      .setColor([0, 255, 0])
      .setDescription('No music is playing.');
    message.channel.send(embed);
  },
  volume(args, client, message) {
    const iconurl = client.user.avatarURL;
    if (!args[0]) {
      const embed = new Discord.RichEmbed()
        .setAuthor('Music', iconurl)
        .setColor([255, 0, 0])
        .setDescription(`**Usage:** ${config.prefix}volume <volume>`);
      message.channel.send(embed);
      return;
    }

    if (args[0] < 0 || args[0] > 100) {
      message.channel.send('Invalid Volume! Please provide a volume from 0 to 100.');
      return;
    }

    volume[message.guild.id] = Number(args[0]) / 100;
    const server = servers[message.guild.id];
    if (server.dispatcher) {
      server.dispatcher.setVolume(volume[message.guild.id]);
      message.channel.send(`Volume set: ${args[0]}%`);
    }
  },

};
