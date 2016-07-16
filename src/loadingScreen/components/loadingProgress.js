import React, {Component} from 'react'
import {Grid, Row} from 'react-cellblock'
import {List} from 'material-ui/List'
import autobind from 'autobind-decorator'
import CheckOS from './checkOS'
import CheckJava from './checkJava'

const progressMessages = [
  'Checking Operating System',
  'Checking Java Version',
]

export default class LoadingProgress extends Component {
  constructor (props, context) {
    super()
    this.state = {
      statusMessage: progressMessages[ 0 ],
      messageCounter: 0,
    }
  }

  @autobind
  osCheck (whichOS) {
    console.log(whichOS)
    let messageCounter = this.state.messageCounter + 1
    let statusMessage = this.state.statusMessage[ messageCounter ]
    this.setState({ messageCounter, statusMessage })
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
            <CheckOS checkOS={this.osCheck}/>
            <CheckJava checkJava={this.javaCheck}/>
          </List>
        </Row>
        <Row>
          {this.state.statusMessage}
        </Row>
      </Grid>
    )
  }
}
