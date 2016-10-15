/* jshint node: true, devel: true */
'use strict';

module.exports = {
  id: 'apple_or_banana',
  ask: function() {
    return Promise.resolve([
      // {
      //   text: 'Great. Now, apple or banana?\n\n',
      // },
      {
        "text":"Great, now apple or banana?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Apple",
            "payload":"APPLE",
            "image_url":"http://kingofwallpapers.com/apple/apple-011.jpg"
          },
          {
            "content_type":"text",
            "title":"Banana",
            "payload":"BANANA",
            "image_url":"https://s3.amazonaws.com/static.caloriecount.about.com/images/medium/bananas-170061.jpg"
          }
        ]
      },
      // {
      //   attachment: {
      //     type: "template",
      //     payload: {
      //       template_type: "generic",
      //       elements: [{
      //         title: "Apple",
      //         image_url: "http://kingofwallpapers.com/apple/apple-011.jpg",
      //         buttons: [{
      //           type: "postback",
      //           title: "Apple apple apple!",
      //           payload: "APPLE",
      //         }],
      //       }, {
      //         title: "Banana",
      //         image_url: "https://s3.amazonaws.com/static.caloriecount.about.com/images/medium/bananas-170061.jpg",
      //         buttons: [{
      //           type: "postback",
      //           title: "Yeeeah!",
      //           payload: "BANANA",
      //         }],
      //       }]
      //     }
      //   }
      // }
    ]);
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
