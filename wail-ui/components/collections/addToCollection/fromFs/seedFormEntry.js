import React, { PropTypes } from 'react'
import { Field } from 'redux-form/immutable'
import { RadioButtonGroup } from 'redux-form-material-ui'

const SeedFormEntry = ({name, seeds, height}) => (
  <Field
    style={{overflowY: 'auto', height, maxHeight: height - 270}}
    name={name}
    component={RadioButtonGroup}
  >
    {seeds}
  </Field>
)

SeedFormEntry.propTypes = {
  height: PropTypes.number.isRequired,
  seeds: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
}

export default SeedFormEntry

