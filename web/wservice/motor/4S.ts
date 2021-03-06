/// <reference path="references.ts" />

module Service{
    export function Get4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,status,prov,city");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var repo = S4Repository.GetRepo();
        repo.Get4S(page, req.query, (ex, total, result)=>{
            if(ex){ res.json(ex); return; }
            var array4s = DTOBase.ExtractDTOs<DTO.S4>(result);
            array4s.forEach((s4:DTO.S4)=>{
                // 微信的帐号资料不应返回给客户,仅供内部使用
                s4.wx_login = undefined;
                s4.wx_pwd = undefined;
            });
            res.json({status:"ok", totalCount:total, s4s: array4s});
        });
    }

    export function Get4SById(req, res){
        var repo = S4Repository.GetRepo();
        repo.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(ex); return; }
            var target = s4.DTO();
            // 微信的帐号资料不应返回给客户,仅供内部使用
            target.wx_login = undefined;
            target.wx_pwd = undefined;
            res.json({status:"ok", s4:target});
        });
    }

    export function Add4S(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"北五环4S店",
                    short_name:"5ring4s.com",
                    status:1,
                    openid:"Uu6t4FYMrAq3xJP0zs",
                    prov:"北京",
                    city:"北京",
                    description:"示范样例",
                    wx_login:"incar",
                    wx_pwd:"4rS&mta",
                    wx_en_name:"InCarTech",
                    wx_status:1
                },
                remark:"必填:name"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name";
        if(!data.short_name) err += "缺少参数short_name";
        var regexName = new RegExp("^[a-z0-9_\\.]{3,32}$", "i");
        if(!regexName.test(data.short_name)) err += 'short_name只能由数字或字母组成,最少3字符,最多32字符;';
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var dto:any = { name: data.name, short_name:data.short_name };
        if(!isNaN(data.status)) dto.status = data.status;
        else dto.status = 1;
        if(isStringNotEmpty(data.openid)) dto.openid = data.openid;
        if(isStringNotEmpty(data.prov)) dto.prov = data.prov;
        if(isStringNotEmpty(data.city)) dto.city = data.city;
        if(isStringNotEmpty(data.description)) dto.description = data.description;
        if(isStringNotEmpty(data.wx_login)) dto.wx_login = data.wx_login;
        if(isStringNotEmpty(data.wx_pwd)) dto.wx_pwd = data.wx_pwd;
        if(isStringNotEmpty(data.wx_app_name)) dto.wx_app_name = data.wx_app_name;
        if(isStringNotEmpty(data.wx_app_id)) dto.wx_app_id = data.wx_app_id;
        if(isStringNotEmpty(data.wx_app_secret)) dto.wx_app_secret = data.wx_app_secret;
        if(isStringNotEmpty(data.wx_oauth_addr)) dto.wx_oauth_addr = data.wx_oauth_addr;
        if(!isNaN(data.wx_status)) dto.wx_status = data.wx_status;
        if(!isNaN(data.brand)) dto.brand = data.brand;
        if(isStringNotEmpty(data.address)) dto.address = data.address;
        if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
        if(isStringNotEmpty(data.hotline)) dto.hotline = data.hotline;
        if(isStringNotEmpty(data.logo_url)) dto.openid = data.logo_url;
        var s4 = new S4(dto);

        var repo = S4Repository.GetRepo();
        repo.Add4S(s4, (ex:TaskException, s4:S4)=>{
            if(ex) { res.json(ex); return; }
            res.json({status:"ok", s4:s4.DTO() });
        });
    }

    export function Modify4S(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"北五环4S店",
                    short_name:"5ring4s.com",
                    status:1,
                    openid:"Uu6t4FYMrAq3xJP0zs",
                    prov:"北京",
                    city:"北京",
                    description:"示范样例",
                    wx_login:"incar",
                    wx_pwd:"4rS&mta",
                    wx_en_name:"InCarTech",
                    wx_status:1,
                    brand:8,
                    logo_url:"/data/upload/34p.jpg",
                    address:"海淀区黄庄35号",
                    phone:"13912345678",
                    hotline:"400-1234-6789"
                },
                remark:"必填:无"
            });
            return;
        }
        
        var data = req.body;
        if(isStringNotEmpty(data.short_name)) {
            var regexName = new RegExp("^[a-z0-9_\\.]{3,32}$", "i");
            if (!regexName.test(req.body.short_name))
                res.json(new TaskException(-1, "short_name只能由数字或字母组成,最少3字符,最多32字符", null));
        }

        var dto:any = { id: req.params.s4_id };
        if(isStringNotEmpty(data.name)) dto.name = data.name;
        if(isStringNotEmpty(data.short_name)) dto.short_name = data.short_name;
        if(!isNaN(data.status)) dto.status = data.status;
        if(isStringNotEmpty(data.openid)) dto.openid = data.openid;
        if(isStringNotEmpty(data.prov)) dto.prov = data.prov;
        if(isStringNotEmpty(data.city)) dto.city = data.city;
        if(isStringNotEmpty(data.description)) dto.description = data.description;
        if(isStringNotEmpty(data.wx_login)) dto.wx_login = data.wx_login;
        if(isStringNotEmpty(data.wx_pwd)) dto.wx_pwd = data.wx_pwd;
        if(isStringNotEmpty(data.wx_app_name)) dto.wx_app_name = data.wx_app_name;
        if(isStringNotEmpty(data.wx_app_id)) dto.wx_app_id = data.wx_app_id;
        if(isStringNotEmpty(data.wx_app_secret)) dto.wx_app_secret = data.wx_app_secret;
        if(isStringNotEmpty(data.wx_oauth_addr)) dto.wx_oauth_addr = data.wx_oauth_addr;
        if(!isNaN(data.wx_status)) dto.wx_status = data.wx_status;
        if(!isNaN(data.brand)) dto.brand = data.brand;
        if(isStringNotEmpty(data.logo_url)) dto.logo_url = data.logo_url;
        if(isStringNotEmpty(data.address)) dto.address = data.address;
        if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
        if(isStringNotEmpty(data.hotline)) dto.hotline = data.hotline;

        var s4 = new S4(dto);

        var repo = S4Repository.GetRepo();
        repo.Modify4S(s4, (ex:TaskException)=>{
            if(ex) { res.json(ex); return; }
            res.json({status:"ok"});
        });
    }

    export class S4Repository{
        static GetRepo():S4Repository{
            var repo = new S4Repository();
            return repo;
        }

        private dac:any;

        constructor(){
            this.dac = MySqlAccess.RetrievePool();
        }

        Get4S(page:Pagination, filter:any, cb:(ex:TaskException, total:number, result:S4[])=>void){
            var sql = "SELECT %s FROM t_4s WHERE 1=1";
            var args = [];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.status) { sql += " and status = ?"; args.push(filter.status); }
            if(filter.prov) { sql += " and prov = ?"; args.push(filter.prov); }
            if(filter.city) { sql += " and city = ?"; args.push(filter.city); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
                if(page.IsValid()) sqlA += page.sql;
                this.dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex: ex, result: result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                this.dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店失败", task.A.ex), 0, null); return; }
                var objs = new Array<S4>();
                task.A.result.forEach((dto)=>{
                    objs.push(new S4(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }

        Get4SById(id:number, cb:(ex:TaskException, result:S4)=>void){
            var sql = "SELECT * FROM t_4s WHERE id = ?";
            this.dac.query(sql, [id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询4S店失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, util.format("指定的4S店不存在(id=%s)", id), null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-3, util.format("4S店数据异常(id=%s)", id), null), null); return; }
                cb(null, new S4(result[0]));
            });
        }

        Add4S(s4:S4, cb:(ex:TaskException, s4:S4)=>void){
            var sql = "INSERT t_4s SET ?";
            this.dac.query(sql, [s4.dto], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "增加4S店失败", ex), null); return; }
                s4.dto.id = result.insertId;
                cb(null, s4);
            });
        }

        Modify4S(s4:S4, cb:(ex:TaskException)=>void){
            var sql = "UPDATE t_4s SET ? WHERE id = ?";
            this.dac.query(sql, [s4.dto, s4.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改4S店失败", ex)); return; }
                if(result.affectedRows === 0){ cb(new TaskException(-2, util.format("指定的4S店(id=%s)不存在", s4.dto.id), null)); return; }
                cb(null);
            });
        }
    }

    export class S4 extends DTOBase<DTO.S4>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.S4{
            var dto:DTO.S4 = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            return dto;
        }

        public GetStaff(page:Pagination, filter:any, cb:(ex:TaskException, total:number, staffs:Staff[])=>void){
            var sql = "SELECT %s FROM t_staff WHERE s4_id = ?";
            var args = [this.dto.id];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.nick) { sql += " and nick = ?"; args.push(filter.nick); }
            if(filter.email) { sql += " and email = ?"; args.push(filter.email); }
            if(filter.phone) { sql += " and phone = ?"; args.push(filter.phone); }
            if(!isNaN(filter.status)) { sql += " and status = ?"; args.push(filter.status); }

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
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
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店员失败", task.A.ex), 0, null); return; }
                var objs = [];
                task.A.result.forEach((dto)=>{
                    objs.push(new Staff(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }

        public GetStaffById(id:number, cb:(ex:TaskException, staff:Staff)=>void){
            var sql = "SELECT * FROM t_staff WHERE s4_id = ? and id = ?";
            var args = [this.dto.id, id];

            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询店员失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, "指定的店员不存在", null), null); return; }
                else if(result.length > 1){ cb(new TaskException(-32, "店员数据错误", null), null); return; }
                var staff = new Staff(result[0]);
                cb(null, staff);
            });
        }

        public AddStaff(staff:Staff, cb:(ex:TaskException, staff:Staff)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            staff.dto.s4_id = this.dto.id;

            var dac = MySqlAccess.RetrievePool();
            var sql = "INSERT t_staff SET ?";
            dac.query(sql, [staff.dto], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "增加4S店员失败", ex), null); return; }
                staff.dto.id = result.insertId;
                cb(null, staff);
            });
        }

        public ModifyStaff(staff:Staff, cb:(ex:TaskException)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            staff.dto.s4_id = this.dto.id;

            var sql = "UPDATE t_staff SET ? WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [staff.dto, staff.dto.id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改4S店员失败", ex)); return; }
                if(result.affectedRows === 0){ cb(new TaskException(-2, util.format("指定的4S店员(4s=%s,id=%s)不存在", this.dto.id, staff.dto.id), null)); return; }
                cb(null);
            });
        }

        public DeleteSatff(staff_id:number, cb:(ex:TaskException)=>void){
            var sql = "DELETE from t_staff WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [staff_id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除4S店员失败", ex)); return; }
                cb(null);
            });
        }

        public GetCustomer(page:Pagination, filter:any, cb:(ex:TaskException, total:number, customers:Customer[])=>void){
            var sql = "SELECT %s FROM t_account WHERE s4_id = ?";
            var args = [this.dto.id];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.nick) { sql += " and nick = ?"; args.push(filter.nick); }
            if(filter.email) { sql += " and email = ?"; args.push(filter.email); }
            if(filter.phone) { sql += " and phone = ?"; args.push(filter.phone); }
            if(!isNaN(filter.status)) { sql += " and status = ?"; args.push(filter.status); }

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
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
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店顾客失败", task.A.ex), 0, null); return; }
                var objs = [];
                task.A.result.forEach((dto)=>{
                    objs.push(new Customer(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }

        public GetCustomerById(id:number, cb:(ex:TaskException, cust:Customer)=>void){
            var sql = "SELECT * FROM t_account WHERE s4_id = ? and id = ?";
            var args = [this.dto.id, id];

            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询4S店顾客失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, "指定的4S店顾客不存在", null), null); return; }
                else if(result.length > 1){ cb(new TaskException(-32, "4S店顾客数据错误", null), null); return; }
                var cust = new Customer(result[0]);
                cb(null, cust);
            });
        }

        public AddCustomer(cust:Customer, cb:(ex:TaskException, cust:Customer)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            cust.dto.s4_id = this.dto.id;

            var dac = MySqlAccess.RetrievePool();
            var sql = "INSERT t_account SET ?";
            dac.query(sql, [cust.dto], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "增加4S店顾客失败", ex), null); return; }
                cust.dto.id = result.insertId;
                cb(null, cust);
            });
        }

        public ModifyCustomer(cust:Customer, cb:(ex:TaskException)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            cust.dto.s4_id = this.dto.id;

            var sql = "UPDATE t_account SET ? WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [cust.dto, cust.dto.id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改4S店顾客失败", ex)); return; }
                if(result.affectedRows === 0){ cb(new TaskException(-2, util.format("指定的4S店顾客(4s=%s,id=%s)不存在", this.dto.id, cust.dto.id), null)); return; }
                cb(null);
            });
        }

        public DeleteCustomer(cust_id:number, cb:(ex:TaskException)=>void){
            var sql = "DELETE from t_account WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [cust_id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除4S店顾客失败", ex)); return; }
                cb(null);
            });
        }

        public GetCar(page:Pagination, filter:any, cb:(ex:TaskException, total:number, cars:Car[])=>void){
            var sql = "SELECT %s FROM t_car C\n" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n" +
                "WHERE C.s4_id = ?";
            var args = [this.dto.id];

            if(isStringNotEmpty(filter.has_obd)) {
                if (filter.has_obd == "true") sql += " and C.obd_code is not null";
                else sql += " and C.obd_code is null";
            }

            if(filter.license) { sql += " and C.license = ?"; args.push(filter.license); }
            if(filter.obd_code) { sql += " and C.obd_code = ?"; args.push(filter.obd_code); }
            if(!isNaN(filter.act_type)) { sql += " and C.act_type = ?"; args.push(filter.act_type); }
            if(filter.sim_number) { sql += " and C.sim_number = ?"; args.push(filter.sim_number); }
            if(!isNaN(filter.brand)) { sql += " and C.brand = ?"; args.push(filter.brand); }
            if(!isNaN(filter.series)) { sql += " and C.series = ?"; args.push(filter.series); }

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "C.*,D.brand AS brand_name, D.series AS series_name");
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
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店车辆失败", task.A.ex), 0, null); return; }
                var objs = [];
                task.A.result.forEach((dto)=>{
                    objs.push(new Car(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }

        public GetCarById(id:number, cb:(ex:TaskException, car:Car)=>void){
            var sql = "SELECT * FROM t_car WHERE s4_id = ? and id = ?";
            var args = [this.dto.id, id];

            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询4S店车辆失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, "指定的4S店车辆不存在", null), null); return; }
                else if(result.length > 1){ cb(new TaskException(-32, "4S店车辆数据错误", null), null); return; }
                var car = new Car(result[0]);
                cb(null, car);
            });
        }

        public AddCar(car:Car, cb:(ex:TaskException, car:Car)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            car.dto.s4_id = this.dto.id;
            car.dto.created_date = new Date();

            var dac = MySqlAccess.RetrievePool();
            var sql = "INSERT t_car SET ?";
            dac.query(sql, [car.dto], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "向4S店增加车辆失败", ex), null); return; }
                car.dto.id = result.insertId;
                cb(null, car);
            });
        }

        public ModifyCar(car:Car, cb:(ex:TaskException)=>void){
            // 强制被加入4S店的店员s4_id和4S店id相匹配
            car.dto.s4_id = this.dto.id;

            var sql = "UPDATE t_car SET ? WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [car.dto, car.dto.id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改4S店车辆失败", ex)); return; }
                if(result.affectedRows === 0){ cb(new TaskException(-2, util.format("指定的4S店车辆(4s=%s,id=%s)不存在", this.dto.id, car.dto.id), null)); return; }
                cb(null);
            });
        }

        public DeleteCar(car_id:number, cb:(ex:TaskException)=>void){
            var sql = "DELETE from t_car WHERE id = ? and s4_id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [car_id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除4S店车辆失败", ex)); return; }
                cb(null);
            });
        }

        public GetActivities(page:Pagination, filter:any, cb:(ex:TaskException, totalCount:number, acts:Activity[])=>void){
            var sql = "SELECT %s FROM t_activity WHERE s4_id=?";
            var args:Array<Object> = [this.dto.id];

            if(filter.status) { sql += " and status = ?"; args.push(filter.status); }
            if(filter.tm_start_begin) { sql += " and tm_start >= ?"; args.push(filter.bm_start_begin); }
            if(filter.tm_start_end) { sql += " and tm_start <= ?"; args.push(filter.bm_start_end); }
            if(filter.month) { sql += " and MONTH(tm_start) = ?"; args.push(filter.month); }
            if(filter.title) { sql += " and title like ?"; args.push("%"+filter.title+"%"); }

            sql += "\nORDER BY tm_start DESC";

            var dac = MySqlAccess.RetrievePool();

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql,"*");
                dac.query(sqlA, args, (ex,result)=>{
                    task.A = { ex:ex, result:result };
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
                if(task.A.ex) { cb(new TaskException(-1, "查询活动失败", task.A.ex),0,null); return; }

                var totalCount = 0;
                if(!task.B.ex) totalCount = task.B.result[0].count;

                var acts = [];
                task.A.result.forEach((dto:any)=>{
                    var act = new Activity(dto);
                    acts.push(act);
                });

                cb(null, totalCount, acts);
            };

            task.begin();
        }

        public GetActivity(act_id:number, cb:(ex:TaskException, act:Activity)=>void){
            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sql = "SELECT * FROM t_activity WHERE s4_id = ? and id = ?";
                var args = [this.dto.id, act_id];
                dac.query(sql, args, (ex, result)=>{
                    if(ex) { cb(new TaskException(-1, "查询活动失败", ex), null); return; }
                    else if(result.length === 0) { cb(new TaskException(-1, "指定的活动不存在", null), null); return; }
                    else if(result.length > 1) { cb(new TaskException(-1, "活动数据错误", null), null); return; }
                    this.GetTemplate(result[0].template_id, (ex, template)=>{
                        if(ex) { cb(new TaskException(-1, "查询活动模版出错", ex), null); return;};
                        var fnCreate = Service[template.dto.template];
                        if(!fnCreate) { cb(new TaskException(-1, util.format("活动模版参数template类型%s无效", template.dto.template), null), null); return; }
                        var act = new fnCreate(result[0]);
                        act.LoadExtra((ex, act)=>{
                            if(ex) { cb(ex, act); return }
                            cb(null, act);
                        });
                    });
                });
            };
            task.begin();
        }

        public GetTemplates(page:Pagination, filter:any, cb:(ex:TaskException, totalCount:number, templates:Template[])=>void){
            var sql = "SELECT %s FROM t_activity_template WHERE s4_id=?";
            var dac = MySqlAccess.RetrievePool();

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql,"*");
                dac.query(sqlA, [this.dto.id], (ex,result)=>{
                    task.A = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                dac.query(sqlB, [this.dto.id], (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex) { cb(new TaskException(-1, "查询活动失败", task.A.ex),0,null); return; }

                var totalCount = 0;
                if(!task.B.ex) totalCount = task.B.result[0].count;

                var acts = [];
                task.A.result.forEach((dto:any)=>{
                    var act = new Template(dto);
                    acts.push(act);
                });

                cb(null, totalCount, acts);
            };

            task.begin();
        }

        public GetTemplate(tpl_id:number, cb:(ex:TaskException, template:Template)=>void){
            var sql : string;
            if(isNaN(tpl_id)) sql = "SELECT * FROM t_activity_template WHERE template = ? and s4_id=?";
            else sql = "SELECT * FROM t_activity_template WHERE id = ? and s4_id=?";

            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [tpl_id, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询活动模版失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, "指定的活动模版不存在", null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-3, "模版数据存在错误", null), null); return; }
                var template = new Template(result[0]);
                cb(null, template);
            });
        }

        public GetWork(filter:any, page:Pagination, cb:(ex, total:number, works:Array<any>)=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT %s\n" +
                "FROM t_work W\n" +
                "\tLEFT OUTER JOIN t_account U ON W.cust_id = U.id\n" +
                "\tLEFT OUTER JOIN t_car C ON W.car_id = C.id\n" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand = D.brandCode and C.series = D.seriesCode\n" +
                "WHERE W.org_id = ?";
            var args = [this.dto.id];

            if(isStringNotEmpty(filter.work)){ sql += " and W.work = ?"; args.push(filter.work); }
            if(isStringNotEmpty(filter.step)){ sql += " and W.step = ?"; args.push(filter.step); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "COUNT(*) count");
                dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "W.*, U.nick, U.phone, C.license, D.brand AS brand_name, D.series AS series_name");
                if(page.IsValid()) sqlB += page.sql;
                dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.B.ex) { cb(new TaskException(-1, "查询工作失败", task.B.ex), 0, null); return; }
                var total = 0;
                if(!task.A.ex) total = task.A.result[0].count;
                cb(null, total, task.B.result);
            };

            task.begin();
        }
    }
}