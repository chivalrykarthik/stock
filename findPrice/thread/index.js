const { Worker } = require("worker_threads");
 
function parent(srcDt, json) {
//console.log("srcDt===="+JSON.stringify(srcDt))
//console.log("json===="+JSON.stringify(json))
  return new Promise((resolve, reject) => {
    const worker = new Worker("./findPrice/thread/child.js", { workerData: { srcDt, json } });
 
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`stopped with exit code ${code}`));
      }
    });
  });
}


module.exports = parent;