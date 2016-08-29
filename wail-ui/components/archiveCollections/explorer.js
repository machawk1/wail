import React, { Component, PropTypes } from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import SplitPane from 'react-split-pane'
import Paper from 'material-ui/Paper'
import autobind from 'autobind-decorator'
import renderIf from 'render-if'
import CircularProgress from 'material-ui/CircularProgress'
import CollectionView from './collectionView'
import CollectionList from './collectionList'
import wailCoreManager from '../../coreConnection'
import SplitPanel from 'react-split-panel'
import { Flex, Box, Grid } from 'reflexbox'
require('./splitpane.css')
const baseTheme = getMuiTheme(lightBaseTheme)

export default class Explorer extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { loading: true, showing: 'empty', collections: {'empty': { name: 'void', description: 'nothings' }}, colNames: [] }
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
            let foundDescription = false
            for (let { k, v } of col.metadata) {
              if (k === 'description') {
                colNames.push({ name: col.colName, description: v })
                foundDescription = true
                break
              }
            }
            if (!foundDescription) {
              colNames.push({ name: col.colName, description: 'No Description' })
            }
            collections[ col.colName ] = col
          })
          this.setState({ collections, colNames, loading: false })
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  @autobind
  clicked (showing) {
    console.log(showing)
    this.setState({ showing })
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
        <Flex
          align="center"
          gutter={3}
          justify="space-between"
        >
          <Box
            col={6}
            p={3}
          >
            <CollectionList key="the-list" cols={this.state.colNames} clicked={this.clicked}/>
          </Box>
          <Box
            col={6}
            p={3}
          >
            Box col 6
          </Box>
        </Flex>
      )
    }

  }
}
/*
 <SplitPanel
 direction="horizontal"
 defaultWeights={[10, 20]}
 >
 <CollectionList key="the-list" cols={this.state.colNames} clicked={this.clicked}/>
 <CollectionView collection={this.state.collections[this.state.showing]}/>
 </SplitPanel>
 */