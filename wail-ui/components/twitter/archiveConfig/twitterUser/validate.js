import timeValues from '../timeValues'
import S from 'string'
const log = ::console.log

export default function validate (values) {
  // log('validate', values.toJS())
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

  if (!values.get('screenName')) {
    errors.screenName = 'Screen Name Required'
  }

  if (!values.get('forCol')) {
    errors.forCol = 'Collection Required'
  }

  return errors
}
