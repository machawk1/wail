import wailConstants from '../constants/wail-constants'
import child_process from 'child_process'
import rp from 'request-promise'
import cheerio from 'cheerio'
import fs from 'fs-extra'


const heritrix = wailConstants.Heritrix
const paths = wailConstants.Paths

export async function launchHeritrix() {
   child_process.exec(`sh ${paths.heritrixBin} -a=${heritrix.username}:${heritrix.password}`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export async function killHeritrix() {
   child_process.exec("ps ax | grep \'heritrix\' | grep -v grep | awk \'{print \"kill -9 \" $1}\' | sh", (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export async function makeHeritrixJobConf(urls, hops) {
   fs.readFileAsync(heritrix.jobConf, "utf8")
      .then(data => {
         let doc = cheerio.load(data, {
            xmlMode: true
         })
         let jobId = new Date().getTime()
         // console.log(doc.xml())
         let urlConf = doc('bean[id="longerOverrides"]').find('prop[key="seeds.textSource.value"]')
         let urlText
         if (Array.isArray(urls)) {
            console.log('array')
            urlText = urls.join("\r\n")
         } else {
            urlText = `\r\n${urls}\r\n`
         }
         urlConf.text(urlText)


         // <property name="maxHops" value="''' + str(depth) + '''" />
         let maxHops = doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').find('property[name="maxHops"]')
         maxHops.attr('value', `${hops}`)
         // console.log(doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').html())
         let warFolder = doc('bean[id="warcWriter"]').find('property[name="storePaths"]').find('list')
         warFolder.append(`<value>${paths.warcs}</value>`)
         let confPath = `${paths.heritrixJob}/${jobId}`
         fs.ensureDir(confPath, er => {
            fs.writeFile(`${confPath}/crawler-beans.cxml`, doc.xml(), 'utf8', error => console.log(error))
         })


      })
}

export async function buildHeritrixJob(jobId) {
   let data = {action: "launch"}
   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         /* 'Content-type': 'application/x-www-form-urlencoded' */ // Set automatically
      },
      form: {
         action: "build"
      },
      auth: {
         usr: heritrix.username,
         pass: heritrix.password
      },
      resolveWithFullResponse: true,
   }

   rp(options)
      .then(response => {
         // POST succeeded...
      })
      .catch(err => {
         // POST failed...
      })

}

export async function launchHeritrixJob(jobId) {

   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         /* 'Content-type': 'application/x-www-form-urlencoded' */ // Set automatically
      },
      form: {
         action: "launch"
      },
      auth: {
         usr: heritrix.username,
         pass: heritrix.password
      },
      resolveWithFullResponse: true,
   }

   rp(options)
      .then(response => {
         // POST succeeded...
      })
      .catch(err => {
         // POST failed...
      })
}

export async function sendActionToHeritrix(act, jobId) {

   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         /* 'Content-type': 'application/x-www-form-urlencoded' */ // Set automatically
      },
      form: {
         action: act
      },
      auth: {
         usr: heritrix.username,
         pass: heritrix.password
      },
      resolveWithFullResponse: true,
   }

   rp(options)
      .then(response => {
         // POST succeeded...
      })
      .catch(err => {
         // POST failed...
      })
}
