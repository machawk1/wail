import React, { Component, PropTypes } from 'react'
import autobind from 'autobind-decorator'
import Divider from 'material-ui/Divider'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Scrollbars } from 'react-custom-scrollbars'
import ColListItem from './collectionListItem'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import AutoComplete from 'material-ui/AutoComplete'
import { blueGrey50, darkBlack, lightBlue900 } from 'material-ui/styles/colors'
import Dimensions from 'react-dimensions'
import NewCollection from '../collectionView/newCollection'
import _ from 'lodash'

export default class CollectionList extends Component {
  static propTypes = {
    cols: PropTypes.arrayOf(PropTypes.string).isRequired,
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      cols: this.buildList(),
      selection: 0
    }
  }

  @autobind
  clicked (name) {
    let { viewWatcher, from } = this.props
    viewWatcher.view(from, name)
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log('collectionList will recieve props!', nextProps, nextContext)
    // this.setState({cols: this.buildList()})
  }

  handleChange (event, index, selection) {
    this.setState({ selection }, () => {
      this.clicked(this.props.cols[ selection ])
    })
  }

  buildList () {
    let { cols } = this.props
    let rCols = []
    if (Array.isArray(cols)) {
      console.log(cols)
      let len = cols.length
      for (let i = 0; i < len; i++) {
        rCols.push(<MenuItem value={i} key={i} primaryText={cols[ i ]} />)
      }
    } else {
      rCols.push(<MenuItem value={0} key={0} primaryText={cols} />)
    }
    return rCols
  }

  render () {
    return (

      <Row
        middle="xs"
        style={{
          backgroundColor: blueGrey50
        }}
      >
        <Col xs>
          <h2>
            Collections:
          </h2>
        </Col>
        <Col xs>
          <SelectField value={this.state.selection} onChange={::this.handleChange} maxHeight={200}>
            {this.state.cols}
          </SelectField>
        </Col>
        <Col xs>
          <NewCollection />
          </Col>
      </Row>
    )
  }
}

