import createDMG from "electron-installer-dmg"
import path from "path"
import fs from "fs-extra"

///home/john/wail/release/darwin-x64/wail-darwin-x64/wail.app
let release = path.resolve("./release")
let wailOSXp = path.join(release,"darwin-x64/wail-darwin-x64/wail.app")
if(fs.existsSync(wailOSXp)) {
  let dmgOPTS = {
    appPath: wailOSXp,
    name: "wail",
    out: release,
    debug: true,
  }
  createDMG(dmgOPTS, err => {
    if(err) {
      console.error("There was an error",err)
    } else  {
      console.log("There was no error in building the dmg")
    }
  })
}
