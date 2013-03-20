// browser-window.js - quick symbol lookup's module
// author: jongo45

var { Cc, Cu, Ci } = require('chrome');
var WindowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
//var WindowUtils = require('window-utils');


exports.getMostRecentWindow=function(){return WindowMediator.getMostRecentWindow("navigator:browser");};
