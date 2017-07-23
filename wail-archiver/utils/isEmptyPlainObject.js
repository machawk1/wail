import isEmpty from 'lodash/isEmpty'
/**
 * @desc Test to see if a ``plain object`` is empty
 * @param {Object?} object
 * @return {boolean}
 */
export default function isEmptyPlainObject (object) {
  if (object === null || object === undefined) {
    return true
  }
  return isEmpty(object)
}

