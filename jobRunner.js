;(function() {
    // Hide postMessage API
    var _postMessage = this.postMessage;
    var _onmessage = this.onmessage;
    var _addEventListener = this.addEventListener;

    // hide postMessage API from other scopes
    var hiddenPropertyDescriptor = {
        writeable: false,
        value: undefined
    };
    
    Object.defineProperties(this, {
        "onmessage": hiddenPropertyDescriptor,
        "postMessage": hiddenPropertyDescriptor,
        "addEventListener": hiddenPropertyDescriptor
    });

    // Setup state machine
    var _STATES = {
        READY: 0,
        RUNNING: 1,
        COMPLETE: 2,
        ERROR: 3
    };

    var _current_state;
    
    // set up utilities passed into job
    var write = function(chunk) {
        if (typeof chunk === "string") {
            _postMessage({
                "event": "data",
                "value": chunk
            });
            return;
        }
        console.log("Failed to write " );
        console.dir(chunk);
    };
    
    var end = function(chunk) {
        if (chunk !== undefined) {
            write(chunk);
        }
        _postMessage({event: "end"});
        _current_state = _STATES.COMPLETE;
    };
    
    // A generic "pass it forward" erro handler
    var error = function(errorVal) {
        _current_state = _STATES.ERROR;
        _postMessage({
            "event": "error",
            "value": errorVal
        });
    };

    // start a job
    var acceptJob = function(input, jobBody) {
        var job;
        _postMessage({
            "event": "start"
        });
        _current_state = _STATES.RUNNING;
        try {
            job = new Function("input", "write", "end", jobBody);
        } catch (e) {
            error(e);
            return;
        }
        try {
            job.call(this, input, write, end);
        } catch (e) {
            error(e);
        }
    };

    var pong = function() {
        _postMessage({
            "event": "pong",
            "value": _current_state
        });
    };

    // message handler
    _addEventListener("message", function(event) {
        // stop this message from being seen by others
        event.preventDefault();
        //event.cancelBubble();
        
        var data = event.data;
        
        if (data && data.command === "startJob" && data.jobBody &&
            data.input && _current_state === _STATES.READY) {
            acceptJob(data.input, data.jobBody);
            return;
        }
        if (data && data.command === "ping") {
            pong();
            return;
        }
        console.error("Unexpected message: " + JSON.stringify(event.data));
    });
    
    // signal readiness
    _current_state = _STATES.READY;
    pong();
}());
