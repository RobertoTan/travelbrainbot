/* jshint node: true, devel: true */
'use strict';

const THEMES = [
  ['BEACH', 'https://i.imgsafe.org/25b38a11e3.jpg'],
  // ['DISNEY', 'https://i.imgsafe.org/25b4656d25.jpg'],
  // ['GAMBLING', 'https://i.imgsafe.org/25b344750f.jpg'],
  ['HISTORIC', 'https://i.imgsafe.org/25b31bfd25.jpg'],
  ['MOUNTAINS', 'https://i.imgsafe.org/25b306e279.jpg'],
  ['NATIONAL-PARKS', 'https://i.imgsafe.org/25b405fe68.jpeg'],
  ['OUTDOORS', 'https://i.imgsafe.org/25b37bb304.jpg'],
  ['ROMANTIC', 'https://i.imgsafe.org/25b47c0f30.jpg'],
  ['SHOPPING', 'https://i.imgsafe.org/25b3ae8eac.jpeg'],
  ['SKIING', 'https://i.imgsafe.org/25b27eb2b2.jpg'],
  ['THEME-PARK', 'https://i.imgsafe.org/25b3d29555.jpeg'],
  ['CARIBBEAN', 'https://i.imgsafe.org/25b3984be3.jpeg'],
];

module.exports = {
  id: 'theme',
  ask: function() {
    return Promise.resolve([
      {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: THEMES.map((t, idx) => {
              return {
                "title": "" + idx,
                "buttons": [{
                  type: "postback",
                  title: t[0],
                  payload: t[0],
                }],
                "image_url":t[1]
              };
            })
          }
        }
      },
    ]);
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
