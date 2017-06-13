/**
 * @desc Test to see if a ``plain object`` is empty
 * @param {Object?} object
 * @return {boolean}
 */
function isEmptyPlainObject (object) {
  if (object === null || object === undefined) {
    return true
  }
  let k
  for (k in object) {
    if (object.hasOwnProperty(k)) {
      return false
    }
  }
  return true
}

module.exports = isEmptyPlainObject
