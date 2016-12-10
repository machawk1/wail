import path from 'path'
import S from 'string'

const theSwapper = S('')

const seedName = name => {
  // if (name.indexOf('.warc') > 0) {
  //   return path.basename(name, '.warc')
  // }
  // return path.basename(name, '.arc')
  return theSwapper.setValue(name).strip('.').s
}

export default seedName
