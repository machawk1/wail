import S from 'string'
import slen from 'string-length'
import swidth from 'string-width'
import camelCase from 'lodash/camelCase'
import capitalize from 'lodash/capitalize'
import deburr from 'lodash/deburr'
import endsWith from 'lodash/endsWith'
import escape from 'lodash/escape'
import escapeRegExp from 'lodash/escapeRegExp'
import kebabCase from 'lodash/kebabCase'
import lowerCase from 'lodash/lowerCase'
import lowerFirst from 'lodash/lowerFirst'
import pad from 'lodash/pad'
import padEnd from 'lodash/padEnd'
import padStart from 'lodash/padStart'
import parseInt from 'lodash/parseInt'
import repeat from 'lodash/repeat'
import replace from 'lodash/replace'
import snakeCase from 'lodash/snakeCase'
import split from 'lodash/split'
import startCase from 'lodash/startCase'
import startsWith from 'lodash/startsWith'
import template from 'lodash/template'
import toLower from 'lodash/toLower'
import toUpper from 'lodash/toUpper'
import trim from 'lodash/trim'
import trimEnd from 'lodash/trimEnd'
import trimStart from 'lodash/trimStart'
import truncate from 'lodash/truncate'
import unescape from 'lodash/unescape'
import upperCase from 'lodash/upperCase'
import upperFirst from 'lodash/upperFirst'
import words from 'lodash/words'

export default class StringUtil {

  static newS (defaultV = '') {
    return S(defaultV)
  }

  static get TMPL_OPEN () {
    return S.TMPL_OPEN
  }

  static get TMPL_CLOSE () {
    return S.TMPL_CLOSE
  }

  static set TMPL_OPEN (to) {
    S.TMPL_OPEN = to
  }

  static set TMPL_CLOSE (to) {
    S.TMPL_CLOSE = to
  }

  static realStringLen (s) {
    return slen(s)
  }

  static stringWidth (s) {
    return swidth(s)
  }

  static camelCase (s) {
    return camelCase(s)
  }

  static capitalize (s) { return capitalize(s) }

  static deburr (s) {return deburr(s)}

  static endsWith (s, target, position) {return endsWith(s, target, position)}

  static escape (s) { return escape(s) }

  static escapeRegExp (s) { return escapeRegExp(s) }

  static kebabCase (s) { return kebabCase(s) }

  static lowerCase (s) { return lowerCase(s) }

  static lowerFirst (s) { return lowerFirst(s) }

  static pad (string, length, chars) { return pad(string, length, chars) }

  static padEnd (string, length, chars) { return padEnd(string, length, chars)}

  static padStart (string, length, chars) { return padStart(string, length, chars) }

  static parseInt (s, radix) { return parseInt(s, radix) }

  static repeat (s, n) { return repeat(s, n) }

  static replace (s, pattern, replacement) { return replace(s, pattern, replacement)}

  static snakeCase (s) { return snakeCase(s) }

  static split (s, separator, limit) { return split(s, separator, limit) }

  static startCase (s) { return startCase(s) }

  static startsWith (s, target, position) { return startsWith(s, target, position) }

  static template (s, options) { return template(s, options) }

  static toLower (s) { return toLower(s) }

  static toUpper (s) { return toUpper(s) }

  static trim (s, chars) { return trim(s, chars) }

  static trimEnd (s, chars) { return trimEnd(s, chars) }

  static trimStart (s, chars) { return trimStart(s, chars) }

  static truncate (s, options) { return truncate(s, options) }

  static unescape (s) { return unescape(s) }

  static upperCase (s) { return upperCase(s) }

  static upperFirst (s) { return upperFirst(s) }

  static words (s, pattern) { return words(s, pattern) }
}



