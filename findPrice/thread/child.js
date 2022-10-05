const { workerData, parentPort } = require("worker_threads");
const findMatch = require('./../findMatch');
 
// you can do intensive sychronous stuff here
function newThread(srcDt, json) {
  return findMatch(srcDt, json);
}
 
const intensiveResult = newThread(workerData.srcDt,workerData.json);
 
parentPort.postMessage({ intensiveResult });