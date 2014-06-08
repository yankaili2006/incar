/**
 * Created by zhoupeng on 14-6-7.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.myActivity = myActivity;

}

function myActivity(req, res) {
    var postData = req.body;
    var db = this.db;
    var user=postData.user;
    var acc_id=postData.acc_id;
    var s4id=postData.s4_id;
    console.log(user+"---"+acc_id+"----"+s4id);
    search(db,acc_id,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            console.log(data);
            res.send(data);
        }
    });
}

function search(db,acc_id,callback) {
    var pool = db();
    pool.query('select act_id,status  from  t_activity_member where cust_id = ?;',
        [acc_id],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows){
                    var myActData=new Array();
                    for(var i=0;i<rows.length;i++){
                        ActivityInfo(db,rows[i].act_id,rows[i].status,function(err,data){
                            myActData.push(data);
                        });
                    }
                    callback(null,myActData);
                }else callback(new Error("t_activity_member data error."));
            }
        });
}
function ActivityInfo(db,act_id,status,callback){
    var pool = db();
    pool.query('select id,title,status,tm_announce  from  t_activity where id = ? and s4_id=? order by tm_announce desc;',
        [act_id,s4id],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows&&rows.length==1){
                    var act_data={};
                    act_data.id=rows[0].id;
                    act_data.title=rows[0].title;
                    act_data.status=rows[0].status;
                    act_data.tm_announce=rows[0].tm_announce;
                    act_data.myStatus=status;
                   callback(null,act_data);
                }else callback(new Error("t_activity data error."));
            }
        });
}