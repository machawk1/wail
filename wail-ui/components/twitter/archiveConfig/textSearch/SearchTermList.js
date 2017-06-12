import React, { Component } from 'react'
import { Flex }from 'react-flex'
import CardTitle from 'material-ui/Card/CardTitle'
import RaisedButton from 'material-ui/RaisedButton'
import List from 'material-ui/List/List'
import ASearchTerm from './ASearchTerm'

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
    let i = 0
    let len = this.props.fields.length
    let lis = []
    let ht
    for (; i < len; ++i) {
      ht = this.props.fields[i]
      lis.push(<ASearchTerm key={`aSearchTerm${i}`} i={i} ht={ht} removeMe={this.removeTerm}/>)
    }
    return lis
  }

  render () {
    return (
      <div>
        <Flex row alignItems='center'>
          <CardTitle subtitle='Look For What In The Tweets Text?'/>
          <RaisedButton
            onTouchTap={this.addField}
            primary label={'Add'}
            labelPosition={'before'}
          />
        </Flex>
        <div style={{overflowY: 'scroll', maxHeight: 'calc(100% - 300px)'}}>
          <List style={{height: 300, maxHeight: 300, overFlowY: 'auto'}}>
            {this.makeLis()}
          </List>
        </div>
      </div>
    )
  }
}