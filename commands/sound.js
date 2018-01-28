module.exports = {
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
};
