var http = require('http');  
var qs = require('querystring');  
var fs = require('fs');
var request = require('request');

var wordData = require('./word.json');
wordData = wordData.word;
var wordIndex = 0;
// var WordLength = wordData.length;
var WordLength = 50;
var dataArr = '';

// console.log(wordData)
var post_data = {  
    word: wordData[wordIndex]
};//这是需要提交的数据  
var content = qs.stringify(post_data);  
var option = {  
    hostname: 'xue.hahaertong.com',  
    port: 80,  
    path: '/index.php?app=chinese',  
    method: 'POST',  
    headers: {  
        'Content-Type':'application/x-www-form-urlencoded'
   }
}; 
function getData(){//请求参数)
    var data = '';
    var newOption = {};
    for(let i in option){
        newOption[i] = option[i];
    }
    newOption.form = {};
    newOption.form.word = wordData[wordIndex];
    var req = http.request(newOption, function (res) {  
        res.setEncoding('utf8');  
        res.on('data', function (chunk) {  
            data+= chunk;
            // console.log('BODY: ' + chunk);  
        });

        res.on('end',function(){
            data = data.split("<script type='text/javascript'>window.parent.H.app.Chinese.callback(")[1].split(");</script>")[0];
            data = data.replace('result:"1",','');
            // data = data.replace('chinese',);
            data = '"'+wordData[wordIndex]+'":'+data
            if(wordIndex == WordLength){
                dataArr += data;
            }else{
                dataArr += data+',';
            }
            console.log(wordIndex+'汉字:'+wordData[wordIndex]+'***********************打包完毕*******************************************************')
            loop();
        });
    });  
      
    req.on('error', function (e) {  
        console.log('problem with request: ' + e.message);  
    });  
    // write data to request body  
    req.write(content);  
      
    req.end();  
}

function loop(){
    //递归
    wordIndex ++;
    if(wordIndex <= WordLength){
        post_data = {  
            word: wordData[wordIndex]
        };//这是需要提交的数据  
        content = qs.stringify(post_data);
        getData();
    }else{
        //格式化文件准备读取
        format();
    }
}

//清空data.json文件内容
function dataJsonInit(callBack){
    callBack = callBack || function(){};
    fs.readFile('data.json','utf8',function (err, data) {
        if(err) console.log(err);
        data = '';
        fs.writeFileSync('data.json',data);
        console.log('初始化完毕');
        callBack();
    });
}

//格式化数据
function format(){
    console.log('开始格式化JSON文件')
    dataArr = '{'+dataArr+'}';
    fs.writeFileSync('data.json',dataArr);
    downLoadAudios();
}
//下载音频文件
function downLoadAudios(){
    console.log('准备下载音频文件');
    fs.readFile('data.json','utf8',function (err, data) {
        if(err) console.log(err);
        loadData(data);

    });
    function loadData(data){
        data = eval('(' + data + ')');
        var pinyinList = [];
        let pinyin = [];
        for(let i in data){
            pinyin = data[i].chinese.pinyin.split(',');
            for(let j = 0;j< pinyin.length; j++){
                pinyinList.push(pinyin[j]);
            }
        }
        pinyinList = arr(pinyinList);
        //开始创建拼音字典
        fs.writeFileSync('./pinyindic.json',pinyinList);
        // 通过字典下载音频
        requestAudios();        
    }
    //请求资源地址，准备下载
    function requestAudios(){
        fs.readFile('./pinyindic.json',{encoding:'utf-8'}, function (err,bytesRead) {
            if (err) throw err;
            bytesRead = bytesRead.split(',');
            // for(let i in bytesRead){
            //     let fileUrl = 'http://xue.hahaertong.com/index.php/index.php?app=chinese&act=audio&audio='+bytesRead[i];
            // }

            // let fileUrl = 'http://xue.hahaertong.com/index.php/index.php?app=chinese&act=audio&audio=á';
            // let filename = bytesRead[0]+'.mp3';
            // let filepath = './audio'
            // request
            //   .get({
            //     host:'',//请求发送到的服务器的域名或IP地址。默认为'localhost'。
            //     hostname:'',//用于支持url.parse()。hostname比host更好一些
            //     port:'',//远程服务器的端口。默认值为80。
            //     localAddress:'',//用于绑定网络连接的本地接口。
            //     socketPath:'',//Unix域套接字（使用host:port或socketPath）
            //     method:'',//指定HTTP请求方法的字符串。默认为'GET'。
            //     path:'',//请求路径。默认为'/'。如果有查询字符串，则需要包含。例如'/index.html?page=12'。请求路径包含非法字符时抛出异常。目前，只否决空格，不过在未来可能改变。
            //     headers:'',//包含请求头的对象。
            //     auth:'',//用于计算认证头的基本认证，即'user:password'
            //     agent:'',//控制[Agent][]的行为。当使用了一个Agent的时候，请求将默认为Connection: keep-alive。可能的值为:
            //     undefined:'',//在这个主机和端口上使用[全局Agent][]。
            //     Agent:'',//在Agent中显式使用passed。
            //     false:'',//在对Agent进行资源池的时候，选择停用连接，默认请求为:Connection: close。
            //     keepAlive:{Boolean} '',//保持资源池周围的套接字在未来被用于其它请求。默认值为false
            //     keepAliveMsecs:{Integer} ''//当使用HTTP KeepAlive的时候，通过正在保持活动的套接字发送TCP KeepAlive包的频繁程度。默认值为1000。仅当keepAlive被设置为true时才相关
            //   })
            //   .pipe(fs.createWriteStream('a1.mp3'))
            
        });
    }
    //去重
    function arr(arr) {
      var result=[]
      for(var i=0; i<arr.length; i++){
        if(result.indexOf(arr[i])==-1){
          result.push(arr[i])
        }
      };
      return result;
    }      
}


//初始化
(function subjectInit(){
    //清空data.json文件内容 default
    dataJsonInit(function(){getData();});
    //临时调试
    // downLoadAudios();
})()

