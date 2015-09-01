var request = require('request');
var sys = require('sys');
var cheerio = require('cheerio');
var mysql = require('mysql');
var connection;
/* GET home page. */
ConnectDatabase();
var startUrl='http://www.cyzone.cn/';
dataHandler(startUrl);
function insertToDB($,url){
	var data=new Object();
	data.title=$('title').length>0?$('title').text():'';
	data.keywords=$('meta[name="keywords"]').length>0?$('meta[name="keywords"]').attr('content'):'';
	data.introduction=$('meta[name="description"]').length>0?$('meta[name="description"]').attr('content'):'';
	data.link=url;
	// var now = new Date();
	// var str = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
	data.time=timeFormat('yyyy-MM-dd hh:mm:ss');
	console.log(data);
	ClientReady(data);
}
function dataHandler(url){
	request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				$ = cheerio.load(body);

				// if($('meta[charset="gbk"]').length>0 || $('meta[charset="GBK"]')>0 || $('meta[charset="gb2312"]')>0|| $('meta[charset="GB2312"]')>0){
				// 	var utfBytes = iconv.encode(body,'utf8');
				// 	$ = cheerio.load(utfBytes);
				// }
	console.log("Begin");
				console.log(body);
	console.log("End");
//				insertToDB($,url);

				$('a').each(function(index){
					console.log($(this).attr('href'));
					testUrl=$(this).attr('href');
					if(!checkURL(testUrl) || testUrl.substring(0,4)!="http"){
						testUrl = getHost(url)+testUrl;
					}
					if(!checkLinkExist(testUrl)){
						console.info("Begin");
						dataHandler(url);
						console.info("End");
					}
				});
				return true;
			}else{
				return false;
			}
	})
	return true;
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
	ClientConnectionReady();
	connection.query(
	    'SELECT * FROM beautysense.spidernews WHERE link = \''+link+'\'',
	    function selectCb(error, results, fields) {
	      if (error) {
	          console.log('GetData Error: ' + error.message);
//	          connection.end();
	          return false;
	      }
	  
	      if(results.length > 0){
	        return true;
	      }else{
	      	return false;
	      }
	  });
//	  connection.end();
//	  console.log('Connection closed');
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
};
  
function ClientConnectionReady(){
    connection.query('USE beautysense', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
//            connection.end();
            return;
        }
    });
};

function ClientReady(data){
  var values = [data.title, data.keywords, data.introduction , data.link , data.time];
 // console.warn("INSERT INTO spidernews SET title = "+data.title+", keywords = "+data.keywords+" , introduction = "+data.introduction+" ,link = "+data.link+" ,fetchtime = "+data.time+"");
  ClientConnectionReady();
  connection.query('INSERT INTO beautysense.spidernews SET title = ?, keywords = ? , introduction = ? ,link = ? ,fetchtime = ?', values,
    function(error, results) {
      if(error) {
        console.log("ClientReady Error: " + error.message);
 //       connection.end();
        return;
      }
      console.log('Inserted: ' + results.affectedRows + ' row.');
      console.log('Id inserted: ' + results.insertId);
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
    str=str.replace(/yyyy|YYYY/,time.getFullYear());   
    str=str.replace(/yy|YY/,(time.getYear() % 100)>9?(time.getYear() % 100).toString():'0' + (time.getYear() % 100));   
  
    str=str.replace(/MM/,time.getMonth()>9?time.getMonth().toString():'0' + time.getMonth());   
    str=str.replace(/M/g,time.getMonth());   
  
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


