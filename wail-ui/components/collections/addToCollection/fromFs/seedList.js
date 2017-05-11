import React from 'react'
import PropTypes from 'prop-types'
import configureFormPage from './configureFormPage'

const SeedList = ({warcSeeds, onSubmit}) => (
  <div style={{marginLeft: 16, width: '100%'}}>
    {warcSeeds.length > 0 && configureFormPage(onSubmit, warcSeeds)}
    {warcSeeds.length <= 0 && <p>No Seeds To Add</p>}
  </div>
)

SeedList.propTypes = {
  warcSeeds: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default SeedList
