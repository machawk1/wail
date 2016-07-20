import React, {Component, PropTypes} from 'react'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Grid, Row} from 'react-cellblock'
import {List} from 'material-ui/List'
import autobind from 'autobind-decorator'
import CheckOS from './checkOS'
import CheckJava from './checkJava'

const progressMessages = [
  'Checking Operating System',
  'Checking Java Version',
]

const baseTheme = getMuiTheme(lightBaseTheme)

export default class LoadingProgress extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  constructor (props, context) {
    super()
    this.state = {
      statusMessage: progressMessages[ 0 ],
      messageCounter: 0,
      muiTheme: baseTheme
    }
  }

  getChildContext () {
    return { muiTheme: this.state.muiTheme }
  }


  @autobind
  javaCheck (have, which) {
    console.log(have, which)
  }

  render () {
    return (
      <Grid flexible={true}>
        <Row>
          <List>
            <CheckOS/>
            <CheckJava checkJava={this.javaCheck}/>
          </List>
        </Row>
        <Row>
          <p>{this.state.statusMessage}</p>
        </Row>
      </Grid>
    )
  }
}
