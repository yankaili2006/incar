/**
 * Created by Jesse Qu on 3/25/14.
 */

'use strict';

var dao=require("../config/dao");
var findPool = require('../config/db');

exports = module.exports = function(service) {
    service.post.enroll = userEnroll;
}
//验证微信用户是否存在账户
function userCheck(req,res){
    var params=req.body;
    var temp=params.user.split('@');
    var openId=temp[0];
    var openId4S=temp[1];
    var wx=openId+":"+openId4S
    var sql="select * from t_account where wx_oid like ?";
    dao.findBySql(sql,['%'+wx+'%'],function(info){
        if(info.err){
            res.json({status:'failure',result:false});
        }
        else{
            if(info.data.length>0){
                res.json({status:'success',result:true,user:info.data[0]});
            }
            else{
                res.json({status:'success',result:false});
            }
        }
    });

}
//通过已有账户信息登录，并和当前微信用户绑定
function userLogin(req,res){
    var params=req.body;
    var openId=params.openId;
    var openId4S=params.sopenId;
    var username=params.username;
    var password=params.password;
    var wx=openId+"-"+openId4S
    var sql="select id,wx_oid from t_account where name=? and pwd=?";
    dao.findBySql(sql,[username,password],function(info){
        if(info.err){
            res.json(info);
        }
        else{
            var rows=info.data;
            if(rows.length>0){
                var id=rows[0].id;
                var oldWX=rows[0].wx_oid;
                var newWX=oldWX?oldWX+';'+wx:wx;
                sql="update t_account set ? where id=?";
                dao.executeBySql(sql,[{wx_oid:newWX},id],function(info){
                    if(info.err){
                        info.message='无法完成当前账户与微信账户的绑定';
                        res.json(info);
                    }
                    else{
                        info.accountId=id;
                        res.json(info);
                    }
                });
            }
            else{
                info.message='登录失败';
                res.json(info);
            }
        }
    });
}
//登记或修改（设置）账号
function userEnroll(req, res) {
    if(true /* 这种方法根本无法验证  !userCheck(req, res)*/){
        var params=req.body;
        var username=params.name;
        var password=params.password;
        var temp=params.user.split('@');
        var openId=temp[0];
        var openId4S=temp[1];
        var phone=params.phone;
        var nickName=params.nick;
        var flag = params.flag;
        var id = params.id;
        if(!openId4S) {
            res.json({status:'failure',message:"user参数应该形如 oAPKMuL3dNs0NMuL3d34PpxMI@gh_2ca612000ed0"});
            return;
        }

        var sql="select id from t_4s where openid=?";
        dao.findBySql(sql,[openId4S],function(info){
            if(info.err){
                res.json({status:'网络好像断了，请检查网络连接！'});
                return;
            }
            else{
                var rows=info.data;
                if(rows.length>0){
                    var s4id=rows[0].id;
                    if(password != null && password !="")
                    {
                        var user={
                            name:username,
                            pwd:password,
                            wx_oid:openId+':'+ openId4S,
                            phone:phone,
                            nick:nickName,
                            s4_id:s4id,
                            tel_pwd:"000000000000"
                        };
                    }
                    else
                    {
                        var user={
                            name:username,
                            wx_oid:openId+':'+ openId4S,
                            phone:phone,
                            nick:nickName,
                            s4_id:s4id,
                            tel_pwd:"000000000000"
                        };
                    }
                    if(flag == "update")
                    {
                        sql = "update t_account set ? where id = ?";
                    }
                    else if(flag == "add")
                    {
                       sql="insert into t_account set ?";
                    }
                    var pool = findPool();
                    pool.query(sql,[user,id],function(err, info){
                        if(err){
                            if(flag=="update")
                            {
                                res.json({status:'网络好像断了，请检查网络连接！'});
                                return;
                            }
                            else if(flag == "add")
                            {
                                res.json({status:'网络好像断了，请检查网络连接！'});
                                return;
                            }
                        }
                        else{
                            var accountId=info.insertId;
                            user.id = accountId;
                            req.body.user = user;
                            carEnroll(req,res, function(ex){
                                if(ex) {
//                                    pool.query('DELETE FROM t_account WHERE id=?', [accountId], function(){});
                                    res.json({status:'修改汽车信息失败！'}); return;
                                }
                                res.json({status:'success',accountId:accountId});
                            });
                        }
                    });
                }
                else{
                    res.json({status:'无法识别的appid'});
                    return;
                }
            }
        });
    }
}
//车辆登记
function carEnroll(req,res, cb){
    var params=req.body;
    var obdCode=params.obd_code;
    var brand=params.brand;
    var series=params.series;
    var modelYear=params.modelYear;
    var license=params.license;
    var mileage=params.mileage;
    var age=parseInt(params.age);
    var ageDate=new Date();
    ageDate.setYear(ageDate.getFullYear()-age);
    var disp=params.disp;
    var engine_type=params.engine_type;
    var user=params.user;
    var flag = params.flag;
    var userId = params.id
    if(!user) console.error("===>传入的参数缺少user!!!");

    //var s4Id=user.s4_id;

    var sql="select id from t_car where obd_code=? and s4_id=?";
    dao.findBySql(sql,[obdCode, user.s4_id],function(info){
        if(info.err){
            res.json({status:'网络好像断了，请检查网络连接！'});
            return;
        }
        else{
            var rows=info.data;
             if(rows.length>0){
                 var id=rows[0].id;
                 sql="select count(*) as count from t_car_user where s4_id =? and car_id =? and acc_id !=?";
               dao.findBySql(sql,[user.s4_id,id,userId],function(info){
                 if(info.err)
                 {
                     res.json({status:'网络好像断了，请检查网络连接！'});
                     return;
                 }
                else{
                     console.log(info.data[0].count);
                  if(parseInt(info.data[0].count) > 0)
                  {
                      res.json({status:'该车云终端已经被注册了！'});return;
                  }
                  else{
                    var car={
                        s4_id:user.s4_id,
                        brand:brand,
                        series:series,
                        modelYear:modelYear,
                        license:license,
                        act_type:1,
                        disp:disp,
                        mileage:mileage,
                        age:ageDate,
                        engineType:engine_type,
                        created_date:new Date()
                    };
                    sql="update t_car set ? where id=?";
                    var pool = findPool();
                    pool.query(sql, [car,id], function(ex, result){
                        if(ex){
                            res.json({status:"该车牌号已经被注册过!"});
                            return;
                        }else{
                        // 建立t_car_user;
                        sql="select car_id from t_car_user where s4_id=? and acc_id=? "
                        dao.findBySql(sql,[user.s4_id, userId],function(info){
                            if(info.err){
                                res.json({status:'网络好像断了，请检查网络连接！'});
                                return;
                            }
                            else{
                                if(info.data[0] == null)
                                {
                                     sql = "INSERT t_car_user(s4_id,car_id,user_type,acc_id) values(?,?,?,?)";
                                }
                                else
                                {
                                     sql = "update t_car_user set s4_id=?,car_id=?,user_type=? where acc_id=?";
                                }
                                pool.query(sql, [user.s4_id,  id, 1,userId], function(ex, result){
                                    if(ex) {
                                        res.json({status:"网络好像断了，请检查网络连接！"});
                                        return;
                                    }
                                    console.log("更新成功");
                                    if(cb) { cb(null); }
                                    else res.json({status:"ok"});
                                });
                            }
                        });
                        }
                      });
                   }
                 }
               });
            }
             else{
                res.json({status:'该4S店暂无该车云终端,请核对ID!'});
                 return;
            }

        }
    });
}
//车辆注销
function carRescind(req,res){
    var params=req.body;
    var accountId=params.accountId;
    var carId=params.carId;
}




/*var postData = req.body;
 var pool = this.db();

 postData.owner_flag = parseInt(postData.owner_flag);
 // console.log(postData);

 pool.query('select id from t_wx_user where openid = ?;',[postData.user], function(err, users){
 if (err) { return res.send(400, err); }
 if (users && users.length === 1) {

 return pool.query('select COUNT(*) totalRows from t_wx_user_obd where wx_user_id = ? and obd_code = ?;', [users[0].id, postData.obd_code], function(err, mappings){
 if (err) { return res.send(400, err); }
 if (mappings && mappings.length === 1) {
 if (mappings[0].totalRows === 0) {

 if (postData.owner_flag === 1) {
 return pool.query('select COUNT(*) totalOwners from t_wx_user_obd where owner_flag = 1 and obd_code = ?;', [postData.obd_code], function(err, owners){
 if (err) { return res.send(400, err); }
 if (owners && owners.length === 1) {
 if (owners[0].totalOwners === 1) {
 return res.send(400, new Error('this obd device has already had an owner.'));
 }
 else {
 var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 1, now());';
 var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

 // console.log(sql);
 return pool.query(sql, function(err, result) {
 if (err) { return res.send(400, err); }
 return res.send(200, result);
 });
 }
 }
 else {
 return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
 }
 });
 }
 else {
 var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 0, now());';
 var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

 // console.log(sql);
 return pool.query(sql, function(err, result) {
 if (err) { return res.send(400, err); }
 return res.send(200, result);
 });
 }
 }
 else {
 return res.send(400, new Error('binding is already existed for specific wx user openid and obd_code when enrollment.'));
 }
 }
 else {
 return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
 }
 });
 } else {
 return res.send(400, new Error('zero or multiple rows returned for one specific wx user openid when enrollment.'));
 }
 });*/