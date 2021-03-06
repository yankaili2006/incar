/// <reference path="references.ts" />

module Service{
    // 获取4S店以及第1个admin
    export function Get4SwithAdmin(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,status,prov,city");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4S(page, req.query, (ex:TaskException, total:number, s4s:S4[])=>{
            if(ex) { res.json(ex); return; }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var p1 = new Pagination(1, 1);
                s4s.forEach((s4:S4)=>{
                    s4.GetStaff(p1, {}, (ex, total, staffs)=>{
                        if(total > 0){
                            var cmpx:any = s4.dto;
                            var admin = staffs[0].dto;
                            cmpx.admin_id = admin.id;
                            cmpx.admin_name = admin.name;
                            cmpx.admin_nick = admin.nick;
                            cmpx.admin_phone = admin.phone;
                        }
                        task.finished++;
                        task.end();
                    });
                });
            }

            task.end = ()=>{
                if(task.finished < s4s.length) return;
                var array4SAdmin = DTOBase.ExtractDTOs<DTO.S4>(s4s);
                array4SAdmin.forEach((s4:DTO.S4)=>{
                    // 微信的帐号资料不应返回给客户,仅供内部使用
                    s4.wx_login = undefined;
                    s4.wx_pwd = undefined;
                });
                res.json({status:"ok", totalCount:total, s4s: array4SAdmin});
            };
            task.begin();
        });
    }

    // 增加一个4S店和一个admin
    export function Add4SwithAdmin(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"北五环4S店",
                    status:1,
                    openid:"Uu6t4FYMrAq3xJP0zs",
                    prov:"北京",
                    city:"北京",
                    description:"示范样例",
                    wx_login:"incar",
                    wx_pwd:"4rS&mta",
                    wx_en_name:"InCarTech",
                    wx_status:1,
                    admin_name:"user9",
                    admin_nick:"全智贤",
                    admin_pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    admin_phone:"13912345678",
                    admin_email:"qzx@movie.kr"
                },
                remark:"必填:name,admin_name,admin_pwd"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name;";
        if(!data.admin_name) err += "缺少参数admin_name";
        if(!data.admin_pwd) err += "缺少参数admin_pwd";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var dto:any = { name: data.name };
        if(!isNaN(data.status)) dto.status = data.status;
        else dto.status = 1;
        if(isStringNotEmpty(data.openid)) dto.openid = data.openid;
        if(isStringNotEmpty(data.prov)) dto.prov = data.prov;
        if(isStringNotEmpty(data.city)) dto.city = data.city;
        if(isStringNotEmpty(data.description)) dto.description = data.description;
        if(isStringNotEmpty(data.wx_login)) dto.wx_login = data.wx_login;
        if(isStringNotEmpty(data.wx_pwd)) dto.wx_pwd = data.wx_pwd;
        if(isStringNotEmpty(data.wx_en_name)) dto.wx_en_name = data.wx_en_name;
        if(!isNaN(data.wx_status)) dto.wx_status = data.wx_status;
        if(!isNaN(data.brand)) dto.brand = data.brand;
        if(isStringNotEmpty(data.short_name)) dto.short_name = data.short_name;
        if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
        if(isStringNotEmpty(data.address)) dto.address = data.address;
        if(isStringNotEmpty(data.hotline)) dto.hotline = data.hotline;
        var s4 = new S4(dto);

        var repo = S4Repository.GetRepo();
        repo.Add4S(s4, (ex:TaskException, s4:S4)=>{
            if(ex) { res.json(ex); return; }
            var dto2:any = { name: data.admin_name, pwd: data.admin_pwd, last_login_time:"0000-00-00" };
            if(isStringNotEmpty(data.admin_email)) dto2.email = data.admin_email;
            if(isStringNotEmpty(data.admin_phone)) dto2.phone = data.admin_phone;
            if(isStringNotEmpty(data.admin_nick)) dto2.nick = data.admin_nick;
            else dto2.nick = data.admin_name;
            var staff = new Staff(dto2);
            s4.AddStaff(staff, (ex:TaskException, staff:Staff)=>{
                if(ex) { res.json(new TaskException(-2, "创建4S店成功,但创建4S店管理员失败", ex)); return; }
                var cmpx:any = s4.DTO();
                cmpx.admin_id = staff.dto.id;
                cmpx.admin_name = staff.dto.name;
                cmpx.admin_nick = staff.dto.nick;
                cmpx.admin_phone = staff.dto.phone;
                cmpx.admin_email = staff.dto.email;
                res.json({status:"ok", s4:cmpx});
            });
        });
    }

    // 获取车和它的车主
    export function GetCarwithOwner(req, res){
        res.setHeader("Accept-Query", "page,pagesize,org_id,org_city,brand_id,series_id,acc_nick,acc_phone,license");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s " +
            "FROM t_car_user as U " +
            "JOIN t_account AS A ON U.acc_id = A.id " +
            "JOIN t_car AS C ON U.car_id = C.id " +
            "LEFT OUTER JOIN t_4s AS O ON C.s4_id = O.id " +
            "LEFT OUTER JOIN t_car_dictionary AS S ON C.brand = S.brandCode and C.series = S.seriesCode " +
            "WHERE U.user_type = 1";
        var args = [];
        if(req.query.org_id) {sql += " and C.s4_id = ?"; args.push(req.query.org_id);}
        if(req.query.org_city) { sql += " and O.city = ?"; args.push(req.query.org_city); }
        if(req.query.brand_id) { sql += " and C.brand = ?"; args.push(req.query.brand_id); }
        if(req.query.series_id) { sql += " and C.series = ?"; args.push(req.query.series_id); }
        if(req.query.acc_nick) { sql += " and A.nick = ?"; args.push(req.query.acc_nick); }
        if(req.query.acc_phone) { sql += " and A.phone = ?"; args.push(req.query.acc_phone); }
        if(req.query.license) { sql += " and C.license = ?"; args.push(req.query.license); }

        var sql2 = util.format(sql, "A.id AS acc_id, A.name AS acc_name, A.nick AS acc_nick, A.status AS acc_status, A.phone AS acc_phone, " +
            "O.name AS org_name, O.id AS org_id, " +
            "C.id AS car_id, C.license AS car_license, C.brand AS brand_id, S.brand AS car_brand, C.series AS series_id, S.series AS car_series, C.obd_code, C.sim_number");
        if(page.IsValid()) sql2 += page.sql;
        var sql3 = util.format(sql, "COUNT(*) AS count");

        var task:any = { finished: 0 };
        task.begin = ()=>{
            dac.query(sql2, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            dac.query(sql3, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2 ) return;
            if(task.A.ex) { res.json(new TaskException(-1, "查询车主失败", task.A.ex)); return; }

            var totalCount = 0;
            if(!task.B.ex) totalCount = task.B.result[0].count;

            res.json({status:"ok", totalCount:totalCount, carowners:task.A.result});
        };

        task.begin();
    }

    // 获取含有OBD的车和它的4S店
    export function GetCarwith4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize,license,obd_code,act_type,act_time_begin,act_time_end,sim_number,brand_id,series_id,created_date_begin,created_date_end");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var sql = "SELECT %s FROM t_car C\n" +
            "\tLEFT OUTER JOIN t_4s S on C.s4_id = S.id\n" +
            "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n" +
            "WHERE C.obd_code is not null";
        var args = [];

        var filter = req.query;

        if(filter.license) { sql += " and license = ?"; args.push(filter.license); }
        if(filter.obd_code) { sql += " and obd_code = ?"; args.push(filter.obd_code); }
        if(!isNaN(filter.act_type)) { sql += " and act_type = ?"; args.push(filter.act_type); }
        if(filter.sim_number) { sql += " and sim_number = ?"; args.push(filter.sim_number); }
        if(!isNaN(filter.brand_id)) { sql += " and brand = ?"; args.push(filter.brand_id); }
        if(!isNaN(filter.series_id)) { sql += " and series = ?"; args.push(filter.series_id); }
        if(filter.act_time_begin) { sql += " and act_time >= ?"; args.push(filter.act_time_begin); }
        if(filter.act_time_end) { sql += " and act_time <= ?"; args.push(filter.act_time_end); }
        if(filter.created_date_begin) { sql += " and created_date >= ?"; args.push(filter.created_date_begin); }
        if(filter.created_date_end) { sql += " and created_date <= ?"; args.push(filter.created_date_end); }

        var dac = MySqlAccess.RetrievePool();
        var task:any = { finished:0 };
        task.begin = ()=>{
            var sqlA = util.format(sql, "C.*,D.brand AS brand_name,D.series AS series_name, S.name AS s4_name");
            if(page.IsValid()) sqlA += page.sql;
            dac.query(sqlA, args, (ex, result)=>{
                task.A = { ex: ex, result: result };
                task.finished++;
                task.end();
            });

            var sqlB = util.format(sql, "COUNT(*) count");
            dac.query(sqlB, args, (ex, result)=>{
                task.B = { ex:ex, result:result };
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.A.ex){ res.json(new TaskException(-1, "查询4S店车辆失败", task.A.ex), 0, null); return; }
            var objs = [];
            task.A.result.forEach((dto)=>{
                objs.push(new Car(dto));
            });
            var total = 0;
            if(!task.B.ex) total = task.B.result[0].count;
            var cars = DTOBase.ExtractDTOs(objs);

            res.json({status:"ok", totalCount:total, cars:cars});
        };

        task.begin();
    }

    export function GetCarExtraByOBD(req, res){
        var sql = "SELECT C.*, D.brand AS brand_name, D.series AS series_name, S.name AS s4_name, S.prov AS s4_prov, S.city AS s4_city, A.nick AS cust_name, A.phone AS cust_phone\n" +
            "\tFROM t_car C\n" +
            "\tLEFT OUTER JOIN t_4s S ON C.s4_id = S.id\n" +
            "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand = D.brandCode and C.series = D.seriesCode\n" +
            "\tLEFT OUTER JOIN t_car_user U ON C.id = U.car_id and C.s4_id = U.s4_id and U.user_type = 1\n"+
            "\tLEFT OUTER JOIN t_account A ON A.id = U.acc_id and A.s4_id = U.s4_id\n"+
            "\tWHERE obd_code = ?";
        var args = [req.params.obd_code];

        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, args, (ex, result)=>{
            if(ex) {res.json(new TaskException(-1, "查询OBD失败", ex)); return;}
            if(result.length === 0) {res.json(new TaskException(-1, "查询的OBD不存在", ex)); return;}
            if(result.length > 1) {res.json(new TaskException(-1, "OBD数据错误", ex)); return;}
            var car:Car = new Car(result[0]);
            res.json({status:"ok", car:car.DTO()});
        });
    }
}