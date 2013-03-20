var page = require('webpage').create();
var args = require('system').args;
var uri = args[1].replace("%0D%0A","").replace("\r\n","");

console.log(uri);

page.onConsoleMessage = function (msg){
    console.log(msg);     
};   

page.open(uri, function () {
 page.evaluate(function () {
  var actions = document.getElementsByName('action');
  var build = actions[0];
  build.click();
 });
});

