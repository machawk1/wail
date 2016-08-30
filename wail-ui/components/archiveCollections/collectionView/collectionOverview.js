import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col} from 'react-flexbox-grid'
import FitText from 'react-fittext'
import autobind from 'autobind-decorator'

export default class CollectionInfo extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: 'slide',
  }

  constructor (...args) {
    super(...args)

  }

  render () {
    let { className, collection } = this.props
    let {
      archive,
      colName,
      colPath,
      indexes,
      numArchives,
      name
    } = collection
    return (
      <Grid>
        <Row>
          <Col>
            <FitText compressor={0.3}>
              <h3> {colName} </h3>
            </FitText>
          </Col>
        </Row>
      </Grid>
    )
  }

}