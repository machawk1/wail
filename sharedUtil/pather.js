import path from 'path'
import autobind from 'autobind-decorator'

export default class Pather {
  constructor (base) {
    this.base = base
  }

  @autobind
  join () {
    if (arguments.length === 0) {
      return path.join(this.base)
    } else {
      return path.join(this.base, ...arguments)
    }
  }

  @autobind
  joinWithBase() {
    return path.join(...arguments)
  }

  @autobind
  normalizeJoin () {
    if (arguments.length === 0) {
      return path.join(this.base)
    } else {
      return path.normalize(this.join(...arguments))
    }
  }

  baseName (what) {
    return path.basename(what)
  }

  baseNameNoExt (what, ext) {
    return path.basename(what, ext)
  }

  sep () {
    return path.sep
  }
}