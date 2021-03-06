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
           res.json(200, "okay");
        }
    });
}

function submitTrialrun(db, postData,callback) {
    var pool = db();
    postData.bookDate= postData.bookDate + " " +postData.bookTime;
    pool.query('insert into  t_trialrun (wx_oid,acc_id,bookingtime,seriesName,name,phone,bookStatus,tc,ts,channel) values(?,?,?,?,?,?,1,?,now(), "wechat");',
        [postData.wx_oid,postData.acc_id,postData.bookDate,postData.seriesName,postData.name,postData.phone,''],function(err,rows){
        if(err){callback(err);}
        else{
            pool.query('select id from t_trialrun where wx_oid like ? order by ts desc limit 1',["%"+postData.wx_oid+'%'],function(err,rows){
                if(err){ callback(err);}
                else if(rows){
                    pool.query('insert into t_work (work,step,work_ref_id,org_id,cust_id,json_args,working_time,created_time) values(?,?,?,?,?,?,?,now())',
                        ['drivetry','applied',rows[0].id,postData.s4_id,postData.acc_id,postData.args,postData.bookDate],function(err,result){
                            if(err){  callback(err);}
                            else callback(null,1);
                        });
                }else callback(new Error("trialrun data insert Error."));
            });
         }
    });

}
