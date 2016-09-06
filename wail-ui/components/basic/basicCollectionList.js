import React, {Component, PropTypes} from 'react'
import Paper from 'material-ui/Paper'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import ColStore from '../../stores/collectionStore'
import ColDispatcher from '../../dispatchers/collectionDispatcher'

export default class BasicCollectionList extends Component {

  constructor (...args) {
    super(...args)
    this.state = {
      colNames: ColStore.getColNames()
    }
  }

  componentWillMount () {
    ColStore.on('got-all-collections', ::this.gotAllNames)
  }

  componentWillUnmount () {
    ColStore.removeListener('got-all-collections', ::this.gotAllNames)
  }

  gotAllNames (cols) {
    this.setState({
      colNames: cols.map(c => c.colName)
    })
  }

  buildLi () {
    let { colNames } = this.state
    let len = colNames.length

    let lis = []

    for (let i = 0; i < len; ++i) {
      let n = colNames[ i ]
      lis.push(<ListItem key={`bcl-${i}`} primaryText={n}/>)
    }

    return lis
  }

  render () {
    return (
      <RadioButtonGroup
        name='Collections'
        defaultSelected='Wail'
        style={{maxWidth: 100}}
      >
        {this.state.colNames.map(n =>
          <RadioButton
            key={`colselect-${n}`}
            value={n}
            label={n}
          />
        )}
      </RadioButtonGroup>
    )
  }

}