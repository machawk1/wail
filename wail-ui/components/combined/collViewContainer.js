import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'

export default (props) => (
  <div style={{ width: '100%', height: '100%' }}>
    <div>
      {props.main}
    </div>
    <Divider />
    <div style={{ height: 'inherit' }}>
      {props.header}
    </div>
  </div>
)

