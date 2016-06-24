import schedule from 'node-schedule'
import {getHeritrixJobsState, heritrixAccesible} from '../actions/heritrix-actions'
import {waybackAccesible} from '../actions/wayback-actions'

/*

 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)

 */
class monitors {
   constructor() {
      this.schedules = []
      this.started = {
         jobs: false,
         reachability: false,
         test: false,
      }
      this.checkJobStatuses = this.checkJobStatuses.bind(this)
      this.checkReachability = this.checkReachability.bind(this)
      this.simpleTest = this.simpleTest.bind(this)
      this.cancelAll = this.cancelAll.bind(this)
   }

   cancelAll() {
      this.schedules.forEach(s => s.cancel())
   }

   checkReachability(cb) {
      if (!this.started.reachability) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*    */5    *    *    *    *', () => {
            let statues = {
               heritrix: false,
               wayback: false
            }
            heritrixAccesible(false)
               .then(ha => statues.heritrix = ha.status)
               .catch(hdown => statues.heritrix = hdown.status)
               .finally(() =>
                  waybackAccesible(false)
                     .then(wba => statues.wayback = wba.status)
                     .catch(wbdown => statues.wayback = wbdown.status)
                     .finally(() => {
                        cb(statues)
                        console.log("Done with status checks ", statues)
                     })
               )
         }))
         this.started.reachability = true
      }
   }

   checkJobStatuses(cb) {
      if (!this.started.jobs) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*    */3    *    *    *    *', () => {
            getHeritrixJobsState()
               .then(status => {
                  cb(status)
               })
               .catch(error => {
                  cb(error)
               })
         }))
         this.started.jobs = true
      }
   }

   simpleTest(cb) {
      console.log("simple test")
      if (!this.started.test) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*/2    *    *    *    *    *', () => {
            console.log("firing simple test")
            cb(`From the background ${Date.now()}`)
         }))
         this.started.test = true
      }
   }
}

const Monitors = new monitors
export default Monitors

