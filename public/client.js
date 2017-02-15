(function () {
  var LOADED = {};

  function appendScripts(chunks, callback) {
    chunks.forEach(function (chunk) {
      chunk.forEach(function (s) {
        if (LOADED[s.url]) {
          console.log(s.url, "already loaded");
          return;
        }

        var script = document.createElement('script');
        script.text = 'try {\n' + (s.text|| "")  + '\n} catch (err) {console.error("Script Error:", err)}';
        document.body.appendChild(script);
        console.log(s.url, "loaded");
        LOADED[s.url] = true;
      });
    });
    
    // Take the callback execution outside of the stack
    window.setTimeout(callback);
  }
  
  if (window.Worker) {
    var worker = new Worker('worker.js');
    
    worker.postMessage([
      ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js']
    ]);
    
    worker.postMessage([
      [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', 
        'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'
      ],
      ['https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js'],
    ]);
    
    window.setTimeout(function () {
      worker.postMessage([
        ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'],
        ['https://cdnjs.cloudflare.com/ajax/libs/ember.js/2.11.0/ember.min.js'],
        ['https://cdnjs.cloudflare.com/ajax/libs/ember-data.js/2.11.1/ember-data.min.js']
      ]);
    }, 2000);
    

    worker.addEventListener('message', function (msg) {
      appendScripts(msg.data, function() {  
        console.log('All scripts loaded for this chunk');
      });
    });
  }
}());
