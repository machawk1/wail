import React, {Component, PropTypes} from 'react'
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
require('./splitpane.css')
const baseTheme = getMuiTheme(lightBaseTheme)

export default class Explorer extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { loading: true, showing: '', collections: { }, colNames: [ ] }
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
            colNames.push({name: col.colName, description: 'none'})
            collections[ col.colName ] = col
          })
          this.setState({collections,colNames, loading: false})
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
        <SplitPane
          split="vertical"
          minSize={50} defaultSize={100}
          className="primary"
        >
          <CollectionList key="the-list" cols={this.state.colNames} clicked={this.clicked}/>)}
          <CollectionView collection={this.state.showing}/>)
        </SplitPane>
      )
    }

  }
}