import React, {Component, PropTypes} from 'react'
import {SelectColHeader, FilterSelectCol} from '../components/collections/selectCollection'

const SelectColContainer = () => (
  <div style={{ width: '100%', height: '100%' }} id='cViewContainer'>
    <SelectColHeader />
    <FilterSelectCol />
  </div>
)

export default SelectColContainer