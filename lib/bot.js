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

// var qq = new Questionnaire();
//
// function handleQ(r) {
//   console.log(r);
//   qq.recordAnswer('foo')
//     .then(() => {
//       if (r) {
//         qq.getNextQuestion().then(handleQ);
//       } else {
//         qq.submit();
//       }
//     });
// }
//
// qq.getNextQuestion().then(handleQ);

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

    // 1. Ask permission to ask questions
    if (_.includes(Greetings, text)) {
      this.askPermission(userId);
      return true;
    } else if (this.askedPermission(userId)) {
      // 2. Get confirmation
      if (_.includes(Confirmations, text)) {
        // 2.1 start questions
        this.startQuestioning(userId);
      } else {
        // 2.2 end conversation
        this.endConversation(userId, 'No worries.');
      }
      return true;
    } else if (this.waitingForAnswer(userId)) {
      this.sendTextMessage(userId, `I'm having an OCD day today, so I'm afraid I need an answer to the previous question before we can move on. Sorry about that. :)`);
      return true;
    } else {
      this.sendTextMessage(userId, 'XXX Working on it');
      return false;
    }
  }

  waitingForAnswer(userId) {
    return !!this.questionnaires[userId] &&
      this.questionnaires[userId].waitingForAnswer();
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
      console.log('A')
      questionnaire.getNextQuestion()
        .then(question => {
          if (question) {
            console.log('B')
            this.sendQuestion(userId, question);
          } else {
            console.log('C')
            return this._getUserName(userId)
              .then(firstName => {
                console.log('D')
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
      q.recordAnswer(message)
        .then(() => {
          return this.sendNextQuestion.bind(this)(userId);
        });
    }
    return true;
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

  askPermission(userId) {
    this._getUserName(userId)
      .then(firstName => {
        this.questionnaires[userId] = AskedPermission;
        this.sendTextMessage(userId, `Hi ${firstName}. Your travel agent asked me to help him tailor your trip. I need to ask you a few questions. Is that ok?`);
      });
  }

  startQuestioning(userId) {
    this.startNewQuestionnaire(userId)
      .then(() => this.sendTextMessage(userId, `Awesome. Let's start.`))
      .then(() => this.sleep(2))
      .then(() => this.sendNextQuestion(userId));
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

  startNewQuestionnaire(userId) {
    this.questionnaires[userId] = new Questionnaire();
    return Promise.resolve();
  }

  sleep(sec) {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, sec * 1000);
    });
  }
}


module.exports = TravelbrainBot;
