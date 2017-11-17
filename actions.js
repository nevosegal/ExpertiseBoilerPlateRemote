/*
© Copyright IBM Corp. 2017
*/


'use strict';

// Read help file
var help = require('./help');

// The expertise handler
const {handler} = require('./expertise-sdk');
const Promise = require('bluebird');
const Conversation = require('watson-developer-cloud/conversation/v1');

// Expertise translations map
const languageResource = {
  'en-US': {
    'translation': {
      'TRY_AGAIN': 'Sorry, I\'m not sure how to answer that.'
    }
  }
};

// Expertise states
const STATES = {
};


let conversation;
try {
    conversation = Promise.promisifyAll(
        new Conversation({
            url: 'your wcs url',
            username: 'your wcs username',
            password: 'your wcs password',
            version_date: Conversation.VERSION_DATE_2017_04_21
        })
    );
} catch (err) {
    console.error('Conversation service failure or missing credentials.');
    console.log(err);
    process.exit(0);
}


// Helper function
function converse(request) {
    console.log(handler.attributes.context);
    // Start conversation, empty context
    const payload = {
        workspace_id: ' your expertise workspace id',
        context: handler.attributes.context,
        input: {text: request.retext}
    };
    // Send the input to the conversation service
    return conversation.messageAsync(payload);
}

function processIntent(request, response) {
    converse(request).then(result => {
        let endSession = false;

        if(result.output.end_convo !== null) {
            endSession = result.output.end_convo;
        }
        console.log(JSON.stringify(result));

        // Save the context of the watson conversation service
        handler.attributes.context = result.context;
        response.say(result.output.text, 'random').shouldEndSession(endSession).send();
    }).catch(err => {
        handler.attributes.context = {};
        response.say(handler.t('TRY_AGAIN'));
    });
};


// Actions for DEFAULT state
const stateDefaultActions = handler.createActionsHandler({

  'hello-world': (request, response) => {
    var question = request.text.toLowerCase();
    // Handle help keywords
    for (var i = 0; i < help.topics.length; i++) {
      for (var j = 0; j < help.topics[i].keywords.length; j++) {
        if (question.indexOf(help.topics[i].keywords[j]) !== -1) {
          response.say(help.topics[i].response).send();
          return;
        }
      }
    }
    // All other requests
    response.say(handler.t('TRY_AGAIN')).send();
  },

  'unhandled': (request, response) => {
    response.say(handler.t('TRY_AGAIN')).send();
  }

});

module.exports = () => {
  // Register language translations.
  handler.registerLanguages(languageResource);
  // Register state actions
  handler.registerActionsHandler(stateDefaultActions);
};
