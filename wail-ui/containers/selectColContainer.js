import React from 'react'
import { namedPure } from '../util/recomposeHelpers'
import { FilterSelectCol } from '../components/collections/selectCollection'

const enhance = namedPure('SelectColContainer')

const SelectColContainer = () => (
  <div className="widthHeightHundoPercent" id='cViewContainer'>
    <FilterSelectCol />
  </div>
)

export default enhance(SelectColContainer)
