const express = require("express");
const bodyParser = require('body-parser');
const cluster = require('cluster');
const csvToJson = require('csvtojson');
const findMatch = require('./../findMatch');
//const cCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Create a worker for each CPU
    for (let i = 0; i < 3; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });
} else {
    const  app = express();
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
	app.post("/csvtojson",async(req,res,next)=>{
		//console.log("ReadingFile received:"+ cluster.worker.id);
		const {fileName} = (req.body);		
		const json = await csvToJson({ flatKeys: true }).fromFile(fileName);
		console.log("Response sent:"+ cluster.worker.id);
		res.json(json);
	});

	app.listen(5000, () => {
	 console.log("Server running on port 5000");
	});
}
