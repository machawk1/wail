// This phantomjs script is intended to query your local Wayback at a specific address
//  and return whether the URI passed in exists in the archive. -1 = no, anything else = yes
// Usage: phantomjs existsInArchive.js http://example.com

var page = require('webpage').create();
var args = require('system').args;
var uri = args[1].replace("%0D%0A","").replace("\r\n","");

uri = "http://localhost:8080/wayback/*/"+uri;

page.onConsoleMessage = function (msg){
    console.log(msg);     
};   

page.open(uri, function () {
 page.evaluate(function () {
  console.log(document.documentElement.innerHTML.indexOf("Search Results for "));
 });
 phantom.exit();
});

