import path from 'path'
import ElectronSettings from 'electron-settings'

const loadSettings = () => {
  const plat = process.platform
  let configDirPath
  if (plat === 'linux') {
    configDirPath = path.join(process.env['HOME'], '.config/WAIL/wail-settings')
  } else if (plat === 'darwin') {
    configDirPath = plat.join(process.env['HOME'], 'Library/Application\\ Support/WAIL/wail-settings')
  }
  return new ElectronSettings({configDirPath})
}

export default loadSettings
