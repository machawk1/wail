import React, { PropTypes } from 'react'
import SeedList from './seedList'
import DisplayInvalidMessage from './displayInvalidMessage'

const SelectSeed = ({onSubmit, checkingDone, warcSeeds, hadErrors}) => {
  let errorsLen = hadErrors.length
  let renderComponent
  if (errorsLen > 0) {
    renderComponent = <DisplayInvalidMessage hadErrors={hadErrors}/>
  } else {
    renderComponent = <SeedList onSubmit={onSubmit} warcSeeds={warcSeeds}/>
  }
  return (renderComponent)
}

SelectSeed.propTypes = {
  checkingDone: PropTypes.bool.isRequired,
  hadErrors: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  warcSeeds: PropTypes.array.isRequired
}

export default SelectSeed