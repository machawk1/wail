import React from 'react'
import PropTypes from 'prop-types'
import { BehaviorSubject } from 'rxjs'
import IconButton from 'material-ui/IconButton'
import SearchI from 'material-ui/svg-icons/action/search'
import Card from 'material-ui/Card/Card'
import SearchInput from '../../../utilComponents/searchInput'
import OrderBy from './OrderBy'
import Flexbox from 'flexbox-react'

const SearchCollections = ({filterText, orderSubject, hintText, cardStyle, cardTextStyle, inputStyle, tooltip}) => (
  <Card style={cardStyle}>
    <Flexbox
      flexDirection='row'
      flexWrap='wrap' alignItems='baseline' justifyContent='space-between'>
      <div style={{width: '75%'}}>
        <SearchInput inputStyle={inputStyle} hintText={hintText} searchSubject={filterText} />
        <IconButton tooltip={tooltip}>
          <SearchI />
        </IconButton>
      </div>
      <OrderBy orderSubject={orderSubject} />
    </Flexbox>
  </Card>
)

SearchCollections.propTypes = {
  filterText: PropTypes.instanceOf(BehaviorSubject).isRequired,
  orderSubject: PropTypes.instanceOf(BehaviorSubject).isRequired,
  cardStyle: PropTypes.object,
  cardTextStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  tooltip: PropTypes.string
}

SearchCollections.defaultProps = {
  cardStyle: {},
  tooltip: 'Search',
  cardTextStyle: {padding: 0, paddingLeft: 64, paddingRight: 64},
  inputStyle: {width: '90%', paddingLeft: '10px'}
}

export default SearchCollections
