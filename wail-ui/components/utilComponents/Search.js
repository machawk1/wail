import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import Rx from 'rxjs/Rx'
import SearchI from 'material-ui/svg-icons/action/search'
import {Card, CardText} from 'material-ui/Card'
import SearchInput from './searchInput'

const Search = ({ searchSubject, cardStyle, cardTextStyle, inputStyle }) => (
  <Card style={cardStyle}>
    <CardText style={cardTextStyle}>
      <span>
        <SearchInput searchSubject={searchSubject}  />
      </span>
      <span>
        <SearchI />
      </span>
    </CardText>
  </Card>
)

Search.propTypes = {
  searchSubject: PropTypes.instanceOf(Rx.BehaviorSubject).isRequired,
  cardStyle: PropTypes.object,
  cardTextStyle: PropTypes.object,
  inputStyle: PropTypes.object
}

Search.defaultProps = {
  cardStyle: {},
  cardTextStyle: { padding: 0, paddingLeft: 64 },
  inputStyle: { width: '90%', paddingLeft: '10px' }
}

export default Search
