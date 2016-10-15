const _ = require('lodash');

const Greetings = [
  'hi',
  'hello',
  'hey'
];

const Confirmation = [
  'yes',
  'ok'
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

    if (_.includes(Greetings, text)) {
      this.askPermission(userId);
      return true;
    } else if (this.askedPermission(userId)) {
      if (_.includes(text, Confirmation)) {
        this.startQuestioning(userId);
      } else {
        this.endConversation(userId, 'No worries.');
      }
      return true;
    } else {
      this.sendTextMessage('XXX Working on it');
      return false;
    }
  }

  handleQuickReply(userId, message) {
    // XXX
    return false;
  }

  askPermission(userId) {
    this._getUserName(userId)
      .then(firstName => {
        this.questionnaires[userId] = AskedPermission;
        this.sendTextMessage(`Hi ${firstName}. Your travel agent asked me to help him tailor your trip. I need to ask you a few questions. Is that ok?`);
      });
  }

  endConversation(userId, prefix) {
    this._getUserName(userId)
      .then(firstName => {
        this.questionnaires[userId] = undefined;
        this.sendTextMessage(`${prefix} Talk to you later ${firstName}`);
      });
  }

  askedPermission(userId) {
    return this.questionnaires[userId] === AskedPermission;
  }

  startQuestioning(userId) {
    this.questionnaires[userId] = this.newQuestionnaire();
    this.sendTextMessage(`Awesome. Let's start.`);
  }

  sendTextMessage(userId, message) {
    var messageData = {
      recipient: {
        id: senderID
      },
      message: {
        text: 'Hi',
        metadata: "DEVELOPER_DEFINED_METADATA"
      }
    };
  }

  newQuestionnaire() {
    return {}; // XXX
  }
}


module.exports = TravelbrainBot;
