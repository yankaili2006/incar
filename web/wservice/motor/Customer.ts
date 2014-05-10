/// <reference path="references.ts" />

module Service{
    export function GetCustomer(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,nick,email,phone,status");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCustomer(page, req.query, (ex, total, customers)=>{
                if(ex) { res.json(ex); return; }
                var arrayCust = DTOBase.ExtractDTOs<DTO.account>(customers);
                arrayCust.forEach((cust:DTO.account)=>{
                    // 密码不应返回给客户,仅供内部使用
                    cust.pwd = undefined;
                    cust.tel_pwd = undefined;
                });
                res.json({status:"ok", totalCount:total, custs: arrayCust});
            });
        });
    }

    export function GetCustomerById(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCustomerById(req.params.cust_id, (ex, cust)=>{
                if(ex) { res.json(ex); return; }
                // 密码不应返回给客户,仅供内部使用
                cust.dto.pwd = undefined;
                cust.dto.tel_pwd = undefined;
                res.json({status:"ok", cust:cust.DTO() });
            });
        });
    }

    export function AddCustomer(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"user9",
                    nick:"全智贤",
                    pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    status:1,
                    phone:"13912345678",
                    email:"qzx@movie.kr",
                    wx_oid:"o1fUutyUmJJHaB_IHJoWXzvJ0AMI",
                    tel_sn:"4456234",
                    tel_pwd:"8cb2237d0679ca88db6464eac60da96345513964",
                    sex:2,
                    city:"首尔",
                    province:"首尔",
                    country:"韩国",
                    language:"kr",
                    headimgurl:"http://lady.dg163.cn/uppic/Remoteupfile/2011-6/29/5J2I16BJH9CH131CEH.jpg"
                },
                remark:"必填:name,pwd"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name;";
        if(!data.pwd) err += "缺少参数pwd";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { name: data.name, pwd: data.pwd, last_login_time:"0000-00-00" };
            if(isStringNotEmpty(data.email)) dto.email = data.email;
            if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
            if(isStringNotEmpty(data.nick)) dto.nick = data.nick;
            else dto.nick = data.name;
            if(isStringNotEmpty(data.wx_oid)) dto.wx_oid = data.wx_oid;
            if(isStringNotEmpty(data.tel_sn)) dto.tel_sn = data.tel_sn;
            if(isStringNotEmpty(data.tel_pwd)) dto.tel_pwd = data.tel_pwd;
            if(isStringNotEmpty(data.city)) dto.city = data.city;
            if(isStringNotEmpty(data.province)) dto.province = data.province;
            if(isStringNotEmpty(data.country)) dto.country = data.country;
            if(isStringNotEmpty(data.language)) dto.language = data.language;
            if(isStringNotEmpty(data.headimgurl)) dto.headimgurl = data.headimgurl;
            if(!isNaN(data.status)) dto.status = data.status;
            if(!isNaN(data.sex)) dto.sex = data.sex;


            var cust = new Customer(dto);
            s4.AddCustomer(cust, (ex:TaskException, cust:Customer)=>{
                if(ex) { res.json(ex); return; }
                // 密码仅供内部使用
                cust.dto.pwd = undefined;
                cust.dto.tel_pwd = undefined;

                res.json({status:"ok", cust:cust.DTO()});
            });
        });
    }

    export function ModifyCustomer(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"user9",
                    nick:"全智贤",
                    pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    status:1,
                    phone:"13912345678",
                    email:"qzx@movie.kr",
                    wx_oid:"o1fUutyUmJJHaB_IHJoWXzvJ0AMI",
                    tel_sn:"4456234",
                    tel_pwd:"8cb2237d0679ca88db6464eac60da96345513964",
                    sex:2,
                    city:"首尔",
                    province:"首尔",
                    country:"韩国",
                    language:"kr",
                    headimgurl:"http://lady.dg163.cn/uppic/Remoteupfile/2011-6/29/5J2I16BJH9CH131CEH.jpg"
                },
                remark:"必填:无"
            });
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { id:req.params.cust_id };
            var data = req.body;
            if(isStringNotEmpty(data.name)) dto.name = data.name;
            if(isStringNotEmpty(data.nick)) dto.nick = data.nick;
            if(isStringNotEmpty(data.pwd)) dto.pwd = data.pwd;
            if(isStringNotEmpty(data.email)) dto.email = data.email;
            if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
            if(isStringNotEmpty(data.wx_oid)) dto.wx_oid = data.wx_oid;
            if(isStringNotEmpty(data.tel_sn)) dto.tel_sn = data.tel_sn;
            if(isStringNotEmpty(data.tel_pwd)) dto.tel_pwd = data.tel_pwd;
            if(isStringNotEmpty(data.city)) dto.city = data.city;
            if(isStringNotEmpty(data.province)) dto.province = data.province;
            if(isStringNotEmpty(data.country)) dto.country = data.country;
            if(isStringNotEmpty(data.language)) dto.language = data.language;
            if(isStringNotEmpty(data.headimgurl)) dto.headimgurl = data.headimgurl;
            if(!isNaN(data.status)) dto.status = data.status;
            if(!isNaN(data.sex)) dto.sex = data.sex;

            var cust = new Customer(dto);
            s4.ModifyCustomer(cust, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export function DeleteCustomer(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }

            s4.DeleteCustomer(req.params.cust_id, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export function AddCarToCustomer(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{ car_id:1, user_type:1 },
                remark:"必填:car_id,user_type(0无效 1车主 2非车主的其它使用人)"
            });
            return;
        }

        var err = "";
        var data = req.body;
        if(isNaN(data.car_id)) err += "缺少参数car_id,";
        if(isNaN(data.user_type)) err+= "缺少参数user_type";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCustomerById(req.params.cust_id, (ex, cust)=>{
                cust.AddCar(data.car_id, data.user_type, (ex:TaskException)=>{
                    if(ex) {res.json(ex); return; }
                    res.json({status:"ok"});
                });
            });
        });
    }

    export class Customer extends DTOBase<DTO.account>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.account{
            var dto:DTO.account = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            if(dto.sex === 1) dto.sex_name = "男";
            else if(dto.sex === 2) dto.sex_name = "女";
            else dto.sex_name = "未知";

            return dto;
        }

        public AddCar(car_id:number, user_type:number, cb:(ex:TaskException)=>void){
            var sql = "INSERT t_car_user(s4_id,car_id,acc_id,user_type)\n" +
                "SELECT s4_id,id,?,? FROM t_car WHERE s4_id = ? and id = ?";
            var args = [this.dto.id, user_type, this.dto.s4_id, car_id];
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "向顾客添加车辆失败", ex)); return; }
                if(result.affectedRows === 0) { cb(new TaskException(-1, util.format("向4S店(id=%s)顾客添加车辆失败,被添加的车辆(id=%s)不存在", this.dto.s4_id,car_id), null)); return; }
                if(result.affectedRows > 1) { cb(new TaskException(-1, util.format("4S店(id=%s)车辆(id=%s)数据错误",this.dto.s4_id,car_id), null)); return; }
                cb(null);
            });
        }
    }
}