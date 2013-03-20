// webpanel-sidebar.js - Webpanel Sidebar's module
// author: jongo45


var { Cc, Cu, Ci } = require('chrome');
var WindowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
//var WindowUtils = require('window-utils');

exports.open=open;

function getMostRecentWindow(){
    return WindowMediator.getMostRecentWindow("navigator:browser");
};

function open(url,title,contentScriptFile,fnCallbackContentLoaded){

    //callback:     fnCallbackContentLoaded(contentWindow,contentDocument,pageWorker,pwPort);
    url=url||"about:blank";
    title=title||"";

    var window=getMostRecentWindow();
    if(window){
        var document=window.document;
        if(window.openWebPanel){
             try{
                window.openWebPanel(title,url);                    
            }
            catch(err){
                console.info(err);
            }
            //return;
            getSidebarWebPanelContentDocument(window,document,url,title,gotWebPanelContentDocument);
            return;     //skip page worker functionality for now;           
        }
    } 
    function gotWebPanelContentDocument(contentWindow,contentDocument){
        if(contentWindow && contentDocument){
            var pageWorker;
            var pwPort;
            if(contentScriptFile){
                var options={
                    contentScriptFile:contentScriptFile
                };
                pageWorker=attachWorker(contentWindow,options);
                pwPort=pageWorker.port;
            }
            if(fnCallbackContentLoaded){
                fnCallbackContentLoaded(contentWindow,contentDocument,pageWorker,pwPort);    
            }
        }
        else{
            console.info("error: gotWebPanelContentDocument");
        }
    } 
};

function getSidebarWebPanelContentDocument(window,document,url,title,fnCallback){


    //include document URL in getSidebarWebPanelContentDocument(window,document,fnCallback) function parameters
    /*
    RESUME CODING HERE.
    RESUME CODING HERE.
    return;
    */
    

    //var urlAboutBlank=false;
    var urlAboutBlank=!!url.match(/^about:blank$/i);
    
    
    console.info("opening sidebar webpanel");
	var sidebar=$("#sidebar",document);
	if(	sidebar.docShell &&
        sidebar.contentDocument &&
        sidebar.contentDocument.getElementById("web-panels-browser")){
        
        //poke("sidebar load (synch)")
        listenWebpanelContentLoaded(sidebar);
	}
	else{
        listen(sidebar,"DOMContentLoaded",function(){
            //poke("sidebar load (async)");
            listenWebpanelContentLoaded(sidebar);
    	});  
	}
    function listenWebpanelContentLoaded(sidebar){
        var webpanelsbrowser=sidebar.contentDocument.getElementById("web-panels-browser");
        
        //webpanelsbrowser.addEventListener("DOMContentLoaded", onDOMContentLoad);
        listen(webpanelsbrowser,"DOMContentLoaded", onDOMContentLoad);  
        function onDOMContentLoad(){
        	var contentWindow=webpanelsbrowser.contentWindow;
			var contentDocument=webpanelsbrowser.contentDocument;
            
            //poke("webpanel",contentDocument,contentDocument.readyState,contentDocument.title,contentDocument.URL);
            
            if(!urlAboutBlank && contentWindow.location.href.match(/^about:blank$/))return true;
            fnCallback(contentWindow,contentDocument);
            return;

        }
    }
    function $ (selector, context) {
        context = context||document;
    	return context.querySelector(selector);
	}
}

function listen(element,eventType,fnListener,trueUseCapture, trueWantsUntrusted){
    element.addEventListener(eventType,trig,trueUseCapture,trueWantsUntrusted);
    function trig(evt){
        var continueListening=fnListener(evt);
        if(continueListening)return;
        else element.removeEventListener(eventType,trig,trueUseCapture,trueWantsUntrusted);
    }
}

function attachWorker(contentWindow,options){
    let { Worker } = require("content/worker");
    options.window = contentWindow;
    let worker = Worker(options);
    worker.once("detach", function detach() {
      worker.destroy();
    });
    return worker;
    
}


//meh
/*
function looksy(doc){
    poke(doc.body.textContent);
}
*/

function poke(){
    var args = Array.prototype.slice.call(arguments);
    console.info(
        "poke:\n" + args.map(function(a){
            if(typeof(a)=="object"){
                return [a.toString(),":\n",JSON.stringify(a,"\t"),"\n"].join("");
            }
            return a;
        }).join("\n")
    );
}
























