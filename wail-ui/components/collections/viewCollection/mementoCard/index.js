import React from 'react'
import PropTypes from 'prop-types'
import Card from 'material-ui/Card/Card'
import { Map } from 'immutable'
import { namedUpdateKeys } from '../../../../util/recomposeHelpers'
import MementoCardHeader from './mementoCardHeader'
import MementoCardBody from './mementoCardBody'
import MementoCardActions from './mementoCardActions'
export MementoCardEmpty from './mementoCardEmpty'

const enhanceMc = namedUpdateKeys('MementoCard', ['seed', 'viewingCol'])

const MementoCard = ({i, mckey, seed, url, viewingCol, conf, openInWb}) => (
  <Card id={`mementoCard${i}`} key={`${mckey}-mementoCard`} style={{marginTop: 10, marginBottom: 10}}>
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
  wbUrl: PropTypes.string,
  url: PropTypes.string,
  viewingCol: PropTypes.string,
  seed: PropTypes.instanceOf(Map),
  openInWb: PropTypes.func.isRequired
}

export default enhanceMc(MementoCard)
