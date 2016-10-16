/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash'),
  Q = require('bluebird'),
  sabre = Q.promisifyAll(require('./sabre/rest'));


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
                "Radius": 30.0,
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

function groupHotelsByRange(hotels) {
  var hotelsWithImages = hotels.filter(h => {
    try {
      return !!h.HotelImageInfo.ImageItem.Image.Url;
    } catch(e) {
      return false;
    }
  });

  var rates = hotelsWithImages.map(h => {
    // console.log(h.HotelRateInfo.RatePlan.Rate.AverageNightlyRate);
    return parseFloat(h.HotelRateInfo.RatePlan.Rate.AmountBeforeTax, 10);
  });
  var minRate = _.min(rates);

  var maxRate = _.max(rates);
  var rateRange = maxRate - minRate;
  var categoryRange = rateRange/3;
  var categoriesEnds = [
    minRate + categoryRange,
    minRate + categoryRange*2,
    maxRate
  ];

  var hotelsGroupedByRange = _.groupBy(hotelsWithImages, h => {
    var rate = h.HotelRateInfo.RatePlan.Rate.AmountBeforeTax;
    return _.reduce(categoriesEnds, (c, e, idx) => {
      if (c === null) {
        return rate <= e ? idx : null;
      } else {
        return c;
      }
    }, null);
  });

  return hotelsGroupedByRange;
}

module.exports = {
  buildItineraryMessage: function(firstName, payload) {
    return {
      attachment: {
        "type": "template",
        "payload": {
          "template_type": "airline_itinerary",
          "theme_color": "#00796B",
          "intro_message": `Hi ${firstName}. One of our travel agents just made a flight booking for you.`,
          "locale": "en_US",
          "pnr_number": payload.pnr,
          "passenger_info": [
            {
              "name": payload.passengerName,
              "ticket_number": "0741234567890",
              "passenger_id": "p001"
            }
          ],
          "flight_info": payload.segments.map((s, idx) => {
            return {
              "connection_id": "c" + idx,
              "segment_id": "s" + idx,
              "flight_number": s.flightNumber,
              "aircraft_type": s.aircraftType,
              "departure_airport": {
                "airport_code": s.departureAirport,
                "city": s.departureAirport,
                "terminal": "T4",
                "gate": "G8"
              },
              "arrival_airport": {
                "airport_code": s.arrivalAirport,
                "city": s.arrivalAirport,
                "terminal": "T4",
                "gate": "G8"
              },
              "flight_schedule": {
                "departure_time": s.departureTime,
                "arrival_time": s.arrivalTime
              },
              "travel_class": "economy"
            };
          }),
          "passenger_segment_info": payload.segments.map((s, idx) => {
            return {
              "segment_id": "s" + idx,
              "passenger_id": "p001",
              "seat": Math.round(Math.random() * 30) + "A",
              "seat_type": "Economy"
            };
          }),
          "total_price": payload.price.amount,
          "currency": payload.price.currency
        }
      }
    };
  },

  groupHotelsByRange: groupHotelsByRange,

  buildHotelMessage: function(userId, sabreHotel) {
    return {
      recipient: {
        id: userId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: sabreHotel.HotelInfo.HotelName,
              subtitle: `${sabreHotel.HotelRateInfo.RatePlan.Rate.AmountBeforeTax}$/night. ${sabreHotel.HotelInfo.Distance} miles from the airport`,
              image_url: sabreHotel.HotelImageInfo.ImageItem.Image.Url,
              buttons: [{
                type: "postback",
                title: 'Book this one for me please',
                payload: `BOOK_HOTEL`,
              }]
            }]
          }
        }
      }
    };
  },

  findCheapestHotel: function(airportCode, dateStart, dateEnd, type) {
    let q = _.cloneDeep(HOTEL_REQUEST_TEMPLATE);
    q.GetHotelAvailRQ.SearchCriteria.GeoRef.RefPoint.Value = airportCode;
    q.GetHotelAvailRQ.SearchCriteria.RateInfoRef.StayDateRange.StartDate = dateStart.format('YYYY-MM-DD');
    q.GetHotelAvailRQ.SearchCriteria.RateInfoRef.StayDateRange.EndDate = dateEnd.format('YYYY-MM-DD');

    return sabre.postAsync({
      service: SABRE_HOTEL_SEARCH_URL,
      query: q
    })
    .then(res => {
      if (res.GetHotelAvailRS.HotelAvailInfos) {
        let hotels = res.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
        var hotelsGroupedByRange = groupHotelsByRange(hotels);
        var hotelsForType = _.sortBy(hotelsGroupedByRange[type], h => {
          return parseFloat(h.HotelRateInfo.RatePlan.Rate.AmountBeforeTax, 10);
        });
        return hotelsForType[0];
      } else {
        console.log(res.GetHotelAvailRS.ApplicationResults.Success[0]);
        return res.GetHotelAvailRS.ApplicationResults.Success[0];
      }
    });
  }
};
