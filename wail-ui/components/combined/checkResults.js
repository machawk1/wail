import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {connect} from 'react-redux'
import {List, ListItem} from 'material-ui/List'
import MyAutoSizer from './myAutoSizer'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-new'
import IconButton from 'material-ui/IconButton'
import {openUrlInBrowser} from '../../actions/util-actions'

@connect(state => ({
  check: state.get('checkUrl')
}))
export default class CheckResults extends Component {
  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderMessage () {
    return <p>{this.props.check.get('message')}</p>
  }

  renderCaptures () {
    let captures = this.props.check.get('captures').map(({ url, time, wburl }, i) => <ListItem
      key={`${i}-${url}`}
      style={{ cursor: 'default' }}
      primaryText={url}
      secondaryText={time}
      rightIconButton={
        <IconButton onTouchTap={() => openUrlInBrowser(wburl)}>
          <OpenInBrowser />
        </IconButton>
      }
    />)

    return <MyAutoSizer findElement='addSeedCard'>
      {
        ({ height }) => (
          < List
            style={{
              maxHeight: `${height - 115}px`,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {captures}
          </List>
        )}
    </MyAutoSizer>
  }

  render () {
    console.log('CheckResults', this.props)
    return (
      <div style={{ height: '100%' }}>
        {!this.props.check.get('haveCaptures') && this.renderMessage()}
        {this.props.check.get('haveCaptures') && this.renderCaptures()}
      </div>
    )
  }

}

