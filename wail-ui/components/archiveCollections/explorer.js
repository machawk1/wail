import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import SplitPane from 'react-split-pane'
import Paper from 'material-ui/Paper'
import CollectionView from './collectionView'
import CollectionList from './collectionList'
import autobind from 'autobind-decorator'
require('./splitpane.css')
const baseTheme = getMuiTheme(lightBaseTheme)

export default class Explorer extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)
    this.state = { muiTheme: baseTheme, showing: 'test1' }
  }

  @autobind
  clicked (showing) {
    console.log(showing)
    this.setState({ showing })
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }

  render () {
    return (
      <SplitPane
        split="vertical"
        minSize={50} defaultSize={100}
        className="primary"
      >
        <CollectionList key="the-list" cols={[ 'test1', 'test2', 'test3' ]} clicked={this.clicked}/>
        <CollectionView name={this.state.showing}/>
      </SplitPane>
    )
  }
}