/* jshint node: true, devel: true */
'use strict';

module.exports = {
  id: 'seat',
  ask: function() {
    return Promise.resolve([
      {
        "text":"Great. Now where do you usually seat?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Window",
            "payload":"WINDOW",
          },
          {
            "content_type":"text",
            "title":"Aisle",
            "payload":"AISLE",
          }
        ]
      },
    ]);
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
