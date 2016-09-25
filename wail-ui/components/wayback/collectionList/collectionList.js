import React, {Component, PropTypes} from 'react'
import IconButton from 'material-ui/IconButton'
import SearchIcon from 'material-ui/svg-icons/action/search'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {CardTitle} from 'material-ui/Card'
import ColListSearch from './collectionListSearch'
import NewCollection from './newCollection'
/*
 <Grid fluid>
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
 </Grid>
 */
export default class CollectionList extends Component {
  static propTypes = {
    currCollection: PropTypes.string.isRequired,
  }

  render () {
    return (
      <Grid fluid>
        <Row between="xs">
          <Col xs>
            <ColListSearch currCollection={this.props.currCollection}/>
            <IconButton tooltip="Search For Collection To View">
              <SearchIcon/>
            </IconButton>
          </Col>
          <Col xs>
            <Row end="xs">
              <Col xs>
                <NewCollection/>
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    )
  }
}

