'use strict';

const defaults = require('lodash.defaults');

const defaultParams = {
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();

function RecognitionManager (app, params) {
  params = defaults(params, defaultParams);
  
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;
  
  this.final_transcript = '';
  this.app = app;

  let self = this;

  
  ['onaudiostart','onaudioend','onerror','onnomatch','onsoundstart','onsoundend','onspeechend','onstart','onstop','onend'].forEach(function(eventName) {
       recognition[eventName] = function(e) {
           console.log(eventName, e);
       };
   });
  recognition.onresult = function( event ) {
    console.log('You said: ', event.results[0][0].transcript);
    self.app.emitter.emit('recognized',event.results[0][0].transcript);
  }

  recognition.onerror = function( eventName ) {
    self.app.emitter.emit('notRecognized');
  }
}

RecognitionManager.prototype.init = function () {
  this.final_transcript = '';
  console.log('--- init',recognition);
	recognition.start();
}

RecognitionManager.prototype.stop = function () {
  console.log('--- end');
  recognition.stop();  
}

module.exports = RecognitionManager;