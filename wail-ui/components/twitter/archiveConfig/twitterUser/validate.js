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
  const htErrors = []
  let hts = values.get('hashtags')
  if (hts && hts.size > 0) {
    let swapper = S('')
    hts.forEach((ht, idx) => {
      console.log(ht)
      if (swapper.setValue(ht).isEmpty()) {
        htErrors[ idx ] = 'Cant Have Empty HashTag'
      }
      return true
    })
    /*
     Array.from(hts.values()).forEach((ht, idx) => {
     if (swapper.setValue(ht).isEmpty()) {
     htErrors[ idx ] = 'Cant Have Empty HashTag'
     }
     })
     */
  }

  if (!values.get('screenName')) {
    errors.screenName = 'Screen Name Required'
  }

  if (!values.get('forCol')) {
    errors.forCol = 'Collection Required'
  }
  if (htErrors.length) {
    errors.hashtags = htErrors
  }
  return errors
}