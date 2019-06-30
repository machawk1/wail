import timeValues from '../timeValues'
import S from 'string'
const log = ::console.log

export default function validate (values) {
  log('validate', values.toJS())
  const errors = {}
  let length = values.get('length')
  if (!length) {
    console.log('no length')
    errors.length = 'Must Choose Time Unit'
  } else {
    if (!timeValues.values[ length ]) {
      errors.length = 'Must Choose Time Unit'
      log('empty')
    }
  }
  const stErrors = []
  let sts = values.get('searchT')
  if (!sts || sts.size === 0) {
    stErrors[0] = 'Search Term Required'
  } else {
    let swapper = S('')
    sts.forEach((ht, idx) => {
      if (swapper.setValue(ht).isEmpty()) {
        stErrors[ idx ] = 'Cant Have Empty HashTag'
      }
      return true
    })
  }

  if (!values.get('screenName')) {
    errors.screenName = 'Screen Name Required'
  }

  if (!values.get('forCol')) {
    errors.forCol = 'Collection Required'
  }
  if (stErrors.length) {
    errors.searchT = stErrors
  }
  return errors
}
