import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import CardTitle from 'material-ui/Card/CardTitle'
import FAB from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import List from 'material-ui/List/List'
import ASearchTerm from './ASearchTerm'
import Subheader from 'material-ui/Subheader'

export default class SearchTermList extends Component {
  constructor (...args) {
    super(...args)
    this.addField = this.addField.bind(this)
    this.makeLis = this.makeLis.bind(this)
    this.removeTerm = this.removeTerm.bind(this)
  }

  addField () {
    this.props.fields.push('')
  }

  removeTerm (i) {
    this.props.fields.remove(i)
  }

  makeLis () {
    return this.props.fields.map((ht, i, fields) =>
      <ASearchTerm key={`aSearchTerm${i}`} i={i} ht={ht} removeMe={this.removeTerm} />
    )
  }

  buildList ({width, height}) {
    return (
      <List style={{overflowY: 'auto', height, maxHeight: height - 125}}>
        {this.makeLis()}
      </List>
    )
  }

  render () {
    return (
      <div id='inTweetTextListContainer' style={{width: '100%', height: 180}}>
        <Flexbox
          flexDirection='row'
          flexWrap='wrap' justifyContent='space-around'>
          <div style={{width: '50%', height: 175}}>
            <Flexbox
              flexDirection='row'
              flexWrap='wrap'>
              <CardTitle subtitle='Look For What In The Tweets Text?' />
              <FAB
                onTouchTap={this.addField}
                mini
              >
                <ContentAdd />
              </FAB>
            </Flexbox>
          </div>
          <div style={{width: '50%'}}>
            <Subheader style={{lineHeight: 0}}>Words To Look For In A Tweet</Subheader>
            <div style={{overflowY: 'auto', height: 175, maxHeight: 175}}>
              <List>
                {this.makeLis()}
              </List>
            </div>
          </div>
        </Flexbox>
      </div>
    )
  }
}
