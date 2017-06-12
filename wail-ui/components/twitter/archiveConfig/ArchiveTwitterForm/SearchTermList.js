import React, { Component } from 'react'
import { Flex }from 'react-flex'
import CardTitle from 'material-ui/Card/CardTitle'
import RaisedButton from 'material-ui/RaisedButton'
import List from 'material-ui/List/List'
import ASearchTerm from './ASearchTerm'
import MyAutoSizer from '../../../utilComponents/myAutoSizer'

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
      <ASearchTerm key={`aSearchTerm${i}`} i={i} ht={ht} removeMe={this.removeTerm}/>
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
      <div id="inTweetTextListContainer" style={{width: '100%', height: 180}}>
        <Flex row justifyContent='space-around'>
          <div style={{width: '50%', height: 175}}>
            <Flex row>
              <CardTitle subtitle='Look For What In The Tweets Text?'/>
              <RaisedButton
                onTouchTap={this.addField}
                primary label={'Add'}
                labelPosition={'before'}
              />
            </Flex>
          </div>
          <div style={{overflowY: 'auto', height: 175, maxHeight: 175, width: '50%'}}>
            <List >
              {this.makeLis()}
            </List>
          </div>
        </Flex>
      </div>
    )
  }
}