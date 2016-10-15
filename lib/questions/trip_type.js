/* jshint node: true, devel: true */
'use strict';

module.exports = {
  id: 'trip_type',
  ask: function() {
    return Promise.resolve([
      {
        text: 'What kind of trip is it?',
      },
      {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: "Business",
              image_url: "http://sharpheels.com/wp-content/uploads/2016/01/First-Time-Business-Travelers.jpg",
              buttons: [{
                type: "postback",
                title: "This one",
                payload: "BUSINESS",
              }],
            }, {
              title: "Leisure",
              image_url: "https://www.solidrop.net/photo-6/new-summer-style-men-shirt-floral-hawaiian-shirt-cotton-beach-large-size-short-sleeve-hawaii-shirt-mens-summer-camisa-masculina.jpg",
              buttons: [{
                type: "postback",
                title: "More like this",
                payload: "LEISURE",
              }],
            }]
          }
        }
      }
    ]);
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
