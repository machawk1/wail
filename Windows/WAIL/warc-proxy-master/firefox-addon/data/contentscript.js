
document.documentElement.addEventListener("addon-request-open-warc-file", function(event) {
    self.port.emit("open.warc.file");
}, false);

document.documentElement.addEventListener("addon-request-navigate", function(event) {
    self.port.emit("navigate", event.detail.uri);
}, false);

document.documentElement.addEventListener("addon-request-toggle-proxy", function(event) {
    self.port.emit("toggle.proxy", event.detail.new_state);
}, false);

self.port.on("open.warc.file", function(pathname) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("addon-open-warc-file", true, true, { pathname: pathname });
    document.documentElement.dispatchEvent(event);
});

self.port.on("proxy.enabled", function(pathname) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("addon-proxy-enabled", true, true, { });
    document.documentElement.dispatchEvent(event);
});
