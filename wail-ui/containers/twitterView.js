import React,{ PropTypes } from 'react'
import { Flex } from 'react-flex'
import { namedPure } from '../util/recomposeHelpers'
import { reset as resetForm } from 'redux-form'
import {batchActions} from 'redux-batched-actions'
import MenuItem from 'material-ui/MenuItem'
import ATwitterUser from '../components/twitter/archiveConfig/aTwitterUser'
import TwitterUserTextSearch from '../components/twitter/archiveConfig/twitterUserTextSearch'
import timeValues from '../components/twitter/archiveConfig/timeValues'

const enhance = namedPure('TwitterView')
const colNames = store => Array.from(store.getState().get('collections').values()).map((col, i) => col.get('colName'))

const makeTimeValues = () => {
  let t = {atu: [],tuts:[]},i = 0,{times} = timeValues
  for(; i < times.length; ++i){
    t.atu.push(<MenuItem value={times[i]} key={`${i}-atu`} primaryText={times[i]}/>)
    t.tuts.push(<MenuItem value={times[i]} key={`${i}-tuts`} primaryText={times[i]}/>)
  }
  return t
}

const makeFormClears = store => ({
  onUnMount () {
    store.dispatch(batchActions([resetForm('aTwitterUser'),resetForm('twitterTextSearch')]))
  },
  clearTwitterUser () {
    store.dispatch(resetForm('aTwitterUser'))
  },
  clearTextSearch () {
    store.dispatch(resetForm('twitterTextSearch'))
  }
})

const TwitterView = (props,{store}) => {
  const cols = colNames(store), t = makeTimeValues()
  const {onUnMount,clearTwitterUser,clearTextSearch} = makeFormClears(store)
  return (
    <div style={{width: '100%', height: '100%'}}>
      <div className='wail-container' style={{marginTop: 15}}>
        <Flex row justifyContent='space-between'>
          <ATwitterUser cols={cols} times={t.atu} onUnMount={onUnMount} clear={clearTwitterUser} />
          <TwitterUserTextSearch cols={cols} times={t.tuts} clear={clearTextSearch} />
        </Flex>
      </div>
    </div>
  )
}

TwitterView.contextTypes = {
  store: PropTypes.object
}

export default enhance(TwitterView)

