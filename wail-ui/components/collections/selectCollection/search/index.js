import React, { PropTypes } from 'react'
import { BehaviorSubject } from 'rxjs'
import Divider from 'material-ui/Divider'
import Search from '../../../utilComponents/Search'
import OrderBy from './OrderBy'

const SearchCollections = ({filterText, orderSubject}) => (
  <div>
    <Search
      id='filtercols'
      hintText='Collection Name'
      tooltip={'Search By Collection Name'}
      searchSubject={filterText}
    />
    <Divider />
  </div>
)

SearchCollections.propTypes = {
  filterText: PropTypes.instanceOf(BehaviorSubject).isRequired,
  orderSubject: PropTypes.instanceOf(BehaviorSubject).isRequired
}

export default SearchCollections
