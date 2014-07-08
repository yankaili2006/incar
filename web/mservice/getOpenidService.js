/**
 * Created by zhoupeng on 14-5-15.
 */
'use strict';

var http=require('./nodegrass');
var db = require('../config/db');

exports = module.exports = function(service) {
    service.post.getOpenid = getOpenid;
};

function getOpenid(req, res) {
    var app_id = req.body.app_id;
    var code = req.body.code;
    if(!app_id){
        res.send(400, 'app_id cannot be found!');
        return;
    }
    if(!code){
        res.send(400, 'code cannot be found!');
        return;
    }

    var pool = db();
    var sql = "SELECT openid, wx_app_secret FROM t_4s WHERE wx_app_id = ?";
    pool.query(sql, [app_id], function(ex, result){
        if(ex){
            res.send(500, ex);
            return;
        }
        if(result.length === 0){
            res.send(404, 'Cannot find the app_id!');
            return;
        }
        if(result.length > 1){
            res.send(500, 'More than one app_id found!');
            return;
        }
        if(!result[0].wx_app_secret){
            res.send(404, 'Cannot find the app_secret!');
            return;
        }

        console.error('--------1.data.s4_openid---->' + result[0].openid);

        var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?' +
            'appid=' + app_id +
            '&secret=' + result[0].wx_app_secret +
            '&code=' + code +
            '&grant_type=authorization_code';
        http.get(url, function(data){
            console.error('--------2.data.s4_openid---->' + result[0].openid);
            data.s4_openid = result[0].openid;
            console.error('--------3.data.s4_openid---->' + result[0].openid);
            console.error('--------4.data.s4_openid---->' + data.s4_openid);
            console.error('--------5.data.s4_openid---->' + data.openid);
            console.error('--------6.data.s4_openid---->' + data);
            console.error('--------7.data.s4_openid---->' + JSON.stringify(data));
            res.send(200, data);
        });
    });
}




