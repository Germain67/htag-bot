const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');

let currentPoll = null;

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

module.exports = {
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
