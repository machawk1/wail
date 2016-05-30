// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// add the script that contains react. if we are run with HOT=1 then we know that we are hot loading changes
// otherwise we would be running a production version
const script = document.createElement('script')
script.src = (process.env.HOT) ? 'http://localhost:8080/main.js' : '../dist/main.js'
document.write(script.outerHTML)