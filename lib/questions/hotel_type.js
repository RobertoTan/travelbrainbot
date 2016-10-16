/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash'),
  Q = require('bluebird'),
  sabre = Q.promisifyAll(require('../sabre/rest')),
  moment = require('moment'),
  utils = require('../utils');

const SABRE_HOTEL_SEARCH_URL = '/v1.0.0/shop/hotels?mode=avail';
const HOTEL_REQUEST_TEMPLATE = {
    "GetHotelAvailRQ": {
        "SearchCriteria": {
            "GeoRef": {
                "RefPoint": {
                    // "CountryCode": "US",
                    "RefPointType": "6",
                    "ValueContext": "CODE",
                    "Value": "NYC"
                },
                "Radius": 20.0,
                "UOM": "MI",
                "Category": "HOTEL"
            },
            "RateInfoRef": {
                "CurrencyCode": "USD",
                "StayDateRange": {
                    "StartDate": "2016-10-21",
                    "EndDate": "2016-10-22"
                },
                "GuestCount": {
                    "Count": 2
                }
            },
            "HotelPref": {

            },
            "ImageRef": {
                "Type": "SMALL",
                "LanguageCode": "EN"
            }
        }
    }
};

function lookupHotels(airportCode, dateStart, dateEnd) {
  let q = _.cloneDeep(HOTEL_REQUEST_TEMPLATE);
  q.GetHotelAvailRQ.SearchCriteria.GeoRef.RefPoint.Value = 'NYC';
  q.GetHotelAvailRQ.SearchCriteria.RateInfoRef.StayDateRange.StartDate = dateStart.format('YYYY-MM-DD');
  q.GetHotelAvailRQ.SearchCriteria.RateInfoRef.StayDateRange.EndDate = dateEnd.format('YYYY-MM-DD');

  return sabre.postAsync({
    service: SABRE_HOTEL_SEARCH_URL,
    query: q
  })
  .then(res => {
    let hotels = res.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
    // console.log(JSON.stringify(hotels[0], null, 2));
    // console.log(hotels);
    return hotels;
  });
}

function pickThreeHotels(hotels) {
  var hotelsGroupedByRange = utils.groupHotelsByRange(hotels);

  var hotelFromEveryGroup = _.map(hotelsGroupedByRange, (val) => {
    return _.sample(val);
  });

  return hotelFromEveryGroup;
  // _.each(hotelsGroupedByRange, (hh, type) => {
  //   console.log(`${hh.length} hotels for ${type}`);
  // });
}

// lookupHotels('NYC', moment('2016-11-10'), moment('2016-11-15'))
//   .then(pickThreeHotels)
//   .then(hotels => {
//     var hotel = hotels[0];
//     console.log(JSON.stringify(hotel, null, 2));
//     var img = hotel.HotelImageInfo.ImageItem.Image.Url;
//     console.log(img);
//   });

const RANGE_NAMES = ['Budget', 'Mid range', 'Splurge'];

module.exports = {
  id: 'hotel_type',
  ask: function(options) {
    options = options || {};

    return lookupHotels(
      options.destination || 'NYC',
      options.startDate || moment('2016-11-10'),
      options.endDate || moment('2016-11-15')
    ).then(pickThreeHotels)
      .then(hotels => {
        return [
          {
            text: 'Which one of these hotels look like the one you usually stay at?',
          },
          {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: hotels.map((h, idx) => {
                  return {
                    title: h.HotelInfo.HotelName,
                    image_url: h.HotelImageInfo.ImageItem.Image.Url,
                    buttons: [{
                      type: "postback",
                      title: RANGE_NAMES[idx],
                      payload: `${idx}`,
                    }],
                  };
                })
              }
            }
          }
        ];
      });
  },
  answer: function(answer) {
    return Promise.resolve(answer);
  }
};
