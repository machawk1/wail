import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import SplitPane  from 'react-split-pane'
import _ from 'lodash'
import {blueGrey50,darkBlack,lightBlue900} from 'material-ui/styles/colors'
import CircularProgress from 'material-ui/CircularProgress'
import CollectionView from './collectionView'
import CollectionList from './collectionList'
import wailCoreManager from '../../coreConnection'
import CollectionHeader from './collectionHeader'
import {ViewWatcher} from '../../../sharedUtil'
import './css/archiveCol.css'
// import 'react-flexbox-layout/lib/styles.css'
// import {VLayout, VLayoutItem} from 'react-flexbox-layout'
// import {Flex, Box, Grid} from 'reflexbox'

const baseTheme = getMuiTheme({
  tabs: {
    backgroundColor: blueGrey50,
    textColor: darkBlack,
    selectedTextColor: darkBlack
  },
  inkBar: {
    backgroundColor: lightBlue900
  }
})

export default class Explorer extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      loading: true,
      collections: { 'empty': { colName: 'void', description: 'nothings' } },
      colNames: []
    }
    this.archiveService = wailCoreManager.getService('/archivesManager')
  }

  componentWillMount () {

  }

  componentDidMount () {
    this.archiveService.find({})
      .then(result => {
        console.log(result)
        if (result.total > 0) {
          let { collections, colNames } = this.state
          let { data } = result
          console.log(data)
          data.forEach(col => {
            colNames.push( col.colName )
            collections[ col.colName ] = col
          })
          this.setState({ collections, colNames, loading: false })
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  getChildContext () {
    return { muiTheme: baseTheme }
  }

  render () {
    if (this.state.loading) {
      return (
        <CircularProgress size={5}/>
      )
    } else {
      return (

         <SplitPane
           split="vertical"
           defaultSize={125}
           className="primary"
           allowResize={false}
         >
           <CollectionList
             key="the-list"
             cols={this.state.colNames}
             viewWatcher={ViewWatcher}
             from="Wail-Archive-Collections"
           />
           <CollectionView
             collections={this.state.collections}
             viewWatcher={ViewWatcher}
             from="Wail-Archive-Collections"
             defaultView="empty"
           />
         </SplitPane>

      )
    }

  }
}
/*
 <div>
 <CollectionList key="the-list" cols={this.state.colNames} clicked={this.clicked}/>
 <CollectionView collection={this.state.collections[ this.state.showing ]}/>
 </div>
 */