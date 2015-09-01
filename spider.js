var request = require('request');
var sys = require('sys');
var cheerio = require('cheerio');
var mysql = require('mysql');
var iconv = require('iconv-lite');
var EventEmitter = require('events').EventEmitter; 
var emitter = new EventEmitter();
emitter.setMaxListeners(100);
var connection;
ConnectDatabase();
var  dataHandler = function(url){
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);

			// if(body.indexOf("charset=gbk") > 0 || body.indexOf("charset=gb2312") > 0 || body.indexOf("charset=GBK") > 0 || body.indexOf("charset=GB2312") > 0 || $('meta[charset="gbk"]').length>0 || $('meta[charset="GBK"]')>0 || $('meta[charset="gb2312"]')>0|| $('meta[charset="GB2312"]')>0){
			// 	// var gbk_to_utf8_iconv = new Iconv('GBK', 'UTF-8//TRANSLIT//IGNORE');
		 //  //       var utf8_buffer = gbk_to_utf8_iconv.convert(body);
			// 	// var gbkBytes = iconv.encode(body,'utf8');
			// 	// var gbkbuf=new Buffer(body);
			// 	// var iconvc=new iconv.Iconv('GBK','UTF8');
			// 	// var utf8buf=iconvc.convert(gbkbuf);
			// 	// var utf8str=utf8buf.toString();
			// }
			insertToDB($,url);
			$('a').each(function(index){
				// console.log($(this).html());
				testUrl=$(this).attr('href');
				if(typeof(testUrl)!='undefined'){
					var testUrlTmp=testUrl;
					if(testUrlTmp.substring(0,4)!="http"){
						testUrl = 'http://'+getHost(url)+testUrl;
					}
					if(checkURL(testUrl)){
						// console.log("Not Url");
						//checkLinkExist(testUrl);
						emitter.emit('dataHandler', testUrl);
						console.log(testUrl);
					}else{
						console.log('不是超链接：'+testUrl);
					}
				}else{
					console.log('超链接未定义：'+testUrl);
				}
			});
			// console.log("End");
			return true;
		}else{
			return false;
		}
	});
}
var startUrl='http://xinhuanet.com/';
dataHandler(startUrl);
emitter.on('dataHandler', dataHandler);
// var listener = function(foo,bar){
//     console.log("第1个监听事件,参数foo=" + foo + ",bar="+bar );
// }
// ee.on('some_events', listener);
// ee.emit('some_events', 'Wilson', 'Zhong');
function insertToDB($,url){
	var data=new Object();
	data.title=$('title').length>0?$('title').text():'';
	data.keywords=$('meta[name="keywords"]').length>0?$('meta[name="keywords"]').attr('content'):'';
	data.introduction=$('meta[name="description"]').length>0?$('meta[name="description"]').attr('content'):'';
	data.link=url;
	// var now = new Date();
	// var str = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
	data.time=timeFormat('yyyy-MM-dd hh:mm:ss');
	// console.log(data);
	ClientReady(data);
}
function getHost(url){
	var host = "null";
	var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if(typeof match != "undefined" && null != match){
    	host = match[1];
    }
    return host;
}
function checkURL(URL){
	var str=URL;
	//判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
	//下面的代码中应用了转义字符"\"输出一个字符"/"
	var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
	var objExp=new RegExp(Expression);
	if(objExp.test(str)==true){
		return true;
	}else{
		return false;
	}
}
function checkLinkExist(link){
	connection.query(
	    'SELECT * FROM beautysense.spidernews WHERE link = \''+link+'\'',
	    function selectCb(error, results, fields) {
	      if (error) {
	          console.log('GetData Error: ' + error.message);
	          return false;
	      }
	      if(results.length > 0){
	      	// for (var i = results.length - 1; i >= 0; i--) {
	      	// 	console.log(results[i]);
	      	// };
	        return true;
	      }else{
	      	emitter.emit('dataHandler', link);
	      	return false;
	      }
	  //     else if(callBack && typeof(callBack) === "function"){
	  //     	console.log('do it');
			// callBack(url);
	  //     	return false;
	  //     }
	  });
}
function ConnectDatabase(){
		connection = mysql.createConnection({
		    host : '182.92.156.106',
		    user : 'root',
		    password : '19910910jacksun',
		});
//		console.log('Connecting to MySQL...');
		  
		connection.connect(function(error, results) {
		  if(error) {
		    console.log('Connection Error: ' + error.message);
		    return;
		  }
		  console.log('Connected to MySQL');
//		  ClientConnectionReady();
		});
}
  
function ClientConnectionReady(){
    connection.query('USE beautysense', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
//            connection.end();
            return;
        }
    });
}
function ClientReady(data){
  var values = [data.title, data.keywords, data.introduction , data.link , data.time];
 // console.warn("INSERT INTO spidernews SET title = "+data.title+", keywords = "+data.keywords+" , introduction = "+data.introduction+" ,link = "+data.link+" ,fetchtime = "+data.time+"");
  // ClientConnectionReady();
  
  connection.query('INSERT INTO beautysense.spidernews SET title = ?, keywords = ? , introduction = ? ,link = ? ,fetchtime = ?', values,
    function(error, results) {
      if(error) {
        console.log("ClientReady Error: " + error.message);
 //       connection.end();
        return;
      }
      console.log('Inserted: ' + results.affectedRows + ' row.');
      console.log('Id inserted: ' + results.insertId);
      console.log(data);
//      connection.end();
      return true;
    }
  );
 // GetData(connection);
}
function timeFormat(formatStr){   
    var str = formatStr;   
    var Week = ['日','一','二','三','四','五','六'];  
  	var time = new Date();
  	var month=time.getMonth()+1;
    str=str.replace(/yyyy|YYYY/,time.getFullYear());   
    str=str.replace(/yy|YY/,(time.getYear() % 100)>9?(time.getYear() % 100).toString():'0' + (time.getYear() % 100));   
  
    str=str.replace(/MM/,month>9?month.toString():'0' + month);   
    str=str.replace(/M/g,month);   
  
    str=str.replace(/w|W/g,Week[time.getDay()]);   
  
    str=str.replace(/dd|DD/,time.getDate()>9?time.getDate().toString():'0' + time.getDate());   
    str=str.replace(/d|D/g,time.getDate());   
  
    str=str.replace(/hh|HH/,time.getHours()>9?time.getHours().toString():'0' + time.getHours());   
    str=str.replace(/h|H/g,time.getHours());   
    str=str.replace(/mm/,time.getMinutes()>9?time.getMinutes().toString():'0' + time.getMinutes());   
    str=str.replace(/m/g,time.getMinutes());   
  
    str=str.replace(/ss|SS/,time.getSeconds()>9?time.getSeconds().toString():'0' + time.getSeconds());   
    str=str.replace(/s|S/g,time.getSeconds());   
  
    return str;   
} 
