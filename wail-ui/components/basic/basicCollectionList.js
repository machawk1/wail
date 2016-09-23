import React, { Component, PropTypes } from 'react'
import DropDownMenu from 'material-ui/DropDownMenu'
import autobind from 'autobind-decorator'
import _ from 'lodash'
import MenuItem from 'material-ui/MenuItem'
import CollectionStore from '../../stores/collectionStore'
import ColDispatcher from '../../dispatchers/collectionDispatcher'
import AutoComplete from 'material-ui/AutoComplete'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import wc from '../../constants/wail-constants'

const defForCol = wc.Default_Collection

export default class BasicCollectionList extends Component {


  constructor (...args) {
    super(...args)
    this.state = {
      colNames: CollectionStore.colNames.length > 0 ? CollectionStore.colNames : [ defForCol ],
      selection: 0
    }

  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log(nextProps)
    // if (this.state.colNames.length !== nextProps.colNames)
    //   if (!_.isEqual(this.state.colNames.sort(), nextProps.colNames.sort())) {
    //     this.setState({ colNames: nextProps.colNames })
    //   }
  }

  componentWillMount () {
    CollectionStore.on('got-all-collections', this.gotAllNames)
    CollectionStore.on('added-new-collection', this.gotAllNames)
  }

  componentWillUnmount () {
    console.log('componet willl un mount archive or check col')
    CollectionStore.removeListener('got-all-collections', this.gotAllNames)
    CollectionStore.removeListener('added-new-collection', this.gotAllNames)
  }

  @autobind
  gotAllNames (cols) {
    console.log('got allNames basic col list', cols)
    this.setState({
      colNames: CollectionStore.colNames
    })
  }

  @autobind
  handleChange (choice,index) {
    console.log('basic col list handle Change',choice,index)
    if (index === -1) {
      if (this.state.colNames.includes(choice)) {
        ViewWatcher.selected('basicColList', choice)
      }
    } else {
      ViewWatcher.selected('basicColList', this.state.colNames[index])
    }

  }

  render () {
    return (
      <AutoComplete
        style={{paddingLeft: '20px'}}
        openOnFocus
        maxSearchResults={4}
        hintText="Available Collection"
        filter={AutoComplete.fuzzyFilter}
        dataSource={this.state.colNames}
        onNewRequest={this.handleChange}
      />
    )
  }

}
/*

 <DropDownMenu
 value={this.state.selection}
 onChange={::this.handleChange}
 >
 {::this.buildList()}
 </DropDownMenu>
 */
