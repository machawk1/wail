import React from 'react'
import PropTypes from 'prop-types'
import Flexbox from 'flexbox-react'
import AddSeedIconMenu from './addSeedIconMenu'

const CollectionViewButtons = ({CrawlIndicator, match}) => (
  <Flexbox
    flexDirection='row'
    flexWrap='wrap'
    alignItems='center'
    justifyContent='space-between'
  >
    {CrawlIndicator}
    <AddSeedIconMenu match={match} />
  </Flexbox>
)

CollectionViewButtons.propTypes = {
  CrawlIndicator: PropTypes.element.isRequired,
  match: PropTypes.object.isRequired
}
export default CollectionViewButtons
