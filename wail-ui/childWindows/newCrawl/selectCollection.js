import React, {Component, Proptypes}  from 'react'
import autobind from 'autobind-decorator'
import AutoComplete from 'material-ui/AutoComplete'
import wailConstants from '../../constants/wail-constants'
import ncs from './crawlUrlsStore'
import ncd from './crawlUrlsDispatcher'

const {NEW_CRAWL_COL_SELECTED} = wailConstants.EventTypes

export default class SelectCollection extends Component {
    constructor (...args) {
      super(...args)
      this.state = {
        cols: ncs.cols
      }
    }

  @autobind
  handleChange (choice,index) {
    console.log('new crawl select collection handle Change',choice,index)
    if (index === -1) {
      if (this.state.cols.includes(choice)) {
        ncd.dispatch({
          type: NEW_CRAWL_COL_SELECTED,
          forCol: choice
        })
      }
    } else {
      ncd.dispatch({
        type: NEW_CRAWL_COL_SELECTED,
        forCol: this.state.cols[index]
      })
    }

  }

    render (){
      return (
        <AutoComplete
          style={{paddingLeft: '20px'}}
          searchText={wailConstants.Default_Collection}
          openOnFocus
          maxSearchResults={5}
          hintText="For Collection"
          floatingLabelText={'Archive To Collection'}
          filter={AutoComplete.fuzzyFilter}
          dataSource={this.state.cols}
          onNewRequest={this.handleChange}
        />
      )
    }
}