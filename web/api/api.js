
'use strict';

var TickTasks = require('./weixin').TickTasks;
var subscription = require('./logic/subscription');
var wxMenu = require('./logic/wxMenu');
var wxToken = require('./logic/wxToken');

var api = {};

function defaultTextMsgReplier(message, req, callback) {
    return callback({type: 'text', content: '您没有激活任何命令，或您的回复已经过期！'});
}

api.ticks = function(ticker) {
    return function(callback) {
        var tickTasks = new TickTasks(ticker);
        wxMenu.defineTasks(tickTasks, function(err, result){
            if (err) return callback(err, null);
            return callback(null, result.taskTicker.bind(result))
        });
    };
};

api.getServiceToken = function(appName, openid, callback) {
    return wxToken.getTokenOrSetOpenId(appName, openid, callback);
};
api.onTextMsg = function(message, req, res, next) {
    console.log('\nreq.wxsession:');
    console.log(req.wxsession);

    console.log(message);

    var repliedMsg;
    var indexer = req.wxsession.textMsgReplierIndex;
    if (indexer !== null && indexer !== undefined && indexer !== '' && (wxMenu.textMsgRepliers[indexer])) {
        wxMenu.textMsgRepliers[indexer](message, req, function(repliedMsg){
            return res.reply(repliedMsg);
        });
    }
    else {
        defaultTextMsgReplier(message, req, function(repliedMsg){
            res.reply(repliedMsg);
        });
    }
};

api.onImageMsg = function(message, req, res, next) {
    console.log(message);
};

api.onVoiceMsg = function(message, req, res, next) {
    console.log(message);
};

api.onVideoMsg = function(message, req, res, next) {
    console.log(message);
};

api.onLocationMsg = function(message, req, res, next) {
    console.log(message);
};

api.onLinkMsg = function(message, req, res, next) {
    console.log(message);
};

api.onEventMsg = function(message, req, res, next) {
    console.log(message);

    req.wxsession.textMsgReplierIndex = null;

    switch (message.Event) {
        case 'subscribe':
            subscription.subscribe(message, req, function(err, result){
                if (err) { next(err); }
                else { res.reply(result); }
            });
            break;
        case 'unsubscribe':
            subscription.unsubscribe(message, req, function(err, result){
                if (err) { next(err); }
                else { res.reply(result); }
            });
            break;
        case 'CLICK':
            if (typeof wxMenu.onClick[message.EventKey] === "function") {
                wxMenu.onClick[message.EventKey](message, req, function(err, result){
                    if (err) { next(err); }
                    else { res.reply(result); }
                });
            }
            else {
                console.log('No function defined for the event key - ' + message.EventKey);
                res.send(' ');
            }
            break;
    }

};

if (! global.apiContext) {
    global.apiContext = api.defaultApiContext;
}

exports = module.exports = api;