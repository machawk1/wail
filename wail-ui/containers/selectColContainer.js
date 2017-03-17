import React from 'react'
import { namedPure } from '../util/recomposeHelpers'
import { FilterSelectCol } from '../components/collections/selectCollection'

const enhance = namedPure('SelectColContainer')

const SelectColContainer = () => (
  <div style={{width: '100%', height: '100%'}} id='cViewContainer'>
    <FilterSelectCol />
  </div>
)

export default enhance(SelectColContainer)
