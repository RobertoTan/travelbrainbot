/* jshint node: true, devel: true */
'use strict';

const _ = require('lodash'),
  Questionnaire = require('./questionnaire');

const Greetings = [
  'hi',
  'hello',
  'hey'
];

const Confirmations = [
  'yes',
  'ok',
  'sure'
];

const AskedPermission = 'asked_permission';

class TravelbrainBot {
  constructor(options) {

    // call API method
    this.callSendAPI = options.callSendAPI;
    this.fb = options.fb;

    // indexed by Facebook user ID
    this.questionnaires = {};
  }

  _getUserName(userId) {
    return new Promise((resolve, reject) => {
      this.fb.api(`/${userId}`, 'get', res => {
        if (!res || res.error) {
          reject(new Error(res ? res.error : 'Unknown error'));
        } else {
          resolve(res.first_name);
        }
      });
    });
  }

  handleTextMessage(userId, message) {
    var metadata = message.metadata;
    var text = message.text.toLowerCase();

    console.log('TEXT', text);

    if (_.includes(Greetings, text)) {
      this.askPermission(userId);
      return true;
    } else if (this.askedPermission(userId)) {
      if (_.includes(Confirmations, text)) {
        this.startQuestioning(userId);
      } else {
        this.endConversation(userId, 'No worries.');
      }
      return true;
    } else if (this.isQuestioning(userId) && this.hasMoreQuestions(userId)) {
      this.sendTextMessage(userId, `I'm having an OCD day today, so I'm afraid I need an answer to the previous question before we can move on. Sorry about that. :)`);
      return true;
    } else {
      this.sendTextMessage(userId, 'XXX Working on it');
      return false;
    }
  }

  isQuestioning(userId) {
    return !!this.questionnaires[userId];
  }

  hasMoreQuestions(userId) {
    let q = this.questionnaires[userId];
    if (q) {
      return q.hasMoreQuestions();
    } else {
      return false;
    }
  }

  sendQuestion(userId, question) {
    question.forEach(item => {
      this.callSendAPI({
        recipient: {
          id: userId
        },
        message: item
      });
    });
  }

  sendNextQuestion(userId) {
    let questionnaire = this.questionnaires[userId];
    if (questionnaire) {
      questionnaire.getNextQuestion()
        .then(question => {
          if (question) {
            this.sendQuestion(userId, question);
          } else {
            return this._getUserName(userId)
              .then(firstName => {
                this.questionnaires[userId] = null;
                this.sendTextMessage(userId, `Thanks for answering these questions ${firstName}.`);
                questionnaire.submit();
              });
          }
        });
    } else {
      // not started
    }
  }

  handlePostback(userId, message) {
    console.log('POSTBACK', message);
    let q = this.questionnaires[userId];
    if (q) {
      q.recordAnswer(message);
      this.sendNextQuestion(userId);
    }
    return true;
  }

  askPermission(userId) {
    this._getUserName(userId)
      .then(firstName => {
        this.questionnaires[userId] = AskedPermission;
        this.sendTextMessage(userId, `Hi ${firstName}. Your travel agent asked me to help him tailor your trip. I need to ask you a few questions. Is that ok?`);
      });
  }

  endConversation(userId, prefix) {
    this._getUserName(userId)
      .then(firstName => {
        this.questionnaires[userId] = undefined;
        this.sendTextMessage(userId, `${prefix} Talk to you later ${firstName}`);
      });
  }

  askedPermission(userId) {
    return this.questionnaires[userId] === AskedPermission;
  }

  startQuestioning(userId) {
    this.questionnaires[userId] = this.newQuestionnaire();
    this.sendTextMessage(userId, `Awesome. Let's start.`);
    setTimeout(() => {
      this.sendNextQuestion(userId);
    }, 1000);
  }

  sendTextMessage(userId, message) {
    var messageData = {
      recipient: {
        id: userId
      },
      message: {
        text: message,
        metadata: "DEVELOPER_DEFINED_METADATA"
      }
    };

    this.callSendAPI(messageData);
  }

  newQuestionnaire() {
    return new Questionnaire();
  }
}


module.exports = TravelbrainBot;
