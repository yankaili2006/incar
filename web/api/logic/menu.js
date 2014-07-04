/**
 * Created by Jesse Qu on 5/8/14.
 */
var mysql = require('mysql');
var config = require('../../config/config');
var db = require('../../config/db');
var WXAPI = require('../weixin').API;
var url = require('url');

exports = module.exports = function(tickTasks, menuObject, callback) {

    // resolve url based on the wx_oauth_addr
    var resolveUrl = function(mo, baseSite){
        // clone mo
        var mx = JSON.parse(JSON.stringify(mo));
        // process url
        if(baseSite){
            var baseUrl = "http://" + baseSite;
            for(var i in mx.button){
                var btn = mx.button[i];
                for(var j in btn.sub_button){
                    var sub = btn.sub_button[j];
                    if(sub.url){
                        sub.url = url.resolve(baseUrl, sub.url);
                    }
                }
            }
        }
        return mx;
    };

    var pool = db();

    var sql = 'select id,name,wx_app_name appName, wx_app_id appId, wx_app_secret appSecret, wx_oauth_addr from t_4s ;';

    pool.query(sql, function(err, rows){
        if (err) { return callback(err, null); }
        if (rows) {
            rows.forEach(function(element, index, array){
                if(element.appName && element.appSecret) {
                    tickTasks.enqueueTask(function () {
                        var api = new WXAPI(element.appId, element.appSecret);

                        api.createMenu(resolveUrl(menuObject, element.wx_oauth_addr), function (err, result) {
                            if (err) {
                                console.warn('4s store: ' + element.name + ' weixin menu initial error.   4s store id :' + element.id + ' ---> ' + err);
                            }
                            else {
                                console.info('Weixin menu was newly defined for "\033[32m' + element.name + '\033[0m" to \033[32m' + element.wx_oauth_addr + '\033[0m !!!');
                            }
                        });
                    });
                }
            });
            return callback(null, tickTasks);
        }
        else { return callback(new Error('No error, but we got a null as result.'), null); }
    });

};