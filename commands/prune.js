const env = process.env.NODE_ENV || 'dev';
const config = (env === 'dev') ? require('../config/dev.json') : require('../config/production.json');

module.exports = {
  prune(message, args) {
    // let's add some reaction to this violence
    const react = [':heart:', ':sunglasses:', ':ok_hand:', ':muscle:', ':tools:', ':shower:', ':regional_indicator_s: :regional_indicator_w: :regional_indicator_a: :regional_indicator_g:'];

    if (message.channel.type === 'text' && args[0]) {
      const nbrToDelete = Number(args[0]);
      if (nbrToDelete > 20 || nbrToDelete < 1) {
        message.channel.send('You can delete more than 1 message at least or 20 messages maximum only :open_mouth:');
      }
      else {
        message.channel.send(`Yes Sir ${react[Math.floor(Math.random() * 8)]}`).then(() => {
          setTimeout(() => {
            message.channel.fetchMessages()
              .then((messages) => {
                const tmp = [];
                let i = -1;
                // build the array of messages to remove
                messages.forEach((elem) => {
                  if (i <= (nbrToDelete)) {
                    tmp.push(elem);
                    i++;
                  }
                });
                message.channel.bulkDelete(tmp)
                  .then(console.log('Bulk deleted messages'))
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
  },
};
