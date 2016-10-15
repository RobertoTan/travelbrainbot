/* jshint node: true, devel: true */
'use strict';

module.exports = {
  id: 'alliance',
  ask: function() {
    return Promise.resolve([
      {
        "text":"Which one do you usually fly?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"One World",
            "payload":"ONEWORLD",
            "image_url":"http://logodatabases.com/wp-content/uploads/2012/04/Oneworld-logo.png"
          },
          {
            "content_type":"text",
            "title":"Sky Team",
            "payload":"SKYTEAM",
            "image_url":"http://logodatabases.com/wp-content/uploads/2012/04/small-skyteam-logo.jpg"
          },
          {
            "content_type":"text",
            "title":"Star Alliance",
            "payload":"STAR",
            "image_url":"http://logodatabases.com/wp-content/uploads/2012/04/Star_Alliance_Logo.png"
          },
        ]
      },
    ]);
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
