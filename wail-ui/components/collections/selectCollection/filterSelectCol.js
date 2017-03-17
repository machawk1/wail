import React, { Component, PropTypes } from 'react'
import {BehaviorSubject} from 'rxjs'
import Divider from 'material-ui/Divider'
import SelectColTable from './selectColTable'
import Search from '../../utilComponents/Search'

export default class FilterSelectCol extends Component {
  constructor (...args) {
    super(...args)
    this.filterText = new BehaviorSubject('')
  }

  componentWillUnmount () {
    this.filterText.complete()
    this.filterText = null
  }

  render () {
    return (
      <div>
        <Search tooltip={'Search By Collection Name'} searchSubject={this.filterText}/>
        <Divider />
        <div style={{height: 'inherit'}}>
          <SelectColTable filterText={this.filterText}/>
        </div>
      </div>
    )
  }
}
