/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
angular.module("SSystemApp", [
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/collapseGOne', {
            controller: 's_systemCtrl',
            templateUrl: '/4sStore/partials/setting_main.html'//特价工位
        })
        .otherwise({
           redirectTo:'/collapseGOne'//跳转到设备管理
        });
      //  $locationProvider.html5Mode(true);

}).controller("adminCtrl",function($scope,$http){
        if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
        {
            $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
            $scope.s4Name = $.cookie("s4_name");
        }else{
            parent.location.href="../login.html";
        }
         $scope.randomTime  = new Date();
         $scope.changeTime = function()
         {
             $scope.randomTime  = new Date();
         }
        //注销
        $scope.logout = function()
        {
            if(confirm("是否确定要注销?"))
            {
                $http.get(baseurl+"logout").success(function(data){
                    if(data.status == "ok")
                    {
                        window.location="../login.html";
                    }
                }).error(function(data){
                        alert("请求无响应!");
                    })
            }
        }
});
