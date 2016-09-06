import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import OpenButton from 'material-ui/FlatButton'
import {Scrollbars} from 'react-custom-scrollbars'
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
    let renderMe = []

    for (let [k, v] of Object.entries(metadata)) {
      renderMe.push(
        <div key={`${collection.colName}${k}${v}`}>
          <Grid fluid>
            <Row key={`${collection.colName}${k}${v}grid`} between='xs'>
              <Col key={`${collection.colName}${k}${v}kcol`} xs>
                <h3 key={`${collection.colName}${k}${v}kh3`}>{k}:</h3>
              </Col>
              <Col xs key={`${collection.colName}${k}${v}vcol`}>
                <h3 key={`${collection.colName}${k}${v}vh3`}>{v}</h3>
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
    return (
      <Scrollbars>
        {renderMe}
      </Scrollbars>
    )
  }

}
