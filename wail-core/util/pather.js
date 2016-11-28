import path from 'path'
import autobind from 'autobind-decorator'

export default class Pather {
  constructor (base) {
    this.base = base
  }


  joinWBase () {
    if (arguments.length === 0) {
      return path.join()
    } else {
      return path.join(this.base, ...arguments)
    }
  }

  join () {
    return path.join(...arguments)
  }

  normalizeJoinWBase () {
    if (arguments.length === 0) {
      return path.join()
    } else {
      return path.normalize(this.joinWBase(...arguments))
    }
  }

  normalizeJoin () {
    if (arguments.length === 0) {
      return path.join()
    } else {
      return path.normalize(path.join(...arguments))
    }
  }

  baseName (what) {
    return path.basename(what)
  }

  baseNameNoExt (what, ext) {
    return path.basename(what, ext)
  }
}
