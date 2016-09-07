import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import OpenButton from 'material-ui/FlatButton'
import { Scrollbars } from 'react-custom-scrollbars'
import FitText from 'react-fittext'
import Dimensions from 'react-dimensions'
import autobind from 'autobind-decorator'
import TextField from 'material-ui/TextField'

export default class CollectionOverview extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  constructor (...args) {
    super(...args)
  }

  render () {
    let { collection } = this.props
    console.log(collection)
    let {
      metadata
    } = collection
    metadata.forEach(md => console.log(md))
    let renderMe = metadata.map(md => {
      console.log(md)
      return (
        <div key={`${collection.colName}${md.k}${md.v}`}>
          <Grid fluid>
            <Row key={`${collection.colName}${md.k}${md.v}grid`} between='xs'>
              <Col key={`${collection.colName}${md.k}${md.v}kcol`} xs>
                <h3 key={`${collection.colName}${md.k}${md.v}kh3`}>{md.k}:</h3>
              </Col>
              <Col xs key={`${collection.colName}${md.k}${md.v}vcol`}>
                <h3 key={`${collection.colName}${md.k}${md.v}vh3`}>{md.v}</h3>
              </Col>
            </Row>
          </Grid>
        </div>
      )
    })

    return (
      <Scrollbars>
        {renderMe}
      </Scrollbars>
    )
  }

}
