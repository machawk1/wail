import React, { PropTypes } from 'react'
import { Flex } from 'react-flex'
import SeedList from './seedList'
import ErrorList from './errorList'

const SelectSeed = ({onSubmit, checkingDone, warcSeeds, hadErrors}) => (
  <Flex row >
    <SeedList onSubmit={onSubmit} warcSeeds={warcSeeds}/>
    <ErrorList done={checkingDone} hadErrors={hadErrors}/>
  </Flex>
)

SelectSeed.propTypes = {
  checkingDone: PropTypes.bool.isRequired,
  hadErrors: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  warcSeeds: PropTypes.array.isRequired
}

export default SelectSeed