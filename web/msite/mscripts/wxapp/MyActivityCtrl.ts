/// <reference path="wxApp.ts" />
module wxApp {
    export class MyActivityCtrl{
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);

            // 注册filter
            _module.filter('act_status_name', ()=>{
                return (input)=>{
                    var status_name = "无效";
                    if (input == 2) status_name = "已公告";
                    else if (input == 3) status_name = "进行中";
                    else if (input == 4) status_name = "已结束";
                    else if (input == 5) status_name = "结果已发布";
                    return status_name;
                };
            });

            _module.filter('act_my_status_name', ()=>{
                return (input)=>{
                    var status_name = "无效";
                    if (input == 1) status_name = "已报名";
                    else if (input == 2) status_name = "已参加";
                    else if (input == 3) status_name = "已退出";
                    else if (input == 4) status_name = "被拒绝";
                    return status_name;
                };
            });
        }

        private init = ($scope, $location, $http) => {
            this.user_openid = $location.search().user;
            this.$http = $http;
            this.$scope = $scope;
            this.$location = $location;

            $scope.$on('$locationChangeStart', this.onSwitchView);

            if(this.user_openid){
                // have gotten the open_id
                this.searchUser();
            }
            else{
                // 尚未得到open_id
                var wxoa = new WXOAuth($location);
                wxoa.findUserOpenId((data)=>{
                    if(!data.openid) this.openUpbox(data);
                    // 已经获取了open_id,查询数据
                    this.user_openid = data.user_openid;
                    this.searchUser();
                });
            }
            this.countPageClick("1","10",this.user_openid); //原文点击记录
            $scope.model = this;

            // 微信分享
            var wxs = new WXShare();
            var base = window.location.href.match(/\w+:\/\/[^\/]+/);
            var pic = $("meta[name=wx-share-pic]").attr("content");
            wxs.wxShare($("title").text(), window.location.href, base+pic, "");
        };

        //原文点击记录--by jl 07/21/14
        private countPageClick = (countType,pageId,wx_oid)=>{
            this.$http.post('/mservice/countData', {countType:countType,pageId:pageId,wx_oid:wx_oid})
                .success((data)=>{
                    if(data.status == "ok")
                    {
                        console.log(data.status);
                    }else{
                        this.openUpbox(data.status);
                    }
                })
                .error((data)=>{
                    this.openUpbox(data.status);
                });
        };

        private closeUpbox =()=>{
            this.tips = "";
            this.cover_show = false;
            this.upbox_show = false;
        }
        private openUpbox =(tips)=>{
            this.tips = tips;
            this.cover_show = true;
            this.upbox_show = true;
        }

        private searchUser = () => {
            this.$http.post("/mservice/infoConfig", { user:this.user_openid }, {dataType:"json"})
                .success((data,status, headers, config)=>{
                    this.acc_id = data.id;
                    this.s4_id = data.s4_id;
                    this.searchActivity();
                })
                .error((data, status, headers, config)=>{
                    this.openUpbox("您还未注册或未绑定车云终端\n请先注册账号！");
                    window.location.href = "/msite/infoConfig.html?user="+this.user_openid;
                });
        };

        private searchActivity = ()=>{
            this.$http.post("/mservice/myActivity", { user: this.user_openid, s4_id: this.s4_id, acc_id: this.acc_id}, { dataType: "json"})
                .success((data, status, headers, config)=>{
                    if(data.length === 0)
                    {
                        this.openUpbox("您尚没有参加任何活动!");
                        setInterval(function(){
                            if(typeof WeixinJSBridge !== "undefined"){
                                WeixinJSBridge.call('closeWindow');
                            }
                        },1500);
                    }
                    else
                    {
                        this.activities = data;
                    }
                })
                .error((data, status, headers, config)=>{ this.openUpbox("未找到您参加的活动"); });
        };

        private onSwitchView = (e)=>{
            this.show_main = this.$location.path() === "/msite/myActivity.html";
        };

        private user_openid: string;
        private acc_id: number;
        private s4_id: number;
        private show_main = true;
        private activities : Array<any>;
        private $http: any;
        private $scope: any;
        private $location: any;
        private cover_show=false;
        private upbox_show = false;
        private tips:string;
    }
}