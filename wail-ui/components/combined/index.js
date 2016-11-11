import React, {Component, PropTypes} from 'react'
import SelectionCollection from './SelectCollection'

export default ({ children, location, params, route }) => {
  console.log(location, children)
  return (
    <div style={{ width: 'inherit', height: 'inherit' }}>
      <SelectionCollection location={location} params={params} route={route}/>
      {children}
    </div>
  )
}


