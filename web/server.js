
'use strict'

var express = require('express');

/**
 *  Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application configuration
var config = require('./config/config');

// Construct application object
var app = express();

// Express settings
require('./config/express')(app);

// Routing
require('./config/routes')(app);

// Start server
app.listen(config.port, function() {
    console.log('Express server is listening on port %d in %s mode.\n', config.port, app.get('env'));
});

// Delayed initializer
process.nextTick(function(){
    app.get('delayedInitializer')(function(err, result){
        if (!err && result) process.nextTick(result);
    });
});

// Expose app
exports = module.exports = app;

