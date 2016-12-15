import React, { PropTypes } from 'react'
import { Field } from 'redux-form/immutable'
import { RadioButtonGroup } from 'redux-form-material-ui'
import MyAutoSizer from '../../../utilComponents/myAutoSizer'

const SeedFormEntry = ({containerName, name, seeds, height}) => (
  <MyAutoSizer findElement={containerName}>
    {
      ({height}) => (
        <Field
          style={{marginLeft: 10, overflowY: 'auto', width: '97%', height, maxHeight: height - 370}}
          name={name}
          component={RadioButtonGroup}
        >
          {seeds}
        </Field>
      )
    }
  </MyAutoSizer>
)

SeedFormEntry.propTypes = {
  containerName: PropTypes.string.isRequired,
  seeds: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
}

export default SeedFormEntry

