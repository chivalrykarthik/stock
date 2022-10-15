const express = require("express");
const bodyParser = require('body-parser');
const cluster = require('cluster');
const csvToJson = require('csvtojson');
//const NodeCache = require( "node-cache" );
const findMatch = require('./../findMatch');
//const myCache = new NodeCache({useClones:false});
const {readFile} = require('fs').promises;
//const cCPUs = require('os').cpus().length;

/*if (cluster.isMaster) {
    // Create a worker for each CPU
    for (let i = 0; i < 2; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });
} else {*/
    const  app = express();
	let i = 1;
	// app.use('/json',express.static('./history/public'))
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
	app.post("/csvtojson",async(req,res,next)=>{
		//console.log("ReadingFile received:"+ cluster.worker.id);
		let json;
		const {fileName} = (req.body);		
		//let data = myCache.mget( [ fileName ] );
		//if(!data[fileName]){
			const temp = await csvToJson({ flatKeys: true }).fromFile(fileName);
			//const temp = await readFile('./33.json','utf8');
			json = temp;
			//myCache.set( fileName, temp );
			console.log("Reading from file="+i);
			i++;
			//console.log(json)
		//}
		/*else {
			json = data[fileName];
			//console.log(json)
			console.log("Reading from cache");
		}*/
		
		//console.log("Response sent:"+ cluster.worker.id);
		//console.log("Response sent:");
		res.json(json);
	});

	app.listen(5000, () => {
	 console.log("Server running on port 5000");
	});
//}
