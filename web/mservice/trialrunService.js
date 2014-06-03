/**
 * Created by zhoupeng on 14-5-29.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.trialrun = trialrun;

}

function trialrun(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    submitTrialrun(db, postData,function(err, data) {
        if (err) { res.send(err); }
        else {
           res.send(data);
        }
    });
}

function submitTrialrun(db, postData,callback) {
    var pool = db();
    var temp=postData.bookTime.split(":");
    postData.bookDate=new Date(postData.bookDate);
    postData.bookDate.setHours(temp[0],temp[1]);
    pool.query('insert into  t_trialrun (wx_oid,acc_id,bookingtime,seriesName,name,phone,tc,ts) values(?,?,?,?,?,?,?,now());',
        [postData.wx_oid,postData.acc_id,postData.bookDate,postData.seriesName,postData.name,postData.phone,''],function(err,rows){
        if(err){callback(err);}
        else{
           callback(null,1);
         }
    });

}
