/// <reference path="../dts/node.d.ts" />

var mysql:any = require('mysql');

module Service{
    export module MySqlAccess{
        // 获取全局连接池对象,如果没有,就会创建一个
        export function RetrievePool() : any{
            if(!global.poolInCar){
                var host = process.env.MySQLHost || 'linuxsrv.winphone.us';
                var user = process.env.MySQLUser || 'incarapp';
                var pwd = process.env.MySQLPwd || 'nodejs4WMQ';
                var dbname = process.env.MySQLDatabase || 'incar';
                console.log("MySQL: %s/%s", host, dbname);
                global.poolInCar = mysql.createPool({
                    host: host,
                    user: user,
                    password: pwd,
                    database: dbname
                });
            }

            if(process.env.TraceSQL){
                if(!global.poolInCar.TraceCount){
                    global.poolInCar.TraceCount = 1;
                    global.poolInCar.queryRawFn = global.poolInCar.query;

                    global.poolInCar.query = (sql, args, cb)=>{
                        var snSQL = (global.poolInCar.TraceCount++);
                        var tmA = new Date();
                        global.poolInCar.queryRawFn(sql, args, (ex, result)=>{
                            var tmB = new Date();
                            TraceSQL(sql, args, snSQL, tmB.getTime() - tmA.getTime());
                            if(ex) console.info(">>>>> SQL#%d \033[31m%s\033[0m", snSQL, ex.message);
                            cb(ex, result);
                        });
                    };
                }
            }

            return global.poolInCar;
        }

        // 调试用
        export function TraceSQL(sql:string, args:any, sn:number, tmSpan:number):string{
            var sqlfull = mysql.format(sql, args);
            console.info(">>>>> SQL#%d \033[32m%d\033[0mms > \033[33m%s\033[0m", sn, tmSpan, sqlfull);
            return sqlfull;
        }

        // 存储一系列id到一个临时表中
        export function StoreIds(tmpName:string, ids:number[], cb:(ex:TaskException, tmpName:string)=>void):void{
            var idsForceNumber = Array();
            ids.forEach((obj)=>{   idsForceNumber.push(Number(obj));      });
            var dac = MySqlAccess.RetrievePool();
            dac.query("DROP TABLE ?? ;", tmpName, (ex, result)=>{
                dac.query("CREATE TABLE ?? (id INT UNSIGNED PRIMARY KEY) ENGINE = MEMORY", [tmpName], (ex, result)=>{
                    if(ex){ cb(new TaskException(-1, "数据库错误,创建临时表失败", ex), null); return; }
                    else{
                        var strV = "(" + idsForceNumber.join("),(") + ")";
                        dac.query("INSERT INTO tmp_ids VALUES " + strV, null, (ex, result)=>{
                            if(ex){ cb(new TaskException(-1, "数据库错误,插入数据失败", ex), null); return; }
                            else{
                                cb(null, tmpName);
                            }
                        });
                    }
                });
            });
        }
    }
}

