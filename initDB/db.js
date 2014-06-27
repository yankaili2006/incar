/**
 * Created by Jesse Qu on 3/26/14.
 */

"use strict";

var mysql = require('mysql');

exports = module.exports = function() {
    if (! global.poolInCar) {

        var host = process.env.MySQLHost || 'demo.incars.com.cn';
        var user = process.env.MySQLUser || 'incarapp';
        var pwd = process.env.MySQLPwd || 'nodejs4WMQ';

        var dbname = process.env.MySQLDatabase || 'incar';

        global.poolInCar = mysql.createPool({
            host: host,
            user: user,
            password: pwd,
            database: dbname,
            timezone: '0000'
        });
    }
    return global.poolInCar;
};