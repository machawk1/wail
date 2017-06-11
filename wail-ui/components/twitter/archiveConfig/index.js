import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { batchActions } from 'redux-batched-actions'
import { Tabs, Tab } from 'material-ui/Tabs'
import { RadioButton } from 'material-ui/RadioButton'
import { reset as resetForm } from 'redux-form'
import pure from 'recompose/pure'
import SwipeableViews from 'react-swipeable-views'
import ATwitterUser from './aTwitterUser'
import TwitterUserTextSearch from './twitterUserTextSearch'
import timeValues from './timeValues'

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400
  },
  slide: {
    padding: 10
  }
}

const colNames = store => Array.from(store.getState().get('collections').values())
  .map((col, i) => {
    let colName = col.get('colName')
    return (
      <RadioButton
        key={`${i}-${colName}-rb`}
        value={colName}
        label={colName}
      />
    )
  })

const makeFormClears = store => ({
  onUnMount () {
    store.dispatch(batchActions([resetForm('aTwitterUser'), resetForm('twitterTextSearch')]))
  },
  clearTwitterUser () {
    store.dispatch(resetForm('aTwitterUser'))
  },
  clearTextSearch () {
    store.dispatch(resetForm('twitterTextSearch'))
  }
})

class ArchiveTwitter extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      slideIndex: 0
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (value) {
    this.setState({
      slideIndex: value
    })
  }

  render () {
    let {store} = this.props
    const cols = colNames(store)
    const t = timeValues.times.map((time, i) =>
      <RadioButton
        value={time}
        key={`${i}-${time}-timeVal`}
        label={time}
      />)
    const {onUnMount, clearTwitterUser, clearTextSearch} = makeFormClears(store)
    return (
      <div className='widthHeightHundoPercent'>
        <div className='wail-container' style={{marginTop: 15}}>
          <Tabs
            onChange={this.handleChange}
            value={this.state.slideIndex}
          >
            <Tab label='Users Timeline' value={0} />
            <Tab label='Users Tweet' value={1} />
          </Tabs>
          <SwipeableViews
            index={this.state.slideIndex}
            onChangeIndex={this.handleChange}
          >
            <ATwitterUser cols={cols} times={t} onUnMount={onUnMount} clear={clearTwitterUser} />
            <TwitterUserTextSearch cols={cols} times={t} clear={clearTextSearch} />
          </SwipeableViews>
        </div>
      </div>
    )
  }
}

export default pure(ArchiveTwitter)
