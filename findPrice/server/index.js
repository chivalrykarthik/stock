const express = require("express");
const bodyParser = require('body-parser');
const cluster = require('cluster');
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
	app.post("/fp",function(req,res,next){
		//console.log("Request received");
		const {srcDt, json} = (req.body);
		const mtch = findMatch(srcDt, json);	
		res.json(mtch);
		console.log("Response sent:"+ cluster.worker.id);
	});

	app.listen(3000, () => {
	 console.log("Server running on port 3000");
	});
}
