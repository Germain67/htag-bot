const env = process.env.NODE_ENV || 'dev';
const config = require(`./config/${env}.json`);
const fs = require('fs-extra');
const gm = require('gm').subClass({ imageMagick: true });
const help = require('./help.json');

let currentPoll = null;

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
  choose(message, args, nb) {
    const choices = args.join(' ').split(';');
    if (choices.length < 2) {
      message.channel.send(`Usage : ${config.prefix}[choose | bo5] [choice1] [; choice2] ... [; choiceN]`);
    }
    else {
      for (let i = 0; i < nb; i++) {
        message.channel.send(choices[Math.floor(Math.random() * choices.length)]);
      }
    }
  },
  say(message, args) {
    if (args.length < 1) {
      message.channel.send(`Usage : ${config.prefix}say [Write your text here]`);
    }
    else {
      message.channel.send(args.join(' '));
    }
  },
  speak(message) {
    const sounds = [
      './sounds/allahu1.mp3',
      './sounds/allahu2.mp3',
    ];

    const soundToPlayIndex = Math.floor(Math.random() * sounds.length);
    if (message.member && message.member.voiceChannel) {
      message.member.voiceChannel.join().then((connection) => {
        const dispatcher = connection.playFile(sounds[soundToPlayIndex]);
        dispatcher.on('end', () => {
          message.member.voiceChannel.leave();
          connection.disconnect();
        });
      });
    }
  },
  sendImage(message, args, url) {
    message.channel.send({
      embed: {
        title: args.join(' '),
        image: {
          url,
        },
      },
    });
  },
  createImage(message, args, fileType, urlGifNotApproved, urlGifApproved) {
    if (args.join(' ') !== '') {
      message.channel.send('Hum, let me guess :thinking: ');

      // With computeTextDash, dashes are added at the end of each line if a word is cut
      const messageContentSplit = computeTextDash(args.join(' ').match(/.{1,22}/g), 22);

      // The text is split into 4 parts of 17 char each.
      gm((Math.random() > 0.50) ? urlGifNotApproved : urlGifApproved)
        .region(252, 252, 0, 0)
        .gravity('Center')
        .font('Helvetica.ttf', 18)
        .fill('#000000')
        .drawText(0, 30, messageContentSplit[0] ? messageContentSplit[0] : '')
        .drawText(0, 55, messageContentSplit[1] ? messageContentSplit[1] : '')
        .drawText(0, 80, messageContentSplit[2] ? messageContentSplit[2] : '')
        .drawText(0, 105, messageContentSplit[3] ? (messageContentSplit[4] ? (`${messageContentSplit[3]}...`) : messageContentSplit[3]) : '')
        .write(`./output.${fileType}`, (err) => {
          if (!err) {
            message.channel.send('', {
              files: [
                `./output.${fileType}`,
              ],
            }).then(() => {
              fs.unlinkSync(`output.${fileType}`); // remove the temp file
            }).catch(() => {
              console.log('Something went wrong while creating the file');
            });
          }
          else {
            console.log(err);
          }
        });
    }
    else {
      message.channel.send(`Usage : ${config.prefix}approve condition`);
    }
  },
  prune(message, args) {
    // let's add some reaction to this violence
    const react = [':heart:', ':sunglasses:', ':ok_hand:', ':muscle:', ':tools:', ':shower:', ':regional_indicator_s: :regional_indicator_w: :regional_indicator_a: :regional_indicator_g:'];

    if (message.channel.type === 'text') {
      const nbrToDelete = args.join(' ');

      if (args.join(' ') !== '' && isInteger(args.join(' '))) {
        if (nbrToDelete > 20 || nbrToDelete < 1) {
          message.channel.send('You can delete more than 1 message at least or 20 messages maximum only :open_mouth:');
        }
        else {
          message.channel.send(`Yes Sir ${react[Math.floor(Math.random() * 8)]}`).then(() => {
            setTimeout(() => {
              message.channel.fetchMessages().then((messages) => {
                const deleted = 0;
                const tmp = [];
                let i = -1;

                // build the array of messages to remove
                messages.forEach((elem) => {
                  if (i <= (nbrToDelete)) {
                    tmp.push(elem);
                    i++;
                  }
                });
                message.channel.bulkDelete(tmp).then(messages => console.log('Bulk deleted messages'))
                  .catch(console.error);
              })
                .catch((err) => {
                  console.log(`Error while doing prune Delete: ${err}`);
                });
            }, 1000);
          });
        }
      }
      else {
        message.channel.send(`Hey nigga :boy::skin-tone-5: => Usage : ${config.prefix}prune number`);
      }
    }
  },
  initPoll(message, args) {
    if (config.ownerIDs.includes(message.author.id)) {
      if (currentPoll == null) {
        if (args.length < 1) {
          message.channel.send(`Usage : ${config.prefix}initPoll [pollTitle]`);
        }
        else {
          currentPoll = {
            title: args.join(' '), yes: 0, no: 0, voters: [],
          };
          message.channel.send(`Poll : ${currentPoll.title}`);
          message.channel.send(`You can vote by using ${config.prefix}vote [yes | no]`);
        }
      }
      else {
        message.channel.send(`A poll is still opened. You have to end it first with ${config.prefix}endPoll`);
      }
    }
    else {
      message.channel.send('Only admins can initiate a poll');
    }
  },
  vote(message, args) {
    if (args.length === 1 && args[0].toLowerCase() === 'yes') {
      makeVote(message, args, true);
    }
    else if (args.length === 1 && args[0].toLowerCase() === 'no') {
      makeVote(message, args, false);
    }
    else {
      message.channel.send(`Usage : ${config.prefix}vote [yes | no]`);
    }
  },
  endPoll(message) {
    if (config.ownerIDs.includes(message.author.id)) {
      if (currentPoll != null) {
        message.channel.send(`${currentPoll.title}\n Yes : ${currentPoll.yes} No : ${currentPoll.no}`);
        currentPoll = null;
        message.channel.send('Poll has been closed');
      }
      else {
        message.channel.send('No poll currently running');
      }
    }
    else {
      message.channel.send('Only admins can end a poll');
    }
  },
  pollStatus(message) {
    if (currentPoll != null) {
      message.channel.send(`${currentPoll.title}\n\nYes : ${currentPoll.yes} No : ${currentPoll.no}`);
    }
    else {
      message.channel.send('No poll currently running');
    }
  },
};

function makeVote(message, args, voteValue) {
  if (currentPoll != null) {
    if (currentPoll.voters.includes(message.author.id)) {
      message.channel.send('You already voted for this poll');
    }
    else {
      if (voteValue) {
        currentPoll.yes++;
      }
      else {
        currentPoll.no++;
      }
      currentPoll.voters.push(message.author.id);
      message.channel.send('You voted successfully !');
    }
  }
  else {
    message.channel.send('No poll currently running');
  }
}

function computeTextDash(textArray, itemLength) {
  if (textArray[0] && textArray[0][itemLength - 1] != ' ' && textArray[1] && textArray[1][0] != ' ') {
    textArray[0] += '-';
  }
  if (textArray[1] && textArray[1][itemLength - 1] != ' ' && textArray[2] && textArray[2][0] != ' ') {
    textArray[1] += '-';
  }
  if (textArray[2] && textArray[2][itemLength - 1] != ' ' && textArray[3] && textArray[3][0] != ' ') {
    textArray[2] += '-';
  }
  return textArray;
}

function isInteger(x) {
  return x % 1 === 0;
}
