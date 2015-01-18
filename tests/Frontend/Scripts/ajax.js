define([], function () {
    function onreadystatechange (request, resolve, reject) {
        if (request.readyState === 4 && request.status === 200) {
            resolve(request.response);
        }
    }

    function Ajax(url) {
        this.url = url;
    }

    function getAsync (method, data, resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(method, this.url);
        request.responseType = 'json';
        request.onreadystatechange = onreadystatechange.bind(undefined, request, resolve, reject);
        if (data === undefined) {
            request.send();
        } else {
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(data));
        }
    }

    Ajax.prototype.get = function () {
        return new Promise(getAsync.bind(this, 'GET', undefined));
    };

    Ajax.prototype.post = function (data) {
        return new Promise(getAsync.bind(this, 'POST', data));
    };

    return Ajax;
});