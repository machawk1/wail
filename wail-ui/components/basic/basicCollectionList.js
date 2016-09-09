import React, { Component, PropTypes } from 'react'
import Paper from 'material-ui/Paper'
import { Grid, Row, Col } from 'react-flexbox-grid'
import SelectField from 'material-ui/SelectField'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import ColStore from '../../stores/collectionStore'
import autobind from 'autobind-decorator'
import MenuItem from 'material-ui/MenuItem'
import ColDispatcher from '../../dispatchers/collectionDispatcher'

export default class BasicCollectionList extends Component {

  static propTypes = {
    cols: PropTypes.arrayOf(PropTypes.string).isRequired,
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      colNames: ['Wail'],
      cols: this.buildList(),
      selection: 0

    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log(nextProps)
    this.setState({colNames: nextProps.cols,cols: this.buildList(nextProps.cols)})
  }

  clicked (name) {
    let { viewWatcher, from } = this.props
    viewWatcher.view(from, name)
  }


  handleChange (event, index, selection) {
    this.setState({ selection }, () => {
      this.clicked(this.props.cols[ selection ])
    })
  }

  buildList (useMe) {
    let { cols } = this.props
    cols = useMe ? useMe : cols
    let rCols = []
    if (Array.isArray(cols)) {
      console.log(cols)
      let len = cols.length
      for (let i = 0; i < len; i++) {
        rCols.push(<MenuItem value={i} key={i} primaryText={cols[ i ]}/>)
      }
    } else {
      rCols.push(<MenuItem value={0} key={0} primaryText={cols}/>)
    }
    return rCols

  }

  render () {
    return (
      <Row
      >
        <Col xs>
          <SelectField
            value={this.state.selection}
            onChange={::this.handleChange}
            maxHeight={200}
            style={{width: 150}}
          >
            {this.state.cols}
          </SelectField>
        </Col>
      </Row>
    )
  }

}