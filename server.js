const logEvents=require('./logEvents');
const EventEmitter=require('events');
const http=require('http');
const fs=require('fs');
const fsPromises=require('fs').promises;
const path = require('path');


const server=http.createServer((req,res)=>{
    myEmitter.emit('log','log event emitted');
    console.log(req.url,req.method);
    let contentType;
    const extension=path.extname(req.url);
    switch(extension){
        case '.html':
            contentType='text/html';
            break;
        case '.css':
            contentType='text/html';
            break;
        case '.js':
            contentType='text/javascript';
            break;
        case '.jpg':
            contentType='image/jpg';
            break;
        case '.json':
            contentType='application/json'
            break;
        case '.png':
            contentType='image/png';
            break;
        default:
            contentType='text/html'
    }
    const serveFile=async (filep,content,response)=>{
       
       try{ 
        const data= await fsPromises.readFile(filep,!content==='application/json'?'utf-8':'')
        const rawData=content==='application/json'?JSON.parse(data):data;
        response.writeHead(200,{'content-Type':content});
        response.end(content==='application/json'?JSON.stringify(rawData):rawData);
        }catch(err){
            console.error(err);
            response.statusCode=500;
            response.end();
        }
    }

    let filePath=
        contentType==='text/html' && req.url==='/'?
        path.join(__dirname,'views','index.html')
        :contentType==='text/html' && req.url.slice(-1)==='/'?
        path.join(__dirname,'views',req.url,'index.html')
        :contentType==='text/html'?
        path.join(__dirname,'views',req.url)
        :path.join(__dirname,req.url);
    if(!extension && req.url.slice(-1)!=='/') filePath+='.html';
    const fileExists = fs.existsSync(filePath);
    if(fileExists){
        serveFile(filePath,contentType,res)
    } else{
        switch(path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301,{'Location':'/new-page.html'});
                res.end();
                break;
            case 'www-page.htm':
                res.writeHead(301,{'Location':'/'});
                res.end();
                break;
            default:
                serveFile(path.join(__dirname,'views','404.html'),'text/html',res)
        }
    }
        
}) 
 
const PORT = process.env.PORT || 3500;

server.listen(PORT,()=>{
    console.log('server runnning on port '+PORT);
})

class MyEmitter extends EventEmitter {}

const myEmitter =new MyEmitter();

myEmitter.on('log',(msg)=>logEvents(msg));

