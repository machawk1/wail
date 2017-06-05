import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { BehaviorSubject } from 'rxjs'
import Divider from 'material-ui/Divider'
import SelectCol from './selectCol'
import Search from '../../utilComponents/Search'
import { selectCollection } from '../../../constants/uiStrings'

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
      <div className="inheritThyWidthHeight">
        <Search
          id='filtercols'
          hintText={selectCollection.filterSelectSearchHint}
          tooltip={selectCollection.filterSelectToolTip}
          searchSubject={this.filterText}
        />
        <Divider />
        <div id='selectColList' className="selectCollectionContainerDiv">
          <SelectCol filterText={this.filterText}/>
        </div>
      </div>
    )
  }
}
