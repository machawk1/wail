import React, { PropTypes } from 'react'
import { Flex } from 'react-flex'
import AddSeedIconMenu from './addSeedIconMenu'

const CollectionViewButtons = ({CrawlIndicator, match}) => (
  <Flex row alignItems='center' justifyContent='space-between'>
    {CrawlIndicator}
    <AddSeedIconMenu match={match}/>
  </Flex>
)

CollectionViewButtons.propTypes = {
  CrawlIndicator: PropTypes.element.isRequired,
  match: PropTypes.object.isRequired
}
export default CollectionViewButtons