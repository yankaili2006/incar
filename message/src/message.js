/**
 * Created by LM on 14-3-15.
 */
'use strict';
var net = require('net');
var server = net.createServer();
function toString0X(dataBuffer){
    var dataString='';
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+='0'+intVal+' ';
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;
}

var sp = require('serialport');

var SerialPort = sp.SerialPort;
var serialPort = new SerialPort("COM4", {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1
}, false);
serialPort.open(function() {
    console.log("端口打开");
});
var spInUse=false;
var msgQueue=[];
function sendToSerialPort(){
    if(msgQueue.length==0)return;
    if(spInUse==false){
        spInUse=true;
        var data=msgQueue[0].data;
        var cb=msgQueue[0].cb;
        console.log(data);
        serialPort.write(data, function(err, results) {
            if (err) {
                console.log('err ' + err + '\n');
                cb({status:'failure',message:err.message});
            }
            serialPort.drain(function(){
                console.log("写入数据(" + results + '字节)：\n'+data.slice(0,17)+toString0X(data.slice(17,results)));
                spInUse=false;
                msgQueue.splice(0,1);
                cb({status:'success'});
                if(msgQueue.length>0)sendToSerialPort();
            });
        });
    }
}
exports.send=function(data,cb){
    msgQueue.push({data:data,cb:cb});
    sendToSerialPort();
};

