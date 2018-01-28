const google = require('googleapis');

const env = process.env.NODE_ENV || 'dev';
const config = require(`./config/${env}.json`);

module.exports = {
  getVideo(query) {
    return new Promise(((resolve, reject) => {
      const service = google.youtube('v3');
      service.search.list({
        auth: config.youtubeApiKey,
        part: 'id,snippet',
        type: 'video',
        q: query,
      }, (err, response) => {
        if (err) {
          reject(`The API returned an error: ${err}`);
        }
        if (response.items.length == 0) {
          reject('No video found.');
        }
        else {
          const video = {
            title: response.items[0].snippet.title,
            url: `https://www.youtube.com/watch?v=${response.items[0].id.videoId}`,
            thumbnail: response.items[0].snippet.thumbnails.high.url,
            description: response.items[0].snippet.description,
            publishedDate: response.items[0].snippet.publishedAt,
          };
          resolve(video);
        }
      });
    }));
  },
};
