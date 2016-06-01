import wailConstants from '../constants/wail-constants'
import child_process from 'child_process'
import fs from 'fs-extra'
import cheerio from 'cheerio'
import Promise from 'bluebird'
import _ from 'lodash'

Promise.promisifyAll(fs)

const heritrix = wailConstants.Heritrix
const paths = wailConstants.Paths

export async function launchHeritrix() {
    child_process.exec(`sh ${paths.heritrixBin} -a=${heritrix.username}:${heritrix.password}`, (err, stdout, stderr) => {
        console.log(err, stdout, stderr)
    })
}

export async function killHeritrix() {
    child_process.exec("ps ax | grep 'heritrix' | grep -v grep | awk '{print \"kill -9 \" $1}'\" | sh", (err, stdout, stderr) => {
        console.log(err, stdout, stderr)
    })
}

export async function makeHeritrixJobConf(urls) {
    console.log(heritrix.jobConf)
    fs.readFileAsync(heritrix.jobConf, "utf8")
        .then(data => {
            let doc = cheerio.load(data, {
                xmlMode: true
            })
            // console.log(doc.xml())
            let urlConf = doc('bean[id="longerOverrides"]')
            let urlText
            if(Array.isArray(urls)){
                console.log('array')
                urlText = urls.join('\r\n')
            } else {
                urlText = `${urls}\r\n`
            }

            let warFolder = doc('bean[id="warcWriter"]').find('property[name="storePaths"]').find('list')
            console.log(warFolder.html())
            warFolder.append(`<value>${paths.warcs}</value>`)
            console.log(warFolder.html())
            console.log(doc('bean[id="warcWriter"]').html())
            console.log(urlText)
            // console.log(doc.childNodes())
            // console.log(root.name())
            // console.log(root.text())
            // console.log(urlConf.text())
            // console.log(urls.xml())

        })
}

export async function launchHeritrixJob(jobText) {

    child_process.exec(`sh ${paths.heritrixBin} -a=${heritrix.username}:${heritrix.password}`, (err, stdout, stderr) => {
        console.log(err, stdout, stderr)
    })
}
