const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');
const fs = require('fs-extra');
const gm = require('gm').subClass({ imageMagick: true });

function computeTextDash(textArray, itemLength) {
  const res = textArray;
  for (let i = 0; i < 3; i++) {
    if (textArray[i] && textArray[i][itemLength - 1] !== ' ' && textArray[i + 1] && textArray[i + 1][0] !== ' ') {
      res[i] += '-';
    }
  }
  return res;
}

module.exports = {
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
      const drawing = gm((Math.random() > 0.50) ? urlGifNotApproved : urlGifApproved)
        .region(252, 252, 0, 0)
        .gravity('Center')
        .font('Helvetica.ttf', 18)
        .fill('#000000')
        .drawText(0, 30, messageContentSplit[0] ? messageContentSplit[0] : '')
        .drawText(0, 55, messageContentSplit[1] ? messageContentSplit[1] : '')
        .drawText(0, 80, messageContentSplit[2] ? messageContentSplit[2] : '');
      let msg = '';
      if (messageContentSplit[3]) {
        msg = (messageContentSplit[4] ? (`${messageContentSplit[3]}...`) : messageContentSplit[3]);
      }
      drawing.drawText(0, 105, msg)
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
};
