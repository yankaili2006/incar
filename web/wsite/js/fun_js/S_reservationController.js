/**
 * Created by Liz on 14-2-27.
 */
   //保养预约
   function s_reservationCtrl($scope, $http,$routeParams){

    $scope.reservationDiv = true;
    $scope.applyOperDiv = false;
    $scope.reserAddDiv = false;
    $scope.repairDiv = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.jj_reason = "";
    $scope.care_itmes = "";
    $scope.care_cost = "";
    $scope.begin_time = "";
    $scope.end_time = "";
    $scope.ownerNick="";
    $scope.ownerLicense="";
    $scope.work_time_begin="";
    $scope.queryString = "";
    $scope.brand_id = "";
    $scope.series_id = "";


    $scope.carBrand=[{id:"zero",name:"请选择"},{id:0,name:"丰田/TOYOTA"},{id:1,name:"本田/Honda"},{id:2,name:"日产/NISSAN"},{id:3,name:"三菱/MITSUBISHIMOTORS"}];
    $scope.carSeries=[{id:0,name:"请选择"}];

    if($routeParams.id!=null)
    {
        $scope.queryString = "&step="+$routeParams.id;
    }

    GetFirstPageInfo();
    function GetFirstPageInfo()
    {
        $scope.tips = "";
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
            $scope.careList = data.works;
            if(updateBrandSeries) updateBrandSeries();

            if(data.status =="ok")
            {
            if(data.works.length > 0)
            {
                for(var i=0;i<$scope.careList.length;i++)
                {
                    $scope.careList[i].working_time =  $.changeDate($scope.careList[i].working_time);
                    $scope.careList[i].created_time =  $.changeDate($scope.careList[i].created_time);
                    $scope.careList[i].updated_time =  $.changeDate($scope.careList[i].updated_time);
                    $scope.careList[i].step = $.changeWorkStatus($scope.careList[i].step);
                    if($scope.careList[i].step == "applied")
                    {
//                        data.works[i].series = carProperties.getSeries(data.works[i].json_args.series);
//
//                        carProperties.notify(function(){
//                           data.works[i].series = carProperties.getSeries(data.works[i].json_args.series);
//                        });
//                         $http.get(baseurl+"brand/"+$scope.careList[i].json_args.brand+"/series/"+$scope.careList[i].json_args.series).success(function(data1){
//
//                             if(data1.status == "ok")
//                             {
//                                 alert(i);
//                                 $scope.careList[i-1].carPro = data1.series;
//                                 $scope.careList[i-1].step = $.changeWorkStatus($scope.careList[i-1].step);
//                             }
//                         })
                     }

                }

                PagingInfo(data.totalCount);
            }
            else{
                $scope.tips="暂无数据";
            }
            }

        }).error(function(data){
                alert("请求无响应");
        });
        $scope.queryString = "";
    }

    //改变车型自动加载车款
//    $scope.changeSeries = function()
//    {
//
//        if($scope.brand_id !="zero")
//        {
//            switch($scope.brand_id)
//            {
//                case 0:
//                    $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"FJ酷路泽"},{id:2,name:"HIACE"},{id:3,name:"Siemma"},{id:4,name:"Venza威飒"}];
//                    break;
//                case 1:
//                    $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"INSIGHT"},{id:2,name:"本田CR-Z"},{id:3,name:"飞度(进口)"},{id:4,name:"里程"}];
//                    break;
//                case 2:
//                    $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"碧莲"},{id:2,name:"风度"},{id:3,name:"风雅"},{id:4,name:"贵士"}];
//                    break;
//                case 3:
//                    $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"ASX劲炫(进口)"},{id:2,name:"LANCER"},{id:3,name:"格鲁迪(进口)"},{id:4,name:"欧蓝德(进口)"}];
//                    break;
//            }
//        }
//    }


    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
        if($routeParams.id!=null)
        {
            $scope.queryString = "&step="+$routeParams.id;
        }
        if($scope.ownerNick=="")$scope.ownerNick="";
        if($scope.ownerLicense=="")$scope.ownerLicense="";
        if($scope.work_time_begin=="")$scope.work_time_begin="";
        $scope.queryString += "&cust_nick="+$scope.ownerNick+"&license="+$scope.ownerLicense+"&working_time_begin="+$scope.work_time_begin;
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

    //分页跳转页面
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId ;
        if($routeParams.id!=null)
        {
            $scope.queryString = "&step="+$routeParams.id;
        }
        if($scope.ownerNick=="")$scope.ownerNick="";
        if($scope.ownerLicense=="")$scope.ownerLicense="";
        if($scope.work_time_begin=="")$scope.work_time_begin="";
        $scope.queryString += "&cust_nick="+$scope.ownerNick+"&license="+$scope.ownerLicense+"&working_time_begin="+$scope.work_time_begin;
        GetFirstPageInfo();
    }

   //详情子操作
   $scope.OperationChild = function(oper)
    {
      switch(oper)
      {
          case "approve":
              if(confirm("是否确定已确认?")){
                  $scope.postData = {op:"approve",brand:$scope.careDetail.json_args.brand,series:$scope.careDetail.json_args.series,license:$scope.careDetail.json_args.license,nick:$scope.careDetail.json_args.nick,phone:$scope.careDetail.json_args.phone,mileage:$scope.careDetail.json_args.mileage};
                  $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/care/'+$scope.id,$scope.postData).success(function(data){
                      if(data.status=="ok")
                      {
                        GetFirstPageInfo();
                        alert("操作成功");
                        changeView(2);
                      }else{
                          alert("请求无响应");
                      }
                  }).error(function(data){
                     alert("请求无响应");
                 })
              }
              break;
          case "cancel":
              if(confirm("是否确定已取消?")){
                  $scope.postData = {op:"cancel",brand:$scope.careDetail.json_args.brand,series:$scope.careDetail.json_args.series,license:$scope.careDetail.json_args.license,nick:$scope.careDetail.json_args.nick,phone:$scope.careDetail.json_args.phone,mileage:$scope.careDetail.json_args.mileage};
                  $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/care/'+$scope.id,$scope.postData).success(function(data){
                      if(data.status=="ok")
                      {
                          GetFirstPageInfo();
                          alert("操作成功");
                          changeView(2);
                      }else
                      {
                          alert("请求无响应");
                      }
                  }).error(function(data){
                          alert("请求无响应");
                  })
              }
              break;
          case "reject":
              $scope.jj_reason = "";
              $scope.rejectReason = true;
              break;
          case "done":
              $scope.care_items = "";
              $scope.care_cost="";
              $scope.begin_time="";
              $scope.ReservationInfo = true;
              break;
          case "abort":
              if(confirm("是否确定未到店?")){
                  $scope.postData = {op:"abort",reason:"",brand:$scope.careDetail.json_args.brand,series:$scope.careDetail.json_args.series,license:$scope.careDetail.json_args.license,nick:$scope.careDetail.json_args.nick,phone:$scope.careDetail.json_args.phone,mileage:$scope.careDetail.json_args.mileage};
                  $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/care/'+$scope.id,$scope.postData).success(function(data){
                      if(data.status=="ok")
                      {
                          GetFirstPageInfo();
                          alert("操作成功");
                          changeView(2);
                      }else{
                          alert("请求无响应");
                      }
                  }).error(function(data){
                          alert("请求无响应");
                  })
              }
              break;
      }

    }

   //查看保养预约详情
   $scope.Operation = function(index,type)
   {
       changeView(1);
       $scope.careDetail = $scope.careList[index];
       $scope.id = $scope.careList[index].id;
       switch(type)
       {
           case "新申请":
              $scope.newApplyOper = true;
              break;
           case "已拒绝":
               $scope.reason = $scope.careList[index].json_args.reason;
               $scope.colspanTh = true;
               $scope.diffDiv = true;
               break;
           case "已确认":
               $scope.completeOper = true;
               break;
           case "已完成":
               $scope.done_items = $scope.careList[index].json_args.care_items;
               $scope.done_cost = $scope.careList[index].json_args.care_cost;
               $scope.done_btime =  $scope.careList[index].json_args.begin_time;
               $scope.done_etime =  $scope.careList[index].json_args.end_time;
               $scope.reservationProTi = true;
               $scope.reservationProTe = true;
               $scope.completeTr = true;
               break;
           case "未到店":
               $scope.colspanTh = true;
               break;
           case "已取消":
               $scope.cancelTime = $scope.careList[index].updated_time;
               $scope.cancelTimeTi = true;
               $scope.cancelTimeTe = true;
               break;
       }
   }

  //取消
    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.ReservationInfo = false;
                break;
            case 2:
                $scope.rejectReason = false;
                break;
            case 3:
                changeView(2);
                break;
        }
    }

    //添加预约
    $scope.addConfirm = function()
    {
        $scope.postData = {"op":"apply","org_id":$.cookie("s4_id"),"car_id":1,"cust_id":83,"working_time":$scope.working_time}
        $http.post(baseurl+'organization/'+ $.cookie("s4_id")+'/work/care',"").success(function(data){
//            $scope.careList = data.works;
//            PagingInfo(data.totalCount);
//            if(data.works.length > 0)
//            {
//                for(var i=0;i< $scope.careList.length;i++)
//                {
//                    $scope.careList[i].working_time =  $.changeDate($scope.careList[i].working_time);
//                    $scope.careList[i].created_time =  $.changeDate($scope.careList[i].created_time);
//                    $scope.careList[i].updated_time =  $.changeDate($scope.careList[i].updated_time);
//                    $scope.careList[i].step = $.changeWorkStatus($scope.careList[i].step);
//                }
//            }
//            else{
//                $scope.tips="暂无数据";
//            }
        }).error(function(data){
                alert("请求无响应");
            });

    }

    //确定
    $scope.confirm = function(id)
    {
        switch(id)
        {
            case 1://已完成
                if(confirm("是否确定已完成?")){
                    $scope.postData = {op:"done",care_items:$scope.care_items,care_cost:$scope.care_cost,begin_time:$scope.begin_time,end_time:$scope.end_time,brand:$scope.careDetail.json_args.brand,series:$scope.careDetail.json_args.series,license:$scope.careDetail.json_args.license,nick:$scope.careDetail.json_args.nick,phone:$scope.careDetail.json_args.phone,mileage:$scope.careDetail.json_args.mileage};
                    $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/care/'+$scope.id,$scope.postData).success(function(data){
                        if(data.status == "ok")
                        {
                            GetFirstPageInfo();
                            alert("操作成功!");
                            changeView(2);
                        }
                        else
                        {
                            alert("请求无响应");
                        }
                    }).error(function(data){
                        alert("请求无响应");
                    })
                }
                break;
            case 2://拒绝
                if(confirm("是否确定已拒绝?")){
                    $scope.postData={op: "reject", reason:$scope.jj_reason,brand:$scope.careDetail.json_args.brand,series:$scope.careDetail.json_args.series,license:$scope.careDetail.json_args.license,nick:$scope.careDetail.json_args.nick,phone:$scope.careDetail.json_args.phone,mileage:$scope.careDetail.json_args.mileage};
                    $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/care/'+$scope.id,$scope.postData).success(function(data){
                        if(data.status == "ok")
                        {
                            GetFirstPageInfo();
                            alert("操作成功!");
                            changeView(2);
                        }
                        else{
                            alert("请求无响应");
                        }
                    }).error(function(data){
                        alert("请求无响应");
                    })
                }
                break;
        }
    }

    //点击添加按钮
    $scope.add = function()
    {
        changeView(3);
    }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.reservationDiv = false;
                $scope.reserAddDiv = false;
                $scope.applyOperDiv = true;
                $scope.ReservationInfo = false;
                $scope.newApplyOper = false;
                $scope.completeOper = false;
                $scope.diffDiv = false;
                $scope.reservationProTi = false;
                $scope.reservationProTe = false;
                $scope.completeTr = false;
                $scope.cancelTimeTi = false;
                $scope.cancelTimeTe = false;
                $scope.rejectReason = false;
                $scope.colspanTh = false;
               break;
            case 2:
                $scope.reservationDiv = true;
                $scope.applyOperDiv = false;
                $scope.reserAddDiv = false;
                break;
            case 3:
                $scope.reservationDiv = false;
                $scope.reserAddDiv = true;
                $scope.applyOperDiv = false;
        }
    }

    function updateBrandSeries(){
        if($scope.cacheReady && $scope.careList){
            for(var i=0;i<$scope.careList.length;i++){
                var care = $scope.careList[i];
                if(care.json_args && care.json_args.brand && care.json_args.series){
                    try{
                        care.series_name = window.cacheBS[care.json_args.brand][care.json_args.series];
//                      console.log(care.json_args);
//                      console.log(care.series_name);
                    }
                    catch(ex){}
                }

            }
        }
    }


    if(!window.cacheBS) {
        $http.get('/wservice/brand/', null)
            .success(function (data, status) {
                if (data.status === 'ok') {
                    // the cache
                    window.cacheBS = {};
                    $scope.cacheCount = 0;
                    $scope.cacheReady = false;

                    for (var i = 0; i < data.brands.length; i++) {
                        var brand_code = data.brands[i].brandCode;
                        window.cacheBS[brand_code.toString()] = {};

                        $http.get('/wservice/brand/' + brand_code + '/series')
                            .success(function (data2, status2) {
                                if (data2.status === 'ok') {
                                    $scope.cacheCount++;
                                    // build cache
                                    for (var j = 0; j < data2.series.length; j++) {
                                        var x = data2.series[j];
                                        window.cacheBS[x.brandCode][x.seriesCode] = x.series;
                                    }
                                }
                                if ($scope.cacheCount === data.brands.length) {
                                    $scope.cacheReady = true;
                                    updateBrandSeries();
                                }
                            })
                            .error(function () {
                                $scope.cacheCount++;
                                if ($scope.cacheCount === data.brands.length) {
                                    $scope.cacheReady = true;
                                    updateBrandSeries();
                                }
                            });
                    }
                }
            })
            .error(function (data, status) {
                console.error(status);
            });
    }
    else{
        $scope.cacheReady = true;
    }

//    $scope.ReservationTab = function(id)
//    {
//        changeView(2);
//        switch(id)
//        {
//            case 0:
//                GetFirstPageInfo("");
//                break;
//            case 1://新申请
//                GetFirstPageInfo("applied");
//                break;
//            case 2://已拒绝
//                GetFirstPageInfo("rejected");
//                break;
//            case 3://已确认
//                GetFirstPageInfo("approved");
//                break;
//            case 4://已完成
//                GetFirstPageInfo("done");
//                break;
//            case 5://未到店
//                GetFirstPageInfo("aborted");
//                break;
//            case 6://已取消
//                GetFirstPageInfo("cancelled");
//                break;
//        }
//    }
}