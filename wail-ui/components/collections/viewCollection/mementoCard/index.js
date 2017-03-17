import React, { PropTypes } from 'react'
import Card from 'material-ui/Card/Card'
import CardTitle from 'material-ui/Card/CardTitle'
import { Map } from 'immutable'
import { namedUpdateKeys, namedPure } from '../../../../util/recomposeHelpers'
import MementoCardHeader from './mementoCardHeader'
import MementoCardBody from './mementoCardBody'
import MementoCardActions from './mementoCardActions'

const enhanceMc = namedUpdateKeys('MementoCard', ['seed', 'viewingCol'])
const enhanceMce = namedPure('MementoCardEmpty')

const MementoCard = ({mckey, seed, url, viewingCol, conf, openInWb}) => (
  <Card key={`${mckey}-mementoCard`} style={{marginTop: 10, marginBottom: 10}}>
    <MementoCardHeader
      key={`${mckey}-mementoCardHeader`}
      url={url}
      lastUpdated={seed.get('lastUpdated').format('MMM DD, YYYY h:mma')}
      added={seed.get('added').format('MMM DD, YYYY h:mma')}
    />
    <MementoCardBody
      key={`${mckey}-mementoCardBody`}
      mementos={seed.get('mementos') || 1}
      conf={conf}
    />
    <MementoCardActions
      key={`${mckey}-mementoCardActions`}
      url={url}
      viewingCol={viewingCol}
      openInWb={openInWb}
    />
  </Card>
)

MementoCard.propTypes = {
  conf: PropTypes.any,
  mckey: PropTypes.string,
  url: PropTypes.string,
  viewingCol: PropTypes.string,
  seed: PropTypes.instanceOf(Map),
  openInWb: PropTypes.func.isRequired
}

export const MementoCardEmpty = enhanceMce(() => (
  <Card key={'noMementos-card'}>
    <CardTitle key={'noMementos-card-title'} title={'No Seeds In Collection. Click The Add One'}/>
  </Card>
))

export default enhanceMc(MementoCard)