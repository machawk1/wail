
var tabs = require('tabs'),
    pref = require("preferences-service"),
    Menuitem = require("menuitems").Menuitem;

exports.main = function() {
    var data = require("self").data;

    var menuItem = Menuitem({
        onCommand: function() {
            displaySidebar();
        },
        id: "warcviewer-menuitem",
        label: "WARC viewer",
        menuid: "menu_ToolsPopup",
        insertafter: "devToolsSeparator"
    });

    function openFileDialog(callback) {
        var quickIO = require("quickFileIO").quickIO();
        quickIO.filterAll = false;
        quickIO.filterExtra.push(["WARC", "*.warc.gz; *.warc"]);
        quickIO.filterExtra.push(["All files", "*.*; *"]);
        quickIO.dialogOpenTitle = "Open archive";
        quickIO.open(callback);
    }
    
    function getProxySettings() {
        var keys = [
          "network.proxy.type",
          "network.proxy.share_proxy_settings",
          "network.proxy.http",
          "network.proxy.http_port",
          "network.proxy.no_proxies_on"
        ];
        var p = {};
        for (var i=0; i<keys.length; i++) {
            p[keys[i]] = pref.get(keys[i]);
        }
        return p;
    }
    function setProxySettings(p) {
        for (var k in p) {
            pref.set(k, p[k]);
        }
    }
    var oldProxySettings = null,
        proxyEnabled = false;
    function startProxying() {
        if (!oldProxySettings) {
            oldProxySettings = getProxySettings()
        }
        proxyEnabled = true;
        setProxySettings({
            "network.proxy.type": 1,
            "network.proxy.share_proxy_settings": true,
            "network.proxy.http": "127.0.0.1",
            "network.proxy.http_port": 8000,
            "network.proxy.no_proxies_on": "localhost, 127.0.0.1"
        });
    }
    function stopProxying() {
        proxyEnabled = false;
        if (oldProxySettings) {
            setProxySettings(oldProxySettings);
            oldProxySettings = null;
        }
    }
    
    function handleContentScript(contentWindow, contentDocument, pageWorker, pwPort) {
        contentWindow.addEventListener('unload', function(e) {
            stopProxying();
        });
        
        pwPort.on("toggle.proxy", function(new_state) {
            if (new_state) {
                startProxying();
                pwPort.emit("proxy.enabled");
            }
            else stopProxying();
        });
        
        pwPort.on("open.warc.file", function() {
            openFileDialog(function(file, path) {
                if (file) {
                    pwPort.emit("open.warc.file", path);
                }
            });
        });
        
        pwPort.on("navigate", function(url) {
            tabs.activeTab.url = url;
        });
    }
    
    function displaySidebar() {
        require("webpanel-sidebar").open(data.url("list.html"),
                                         "WARC viewer",
                                         data.url("contentscript.js"),
                                         handleContentScript);
    }
}
