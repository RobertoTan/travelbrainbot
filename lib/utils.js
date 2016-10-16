/* jshint node: true, devel: true */
'use strict';

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
  }
};
