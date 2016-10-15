/* jshint node: true, devel: true */
'use strict';

const DefaultQuestions = [
  {
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
  },
  {
    id: 'apple_or_banana',
    ask: function() {
      return Promise.resolve([
        {
          text: 'Apple or banana?',
        },
        {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [{
                title: "Apple",
                image_url: "http://kingofwallpapers.com/apple/apple-011.jpg",
                buttons: [{
                  type: "postback",
                  title: "Apple apple apple!",
                  payload: "APPLE",
                }],
              }, {
                title: "Banana",
                image_url: "https://s3.amazonaws.com/static.caloriecount.about.com/images/medium/bananas-170061.jpg",
                buttons: [{
                  type: "postback",
                  title: "Yeeeah!",
                  payload: "BANANA",
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
  }
];

class Questionnaire {
  constructor() {
    this.questions = DefaultQuestions;
    this.answers = [];
    this.currentQuestion = null;
  }

  getNextQuestion() {
    if (this.currentQuestion) {
      // still waiting for an answer
      return Promise.resolve(null);
    } else {
      this.currentQuestion = this.questions.pop();
      if (this.currentQuestion) {
        return this.currentQuestion.ask();
      } else {
        // questions are over
        return Promise.resolve(null);
      }
    }
  }

  hasMoreQuestions() {
    return this.currentQuestion || this.questions.length > 0;
  }

  recordAnswer(answer) {
    if (this.currentQuestion) {
      let q = this.currentQuestion;
      return q.answer(answer)
        .then(value => {
          this.answers.push({
            id: q.id,
            answer: value
          });
          this.currentQuestion = null;
          console.log(`Answer "${value}" recorded for question ${q.id}`);
        });
    } else {
      return Promise.resolve();
    }
  }

  submit() {
    console.log(`Here are the answers:`, this.answers);
  }
}

module.exports = Questionnaire;
