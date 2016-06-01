import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
import cheerio from 'cheerio'

Promise.promisifyAll(fs)

fs.readFileAsync(path.join(path.resolve('./'),'crawler-beans.cxml'), "utf8")
   .then(data => {
      let doc = cheerio.load(data,{
         xmlMode: true
      })
       // console.log(doc.xml())
       'bean[id="warcWriter"]'
       let urls = doc('bean[id="longerOverrides"]')
       // console.log(doc.childNodes())
       // console.log(root.name())
       // console.log(root.text())
       console.log(urls.text())
       // console.log(urls.xml())

   })

