/**
 * Created by liz on 14-03-30.
 */


function driveDataCtrl($scope, $http){

    $scope.driveDiv = true;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;

    //请求行车数据列表
    $scope.pageRecord = 10;
    $scope.currentPage = 1;
    $scope.obd_num="";
    $scope.city_name="";
    $scope.org_name="";
    $scope.queryString="";
    $scope.brandCode="";
    $scope.seriesCode="";
    $scope.s4_id = "";

    //筛选框初始值 todo--要从数据库读出来
    $scope.city = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    $scope.org= [{name:"请选择"},{name:'4S店A'},{name:'4S店C1'},{name:'奥体中心4S店'}]


    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        getAjaxLink(baseurl+'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime,"","get",1);
//        $http.get(baseurl+'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
//
//        }).error(function(data){
//                alert("请求无响应");
//        })

        $http.get(baseurl+'brand').success(function(data){
        //    $scope.carBrand0 =[{brand:"请选择",brandCode:""},{brand:"所有",brandCode:""}]
            $scope.carBrand1 = data.brands;
            $scope.carBrand =[{brandCode:"",brand:"所有"}];
            var m = $scope.carBrand1.length;
            var n =$scope.carBrand.length;
            for(var i=n;i < n+m;i++)
            {
                $scope.carBrand[i] = $scope.carBrand1[i-n];
            }
        });
        $http.get(baseurl+'4s').success(function(data){
            $scope.s4s1 = data.s4s;
            $scope.s4s = [{id:"",name:"所有"}];
            var r = $scope.s4s.length;
            var q = $scope.s4s1.length;
            for(var i = r;i< r+q;i++)
            {
                $scope.s4s[i]=$scope.s4s1[i-r];
            }
        });
    }

    //查找品牌
    $scope.changeBrand = function(brand_id)
    {
            $http.get(baseurl+'brand/'+brand_id+'/series').success(function(data){
                $scope.carSeries = data.series;
            });
    }

//按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
          if($scope.city_name=="请选择")$scope.city_name="";
          if($scope.brandCode=="")$scope.seriesCode ="";
          $scope.queryString = "&obd_code="+$scope.obd_num+"&city="+$scope.city_name+"&s4_id="+$scope.s4_id+"&brand="+$scope.brandCode+"&series="+$scope.seriesCode;
          GetFirstPageInfo();
    }

    //get paging param info
    function PagingInfo(totalCount)
    {
        $scope.totalCount = totalCount;
        $scope.totalPage = Math.ceil( $scope.totalCount /  $scope.pageRecord)
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }

    //paging redirct
    $scope.changePage=function(changeId,id)
    {
        $scope.currentPage = changeId;
        switch(id)
        {
            case 1:
                GetFirstPageInfo();
                break;
            case 2:
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
        }
        $scope.currentPage = 1;
    }
    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $scope.randomTime = new Date();
        $http.get(baseurl + 'obd/'+obd_code+"?t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                $scope.deviceDetail = data.car;
                $scope.deviceDetail.obdNum = obd_code;
                $scope.deviceDetail.act_type = $.changeStatus($scope.deviceDetail.act_type);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id,id)
    {
        $scope.chooseOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.index = id;
      //  $scope.postData = {code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $scope.tips = "";
        $scope.driveDetail = $scope.drvInfos[id];
        $scope.randomTime = new Date();
        $http.get(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
//                    alert("暂无行程数据");
                      $scope.tips="暂无数据";
                }
                else{
                   // $.changeContentHeight("630px");
                    for(var i=0;i<data.details.length;i++)
                    {
                        data.details[i].createTime = $.changeDate(data.details[i].createTime);
                    }
                }
                $scope.driveDiv = false;
                $scope.oneDetailDiv = true;
                $scope.details = data.details;
                PagingInfo(data.totalCount);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
         });
    }

    //利用$http封装访问，并解决防盗链问题。
    function getAjaxLink(url,query,type,id)
    {
        if($.cookie("nick") != "" && $.cookie("nick") != null)
        {
            //通过AngularJS自带的http访问。
            $http({ method: type, url: url, data:query}).success(function(data){
                if(data.status =="没有登录")
                {
                    alert("登录已超时！");
                    window.location="../login.html";
                }
                else{
                    getIndexData(id,data);
                }
            }). error(function(data){
                    alert("请求无响应");
                });
        }
        else{
            alert("登录已超时！");
            window.location="../login.html";
        }
    }

    //在访问之后对数据进行处理
    function getIndexData(id,data)
    {
        switch(id)
        {
            case 1:
                if(data.status == "ok")
                {
                    if(data.drvInfos.length == 0)
                    {
                        $scope.tips="暂无数据！";
                    }
                    $scope.drvInfos = data.drvInfos;
                    for(var i=0;i<data.drvInfos.length;i++)
                    {
                        $scope.drvInfos[i].carStatus = $.changeCarStatus( $scope.drvInfos[i].carStatus);
                        $scope.drvInfos[i].fireTime = $.changeDate($scope.drvInfos[i].fireTime);
                        $scope.drvInfos[i].flameOutTime = $.changeDate($scope.drvInfos[i].flameOutTime);
                    }
                    PagingInfo(data.totalCount);
                }
                else
                {
                    alert(data.status);
                }
                break;
        }
    }


    //一分钟内的行车数据流记录
    $scope.GetOneMinuteDetail = function(index)
    {
        if($scope.details[index].detail == null || $scope.details[index].detail.length == 0)
        {
             alert("暂无详细数据");
        }
        else
        {
           // $.changeContentHeight("1000px");
            $scope.omdds = $scope.details[index].detail;
            $scope.oneDetailDiv = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

   //返回操作
    $scope.gotoBack = function(id)
    {
        $scope.currentPage = 1;
        switch(id)
        {
            case 1: //行程返回行车
                $scope.driveDiv = true;
                $scope.oneDetailDiv = false;
                GetFirstPageInfo();
                break;
            case 2: //数据流数据返回行程
                $scope.oneDetailDiv = true;
                $scope.oneMinuteDetailDiv = false;
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
        }
    }




    //删除
    $scope.deleteRecord = function(index){
        if(confirm("确定要删除吗？")){
            $scope.users.splice(index, 1);
        }
    }
}