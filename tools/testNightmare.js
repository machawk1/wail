import 'babel-polyfill'
import Promise from 'bluebird'
import fs from 'fs-extra'
import got from 'got'
import rp from 'request-promise'
import FormData from 'form-data'
import crypto from 'crypto'
Promise.promisifyAll(fs)

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//
// let options = {
//   method: "POST",
//   uri: "https://localhost:8443/engine/job/1468042466879",
//   form: {
//     action: "launch"
//   },
//   auth: {
//     username: "lorem",
//     password: "ipsum",
//     sendImmediately: false
//   },
//   rejectUnauthorized: false,
//   resolveWithFullResponse: true,
// }
// rp(options)
//   .then(response => {
//     // POST succeeded...
//     console.log("sucess in launching job", response)
//   })
//   .catch(err => {
//     if (err.statusCode == 303) {
//       console.log("303 sucess in launch job", err)
//     } else {
//       // POST failed...
//       console.log("failur in launching job", err)
//     }
//   })

var array1 = [1, 2, 3];
var array2 = [4, 5, 6];
Array.prototype.push.apply(array1, array2);

console.log(array1); // is: [1, 2, 3, 4, 5, 6]
