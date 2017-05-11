import React, { PropTypes } from 'react'
import { batchActions } from 'redux-batched-actions'
import { Flex } from 'react-flex'
import { reset as resetForm } from 'redux-form'
import pure from 'recompose/pure'
import MenuItem from 'material-ui/MenuItem'
import ATwitterUser from './aTwitterUser'
import TwitterUserTextSearch from './twitterUserTextSearch'
import timeValues from './timeValues'

const colNames = store => Array.from(store.getState().get('collections').values()).map((col, i) => col.get('colName'))

const makeTimeValues = () => {
  let t = { atu: [], tuts: [] }, i = 0, { times } = timeValues
  for (; i < times.length; ++i) {
    t.atu.push(<MenuItem value={times[ i ]} key={`${i}-atu`} primaryText={times[ i ]} />)
    t.tuts.push(<MenuItem value={times[ i ]} key={`${i}-tuts`} primaryText={times[ i ]} />)
  }
  return t
}

const makeFormClears = store => ({
  onUnMount () {
    store.dispatch(batchActions([resetForm('aTwitterUser'), resetForm('twitterTextSearch') ]))
  },
  clearTwitterUser () {
    store.dispatch(resetForm('aTwitterUser'))
  },
  clearTextSearch () {
    store.dispatch(resetForm('twitterTextSearch'))
  }
})

const ArchiveTwitter = ({ store }) => {
  const cols = colNames(store), t = makeTimeValues()
  const { onUnMount, clearTwitterUser, clearTextSearch } = makeFormClears(store)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className='wail-container' style={{ marginTop: 15 }}>
        <Flex row justifyContent='space-around'>
          <ATwitterUser cols={cols} times={t.atu} onUnMount={onUnMount} clear={clearTwitterUser} />
          <TwitterUserTextSearch cols={cols} times={t.tuts} clear={clearTextSearch} />
        </Flex>
      </div>
    </div>
  )
}

ArchiveTwitter.propTypes = {
  store: PropTypes.object.isRequired
}

export default pure(ArchiveTwitter)
