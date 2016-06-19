import path from 'path'
import bunyan from 'bunyan'

const logger = bunyan.createLogger({
   name: 'wail',
   streams: [
      {
         level: 'debug',
         stream: process.stdout            // log INFO and above to stdout
      },
   ]
})


export default  logger