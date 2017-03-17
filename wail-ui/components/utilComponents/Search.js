import React, { Component, PropTypes } from 'react'
import { BehaviorSubject } from 'rxjs'
import IconButton from 'material-ui/IconButton'
import SearchI from 'material-ui/svg-icons/action/search'
import { Card, CardText } from 'material-ui/Card'
import SearchInput from './searchInput'

const Search = ({hintText, searchSubject, cardStyle, cardTextStyle, inputStyle, tooltip}) => (
  <Card style={cardStyle}>
    <CardText style={cardTextStyle}>
      <span>
        <SearchInput hintText={hintText} searchSubject={searchSubject}/>
      </span>
      <span>
        <IconButton tooltip={tooltip}>
           <SearchI />
        </IconButton>
      </span>
    </CardText>
  </Card>
)

Search.propTypes = {
  searchSubject: PropTypes.instanceOf(BehaviorSubject).isRequired,
  cardStyle: PropTypes.object,
  cardTextStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  tooltip: PropTypes.string
}

Search.defaultProps = {
  cardStyle: {},
  tooltip: 'Search',
  cardTextStyle: {padding: 0, paddingLeft: 64, paddingRight: 64},
  inputStyle: {width: '90%', paddingLeft: '10px'}
}

export default Search
