

window.debounce = function(fn, delay) {
    let timerId;
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
};

window.throttle = function(fn, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
};

Promise.create = function () {
    const promise = new Promise((resolve, reject) => {
        this.temp_resolve = resolve;
        this.temp_reject = reject;
    });
    promise.resolve = this.temp_resolve;
    promise.reject = this.temp_reject;
    delete this.temp_resolve;
    delete this.temp_reject;
    return promise;
};

Array.prototype.remove = function(element) {
    if (!this.indexOf) return;
    const index = this.indexOf(element);
    if (!!~index) return this.splice(index, 1);
};