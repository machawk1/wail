import fs from 'fs'

const resourcesToCopy = [ 
   { 
      from: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
      to: 'src/public/css/bootstrap.min.css'
   },
]

console.log("Running")
resourcesToCopy.forEach(copy => fs.createReadStream(copy.from).pipe(fs.createWriteStream(copy.to)))