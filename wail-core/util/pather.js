import path from 'path'
import autobind from 'autobind-decorator'

export default class Pather {
  constructor (base) {
    this.base = base
  }

  @autobind
  joinWBase () {
    if (arguments.length === 0) {
      return path.join()
    } else {
      return path.join(this.base, ...arguments)
    }
  }

  @autobind
  join () {
    return path.join(...arguments)
  }

  @autobind
  normalizeJoinWBase () {
    if (arguments.length === 0) {
      return path.join()
    } else {
      return path.normalize(this.joinWBase(...arguments))
    }
  }

  @autobind
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
