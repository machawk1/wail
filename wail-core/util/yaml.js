import fs from 'fs-extra'
import Promise from 'bluebird'
import yaml from 'js-yaml'

class YamlError extends Error {
  constructor (oError, where) {
    super(`YamlError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
  }
}

export const readYaml = yamlPath => new Promise((resolve, reject) => {
  fs.readFile(yamlPath, 'utf8', (err, yamlString) => {
    if (err) {
      reject(new YamlError(err, 'reading'))
    } else {
      try {
        const doc = yaml.safeLoad(yamlString)
        resolve(doc)
      } catch (errLoad) {
        reject(new YamlError(errLoad, 'parsing'))
      }
    }
  })
})

export const writeYaml = (yamlPath, obj) => new Promise((resolve, reject) => {
  try {
    const dumped = yaml.dump(obj, {flowLevel: 3})
    fs.writeFile(yamlPath, dumped, 'utf8', errW => {
      if (errW) {
        reject(new YamlError(errW, 'writing'))
      } else {
        resolve()
      }
    })
  } catch (errDump) {
    reject(new YamlError(errDump, 'converting'))
  }
})

export const getYamlOrWriteIfAbsent = async (yamlPath, obj) => {
  let yamlData
  try {
    yamlData = await readYaml(yamlPath)
  } catch (yamlError) {
    yamlData = obj
    try {
      await writeYaml(yamlPath, yamlData)
    } catch (writeError) {
      throw writeError
    }
  }
  return yamlData
}
