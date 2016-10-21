import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import {Scrollbars} from 'react-custom-scrollbars'

export default class CollectionMetadata extends Component {
  static propTypes = {
    metadata: PropTypes.array.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  render () {
    let { metadata } = this.props
    let renderMe = metadata.map(md => {
      console.log(md)
      return (
        <Grid key={`${md.k}${md.v}`} fluid>
          <Row key={`${md.k}${md.v}grid`} between='xs'>
            <Col key={`${md.k}${md.v}kcol`} xs>
              <h3 key={`${md.k}${md.v}kh3`}>{md.k}:</h3>
            </Col>
            <Col xs key={`${md.k}${md.v}vcol`}>
              <h3 key={`${md.k}${md.v}vh3`}>{md.v}</h3>
            </Col>
          </Row>
        </Grid>
      )
    })

    return (
        <Scrollbars style={{width: '100%', height: '250px'}}>
          {renderMe}
        </Scrollbars>
    )
  }

}
