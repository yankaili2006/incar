/// <reference path="references.ts" />

var mTag :any = require('../obdService/tag');
var mMySQL:any = require('mysql');

module Service{
    export function GetTemplates(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplates(page, req.query, (ex, total, templates)=>{
                if(ex) {res.json(ex); return;}
                var tmps = DTOBase.ExtractDTOs(templates);
                res.json({status:"ok", totalCount:total, templates:tmps});
            });
        });
    }

    export function GetActivities(req, res){
        res.setHeader("Accept-Query", "page,pagesize,status,tm_start_begin,tm_start_end,month,title");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivities(page, req.query, (ex, total, acts)=>{
                if(ex) {res.json(ex); return;}
                var activities = DTOBase.ExtractDTOs(acts);
                res.json({status:"ok", totalCount:total, activities:activities});
            });
        });

        Service.ActivityGo();
    }

    export function GetActivitiesByTemplate(req, res){
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplate(req.params.tpl_id, (ex, template)=>{
                if(ex) { res.json(new TaskException(-2, "查询活动模版失败", ex)); return; }
                var fnLoadActs = Service[template.dto.template].LoadActivities;
                if(!fnLoadActs) { res.json(new TaskException(-3, util.format("活动模版参数template类型%s无效", template.dto.template), null)); return;}
                fnLoadActs(res, page, req.query, template, s4.dto.id, (ex, total, acts)=>{
                    if(ex) { res.json(ex); return; }
                    var dtos = DTOBase.ExtractDTOs(acts);
                    res.json({status:"ok", totalCount:total, activities:dtos});
                });
            });
        });

        Service.ActivityGo();
    }

    export function GetActivity(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                res.json({status:"ok", activity:act.DTO()});
            });
        });

        Service.ActivityGo();
    }

    export function GetActivityMembers(req, res){
        var page = new Pagination(req.query.page,req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.GetMembers(res, page, req.query, (ex, total, members)=>{
                    if(ex) { res.json(ex); return;}
                    var dtos = DTOBase.ExtractDTOs(members);
                    res.json({status:"ok", totalCount:total, members:dtos});
                });
            });
        });
    }

    export function GetActivityMember(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.GetMember(req.params.acc_id, (ex, member)=>{
                    if(ex) { res.json(ex); return;}
                    var dto = member.DTO();
                    res.json({status:"ok", member:dto});
                });
            });
        });
    }

    export function CreateActivity(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    title:"节油大赛2014年第3期(6月)",
                    brief:"活动规则:...",
                    tm_announce:'2014-05-20 9:00',
                    tm_start:'2014-06-01 9:00',
                    tm_end:'2014-06-20 18:00',
                    min_milage:200,
                    logo_url:'/upload/img/1.jpg',
                    tags:'23,75,234,112'
                },
                remark:"必填:title"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.title) { err += "缺少参数title"; }
        if(err.length > 0){
            res.json(new TaskException(-1, err, null));
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplate(req.params.tpl_id, (ex, template)=>{
                if(ex) { res.json(-2, "查询活动模版失败", ex); return; }
                var fnActX = Service[template.dto.template];
                if(!fnActX) { res.json(new TaskException(-3, util.format("活动模版参数template类型%s无效", template.dto.template), null)); return;}
                var act = new fnActX(req.body);
                act.dto.s4_id = s4.dto.id;
                act.dto.template_id = template.dto.id;
                act.Create((ex, id)=>{
                    if(ex) { res.json(ex); return; }
                    res.json({status:"ok", id:id});
                });
            });
        });
    }

    export function ModifyActivity(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                putSample:{
                    title:"节油大赛2014年第3期(6月)",
                    brief:"活动规则:...",
                    tm_announce:'2014-05-20 9:00',
                    tm_start:'2014-06-01 9:00',
                    tm_end:'2014-06-20 18:00',
                    min_milage:200,
                    logo_url:'/upload/img/1.jpg',
                    tags:'23,75,234,112'
                },
                remark:"必填:无"
            });
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.dto = req.body;
                // 强制ID不变
                act.dto.id = req.params.act_id;
                act.Modify((ex)=>{
                    if(ex) { res.json(new TaskException(-1, "修改活动失败", ex)); return; }
                    res.json({status:"ok"});
                });
            });
        });
    }

    export function DeleteActivity(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}

                act.Delete((ex)=>{
                    if(ex) { res.json(new TaskException(-1, "删除活动失败", ex)); return; }
                    res.json({status:"ok"});
                });
            });
        });
    }

    export function ActivityExFn(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                var exfn = act[req.params.exfn];
                if(!exfn) { res.send(404); return; }
                exfn.call(act, req, res);
            });
        });
    }

    export function ActivityGo(){
        console.log("更新活动状态...");
        var dac = MySqlAccess.RetrievePool();
        var sql = [
            "UPDATE t_activity SET status = 2 WHERE status = 1 and tm_announce <= CURRENT_TIMESTAMP",
            "UPDATE t_activity SET status = 3 WHERE status = 2 and tm_start <= CURRENT_TIMESTAMP",
            "UPDATE t_activity SET status = 4 WHERE status = 3 and tm_end < CURRENT_TIMESTAMP",
        ];
        dac.query(sql[0], null, (ex, result)=>{
            if(ex) { console.log("更新活动状态失败status=1->2"); }
            dac.query(sql[1], null, (ex, result)=>{
                if(ex) { console.log("更新活动状态失败status=2->3"); }
                dac.query(sql[2], null, (ex, result)=>{
                    if(ex) { console.log("更新活动状态失败status=3->4"); }
                });
            });
        });
    }

    export class Activity extends DTOBase<DTO.activity>{
        constructor(dto){
            super(dto);
        }

        public LoadExtra(cb:(ex:TaskException, act:Activity)=>void){
            cb(null, this);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            if(dto.status === 1) dto.status_name = "已创建";
            else if(dto.status === 2) dto.status_name = "已发布";
            else if(dto.status === 3) dto.status_name = "已开始";
            else if(dto.status === 4) dto.status_name = "已结束";
            else if(dto.status === 5) dto.status_name = "已公布";
            else if(dto.status === 6) dto.status_name = "已取消";

            return dto;
        }

        public GetMembers(res:any, page:Pagination, filter:any, cb:(ex:TaskException, total:number, members:ActivityMember[])=>void){
            res.setHeader("Accept-Query", "page,pagesize,status");
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT %s\n" +
                "FROM t_activity_member M\n" +
                "WHERE M.act_id=?";
            var args = [this.dto.id];

            if(filter.status){ sql += " and M.status=?"; args.push(filter.status); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "M.*,");
                if(page.IsValid()) sqlA += page.sql;
                dac.query(sqlA, args, (ex, result)=>{
                    task.A = {ex:ex, result:result};
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
                if(task.A.ex) { cb(new TaskException(-1, "查询活动成员失败", task.A.ex), 0, null); return; }
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;
                var members = [];
                task.A.result.forEach((dto:any)=>{
                    var m = new ActivityMember(dto);
                    members.push(m);
                });
                cb(null, total, members);
            };

            task.begin();
        }

        public GetMember(acc_id:number, cb:(ex:TaskException, member:ActivityMember)=>void) {
            var sql = "SELECT * FROM t_activity_member WHERE act_id=? and cust_id=?";
            var args = [this.dto.id, acc_id];
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询活动成员失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-1, "指定的活动成员不存在", null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-1, "活动成员数据错误", null), null); return; }
                var member = new ActivityMember(result[0]);
                cb(null, member);
            });
        }

        public Create(cb:(ex:TaskException, id:number)=>void){
            var dac = MySqlAccess.RetrievePool();
            var dto:any = this.dto;

            var sql = "INSERT t_activity SET tm_created=CURRENT_TIMESTAMP, ?";
            var dtoAct = {
                s4_id:      dto.s4_id,
                template_id:dto.template_id,
                title:      dto.title,
                brief:      dto.brief,
                status:     1,
                tm_announce:dto.tm_announce,
                tm_start:   dto.tm_start,
                tm_end:     dto.tm_end,
                logo_url:   dto.logo_url,
                tags:       dto.tags
            };
            dac.query(sql, [dtoAct], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "创建活动失败", ex), null); return; }
                this.dto.id = result.insertId;
                this.ResolveMembers(cb);
            });
        }

        public Modify(cb:(ex:TaskException)=>void){
            var dto : any = { id:this.dto.id };
            if(this.dto.title) dto.title = this.dto.title;
            if(this.dto.brief) dto.brief = this.dto.brief;
            if(this.dto.awards) dto.awards = this.dto.awards;
            if(!isNaN(this.dto.status)) dto.status = this.dto.status;
            if(this.dto.tm_announce) dto.tm_announce = this.dto.tm_announce;
            if(this.dto.tm_start) dto.tm_start = this.dto.tm_start;
            if(this.dto.tm_end) dto.tm_end = this.dto.tm_end;
            if(this.dto.tm_publish) dto.tm_publish = this.dto.tm_publish;
            if(this.dto.logo_url) dto.logo_url = this.dto.logo_url;
            if(this.dto.tags) dto.tags = this.dto.tags;

            var sql = "UPDATE t_activity SET ? WHERE id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [dto, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改活动失败", ex)); return; }
                else if(result.affectedRows === 0) { cb(new TaskException(-1, "指定的活动已不存在", null)); return; }
                // 更新活动成员(删除后再添加)
                var sqlDel = "DELETE FROM t_activity_member WHERE act_id=?";
                dac.query(sqlDel, [this.dto.id], (ex, result)=>{
                    this.ResolveMembers((ex, id)=>{
                        cb(ex);
                    });
                });
            });
        }

        public Delete(cb:(ex:TaskException)=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "DELETE FROM t_activity_member WHERE act_id=?";
            dac.query(sql, [this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除活动成员失败", ex)); return;}
                var sql = "DELETE FROM t_activity WHERE id = ?";
                dac.query(sql, [this.dto.id], (ex, result)=>{
                    if(ex) {cb(new TaskException(-2, "删除活动失败", ex)); return;}
                    cb(null);
                });
            });
        }

        public ResolveMembers(cb:(ex:TaskException, id:number)=>void){
            // 解析活动的成员 this.dto.tags;
            var cbx = (data)=> {
                if (data.status !== 'failure') {
                    var i = 0, values = '';
                    while (i < data.length) {
                        if (i > 0) values += "\nUNION ";
                        values += util.format("SELECT %s,%s,%s", this.dto.id, data[i].accountId, data[i].carId);
                        i++;
                    }
                    if (data.length > 0) {
                        var dac = MySqlAccess.RetrievePool();
                        var sql = util.format("INSERT t_activity_member(act_id,cust_id,ref_car_id) SELECT * FROM (%s) T",values);
                        dac.query(sql, null, (ex, result)=>{
                            dac.query("UPDATE t_activity_member SET ref_tags=?, ref_tag_tm=CURRENT_TIMESTAMP WHERE act_id=?",
                                [this.dto.tags, this.dto.id], (ex, result)=>{});
                        });
                    }
                }
                cb(null, this.dto.id);
            };

            var req = { params:{ tags: this.dto.tags } };
            var res = { json: cbx };
            mTag.searchByTags(req, res);
        }
    }

    export class Template extends DTOBase<DTO.activity_template>{
        constructor(dto){
            super(dto);
        }
    }

    export class ActivityMember extends DTOBase<DTO.activity_member>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity_member{
            var dto:DTO.activity_member = super.DTO();

            if(dto.status === 0) dto.status_name = "邀请";
            else if(dto.status === 1) dto.status_name = "报名";
            else if(dto.status === 2) dto.status_name = "参加";
            else if(dto.status === 3) dto.status_name = "退出";
            else if(dto.status === 4) dto.status_name = "被拒";

            return dto;
        }
    }

    class ActivityScheduler{
        private _job:any = null;

        public start(){
            var cron:any = require('cron');
            console.log("每5分钟更新一次活动状态");
            this._job = new cron.CronJob("00 */5 * * * *", ()=>{
                Service.ActivityGo();
            }, null, true);
            this._job.start();
        }
    }

    var schedulerAct =  new ActivityScheduler();
    schedulerAct.start();
}