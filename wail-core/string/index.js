import S from 'string'
import slen from 'string-length'
import swidth from 'string-width'
import * as ldsm from './lodashStringMethods'
import completeAssign from '../util/completeAssign'

const wailString = {
  S,
  get TMPL_OPEN () {
    return S.TMPL_OPEN
  },
  get TMPL_CLOSE () {
    return S.TMPL_CLOSE
  },
  set TMPL_OPEN (to) {
    S.TMPL_OPEN = to
  },
  set TMPL_CLOSE (to) {
    S.TMPL_CLOSE = to
  },
  slen,
  swidth,
  stringLen: slen,
  stringLength: slen,
  stringWidth: swidth,
  stringWdth: swidth
}

export default completeAssign(wailString, ldsm)
