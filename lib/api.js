var request = require("request");
var utils = require("./utils");

var requests = 0;
var callbacks = {};

var api = function api(options, callback) {
    var url = typeof options["url"] === "undefined" ? "" : options["url"];
    if (url === "") {
        url = typeof options["uri"] === "undefined" ? "" : options["uri"];
    }

    // Prepend the URL with https://api.twitch.tv/kraken
    if (!utils.isURL(url)) { url = "https://api.twitch.tv/kraken" + url; }

    // Check if data was passed..
    if (!arguments[2]) {
        callback = arguments[1];
        options = {};
    }

    // Browser..
    if (!utils.isNodeJS()) {
        // Callbacks must match the regex [a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)* according to
        // https://discuss.dev.twitch.tv/t/changes-to-jsonp-callbacks/996
        var callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(null, null, data);
        };

        var script = document.createElement("script");
        script.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
        document.body.appendChild(script);
    }
    // Node.JS..
    else {
        var clientid = typeof options["Client-ID"] === "undefined" ? "" : options["Client-ID"];
        var oauth = typeof options["Authorization"] === "undefined" ? "" : options["Authorization"];

        var requestOptions = {
            url: url,
            method: "GET"
        };
        request(utils.mergeRecursive(requestOptions, options), function (err, res, body) {
            callback(err, res, body);
        });
    }
}

module.exports = api;