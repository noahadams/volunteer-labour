;(function(){
    function bind(object, method) {
        return function() {
            var args = [].slice.call(arguments, 0);
            return method.apply(object, args);
        };
    }

    var WorkerManager = function WorkerManager(job) {
        var self = this;
        this.job = job;
        this.webWorker = new Worker("jobrunner.js");
        this.onReadyHandler = bind(this, this.onReady);
        this.webWorker.addEventListener("message", this.onReadyHandler);
        this.state = "BOOTING";
        
        // kick off the worker
        //this.webWorker.postMessage("");
    };

    WorkerManager._STATES_REVERSE = {
        0: "READY",
        1: "RUNNING",
        2: "COMPLETE",
        3: "ERROR"
    };

    WorkerManager.prototype.onReady = function checkReady(event) {
        var data = event.data;
        if (data && data.event && data.event === "pong" &&
            data.value !== undefined) {
            this.state = WorkerManager._STATES_REVERSE[data.value];
            this.webWorker.removeEventListener("message", this.onReadyHandler);
            this.boundMessageHandler = bind(this, this.messageHandler);
            this.webWorker.addEventListener("message", this.boundMessageHandler);
            this.webWorker.postMessage({
                "command": "startJob",
                "input": this.job.input,
                "jobBody": this.job.jobBody
            });
            this.state = "RUNNING";
        }
    };

    WorkerManager.prototype.write = function write(data) {
        //stubs
        console.log(data);
    };

    WorkerManager.prototype.end = function end(data) {
        if (data !== undefined) {
            console.log(data);
        }
        console.log("Ending");
        
        // clean up event handlers
        this.webWorker.removeEventListener("message", this.boundMessageHandler);
        this.webWorker.terminate();
    };

    WorkerManager.prototype.messageHandler = function messageHandler(event) {
        var data = event.data;
        if (data && data.event) {
            if (data.event === "start") {
                this.state = "RUNNING";
                return;
            }
            if (data.event === "data") {
                this.write(data.value);
                return;
            }
            if (data.event === "end") {
                this.end(data.value);
                this.state = "COMPLETE";
                return;
            }
            if (data.event === "error") {
                console.error("Worker Error: " + JSON.stringify(data.value));
                this.end();
                this.state = "ERROR";
            }
            console.error("Unexpected Event: " + data.event);
            return;
        }
        console.error("Unexpected Message: " + JSON.stringify(event));
    };

    var w = new WorkerManager({
        input: "Hello, World!",
        jobBody: "write(input);setTimeout(function() {end();}, 1000);"
    });
    
}());