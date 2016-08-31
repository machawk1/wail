import path from 'path'
import autobind from 'autobind-decorator'

export default class Pather {
  constructor (base) {
    this._base = base
  }

  @autobind
  joinWBase () {
    if (arguments.length === 0) {
      return path.join(this._base)
    } else {
      return path.join(this._base, ...arguments)
    }
  }

  @autobind
  join () {
    return path.join(...arguments)
  }

  @autobind
  normalizeJoinWBase () {
    if (arguments.length === 0) {
      return path.join(this._base)
    } else {
      return path.normalize(this.join(...arguments))
    }
  }

  @autobind
  normalizeJoin () {
    if (arguments.length === 0) {
      return path.join(this._base)
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

  sep () {
    return path.sep
  }

  get base () {
    return this.base
  }
}
