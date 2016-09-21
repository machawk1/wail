import React, { Component, PropTypes } from 'react'
import ColListSearch from './collectionListSearch'
import { cyanA700 } from 'material-ui/styles/colors'
import IconButton from 'material-ui/IconButton'
import SearchIcon from 'material-ui/svg-icons/action/search'
import {Row,Col} from 'react-flexbox-grid'


export default class CollectionList extends Component {

  render () {
    return (

      <Row
        top="xs"
      >
        <Col xs>
          <h2>
            Collections:
          </h2>
        </Col>
        <Col xs>
          <ColListSearch />
          <IconButton tooltip="Search For Collection to View">
            <SearchIcon/>
          </IconButton>
        </Col>
      </Row>
    )
  }
}

