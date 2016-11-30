import path from 'path'

const seedName = name => {
  if (name.indexOf('.warc') > 0) {
    return path.basename(name, '.warc')
  }
  return path.basename(name, '.arc')
}


export default seedName