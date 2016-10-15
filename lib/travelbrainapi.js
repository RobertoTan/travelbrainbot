/* jshint node: true, devel: true */
'use strict';

const Q = require('bluebird'),
  request = Q.promisify(require('request')),
  _ = require('lodash');

const HotelTypes = ['BUDGET', 'MID', 'SPLURGE'];
const HotelStars = [1, 3, 5];

function getForId(prefs) {
  return function(pref) {
    return _.includes(prefs, pref.id);
  };
}

function getPref(prefs, id) {
  return _.find(prefs, p => p.id === id).answer;
}

function toHotelType(idx) {
  return HotelTypes[parseInt(idx)];
}

function toHotelStars(idx) {
  return HotelStars[parseInt(idx)];
}

class API {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.customerId = options.customerId || 6;
  }

  _getCustomer() {
    return `/api/v1/customer/${this.customerId}/`;
  }

  savePreferences(prefs) {
  //   prefs = [ { id: 'trip_type', answer: 'BUSINESS' },
  // { id: 'theme', answer: 'BEACH' },
  // { id: 'alliance', answer: 'ALLIANCE' },
  // { id: 'seat', answer: 'WINDOW' },
  // { id: 'hotel_type', answer: '0' } ];

    return Promise.all([
      this.post('/flightpreference/', {
        "customer": this._getCustomer(),
        "alliance": getPref(prefs, 'alliance'),
        "price": 350,
        "seat": getPref(prefs, 'seat')
      }),
      this.post('/hotelpreference/', {
        "customer": this._getCustomer(),
        "stars": toHotelStars(getPref(prefs, 'hotel_type')),
        "price": 100,
        "hotel_type": toHotelType(getPref(prefs, 'hotel_type'))
      }),
      this.post('/theme/', {
        customer: this._getCustomer(),
        name: getPref(prefs, 'theme')
      }),
      this.post('/trippreference/', {
        customer: this._getCustomer(),
        trip_type: getPref(prefs, 'trip_type')
      })
    ]);
  }

  post(url, questions) {
    let q = {
      method: 'POST',
      url: `${this.baseUrl}${url}`,
      body: questions,
      json: true
    };

    console.log(q);
    return request(q).then(result => {
      var c = parseInt(result.statusCode, 10);

      if (c < 200 || c >= 300) {
        throw new Error(`URL: ${url} CODE: ${result.statusCode}: ${result.body}`);
      } else {
        return result.body;
      }
    });
  }
}

module.exports = API;
