'use strict';

var self = this;
var noop = function () {};
var SCRIPTS = {};

function getScript(script, success, fail) {
  var xhr = new XMLHttpRequest();
  var DONE = 4;
  var OK = 200;
  var fn = function (text) {
    return success(text);
  }
  
  success = success || noop;
  fail = fail || noop;
  
  console.log(Object.keys(SCRIPTS));

  // Cache scripts in memory
  if (typeof SCRIPTS[script] === "string") {
    success(SCRIPTS[script]);
  } else if (typeof SCRIPTS[script] === "object") {
    SCRIPTS[script].push(fn);
    return;
  } else {
    SCRIPTS[script] = [fn];
  }

  xhr.open('GET', script);
  xhr.send(null);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === DONE) {
      if (xhr.status === OK) {
        var queue = SCRIPTS[script];
        SCRIPTS[script] = xhr.responseText;
        
        if (typeof queue === "string") {
          return success(SCRIPTS[script]);
        }
        
        queue.forEach(function (cb) {
          cb(xhr.responseText);
        });
        
      } else {
        console.log('Error: ' + xhr.status); // An error occurred during the request.
        fail(xhr);
      }
    }
  }
}

function chainScriptArrays(arr, callback) {
  var chunk = [];
  arr.forEach(function (script) {
    getScript(script, function (text) {
      chunk.push({url: script, text: text});
      if (chunk.length === arr.length) {
        callback(chunk);
      }
    });
  });
}

self.onmessage = function (params) {
  var scripts = params.data || [];
  var responses = [];
  var count = 0;
  var callback = function (res) {
    responses.push(res);
    if (responses.length === scripts.length) {
      self.postMessage(responses);
      return;
    }
    
    chainScriptArrays(scripts[++count], callback);
  };

  chainScriptArrays(scripts[count], callback);
}