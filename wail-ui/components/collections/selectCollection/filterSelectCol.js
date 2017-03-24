import React, { Component, PropTypes } from 'react'
import {BehaviorSubject} from 'rxjs'
import Divider from 'material-ui/Divider'
import SelectCol from './selectCol'
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
      <div style={{width: 'inherit', height: 'inherit'}}>
        <Search
          id='filtercols'
          hintText='Collection Name'
          tooltip={'Search By Collection Name'}
          searchSubject={this.filterText}
        />
        <Divider />
        <div
          id='selectColList'
          style={{height: 'inherit',  margin: 'auto', paddingTop: '5px', paddingLeft: '35px', paddingRight: '35px'}}
        >
          <SelectCol filterText={this.filterText}/>
        </div>
      </div>
    )
  }
}
