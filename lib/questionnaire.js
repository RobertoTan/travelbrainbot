/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash');

const DefaultQuestions = [
  require('./questions/trip_type'),
  require('./questions/theme'),
  require('./questions/alliance'),
  require('./questions/seat'),
  require('./questions/hotel_type'),
];

class Questionnaire {
  constructor(options) {
    this.questions = _.cloneDeep(DefaultQuestions);
    this.answers = [];
    this.currentQuestion = null;
    this.options = options;
    this.tbapi = options.tbapi;
  }

  getNextQuestion() {
    if (this.currentQuestion) {
      // still waiting for an answer
      return Promise.resolve(null);
    } else {
      this.currentQuestion = this.questions.shift();
      if (this.currentQuestion) {
        return this.currentQuestion.ask(this.options);
      } else {
        // questions are over
        return Promise.resolve(null);
      }
    }
  }

  waitingForAnswer() {
    return !!this.currentQuestion;
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
    return this.tbapi.savePreferences(this.answers)
      .then(x => {
        return this.answers;
      });
  }
}

module.exports = Questionnaire;
