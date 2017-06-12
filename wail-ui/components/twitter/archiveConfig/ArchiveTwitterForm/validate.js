import timeValues from '../timeValues'

export default function validate (values) {
  const errors = {}
  let length = values.get('length')
  if (!length) {
    errors.length = 'Until Time Is Required'
  } else {
    if (!timeValues.values[ length ]) {
      errors.length = 'Must Choose Until Time'
      log('empty')
    }
  }

  let sname = values.get('screenName')
  if (!sname || sname === '') {
    errors.screenName = 'Screen Name Required'
  }

  if (!values.get('forCol')) {
    errors.forCol = 'Collection Required'
  }

  return errors
}
