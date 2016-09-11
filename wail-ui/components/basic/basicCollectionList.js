import React, { Component, PropTypes } from 'react'
import Paper from 'material-ui/Paper'
import { Grid, Row, Col } from 'react-flexbox-grid'
import SelectField from 'material-ui/SelectField'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import ColStore from '../../stores/collectionStore'
import DropDownMenu from 'material-ui/DropDownMenu'
import autobind from 'autobind-decorator'
import _ from 'lodash'
import MenuItem from 'material-ui/MenuItem'
import ColDispatcher from '../../dispatchers/collectionDispatcher'

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default class BasicCollectionList extends Component {

  static propTypes = {
    colNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      colNames: this.props.colNames.length > 0 ? this.props.colNames : [ defForCol ],
      selection: 0
    }
  }

  componentWillReceiveProps (nextProps, nextContext) {
    console.log(nextProps)
    if (this.state.colNames.length !== nextProps.colNames)
      if (!_.isEqual(this.state.colNames.sort(), nextProps.colNames.sort())) {
        this.setState({ colNames: nextProps.colNames })
      }
  }

  clicked (name) {
    let { viewWatcher, from } = this.props
    viewWatcher.view(from, name)
  }

  handleChange (event, index, selection) {
    this.setState({ selection }, () => {
      this.clicked(this.state.colNames[ selection ])
    })
  }

  buildList () {
    let rCols = []
    let len = this.state.colNames.length
    for (let i = 0; i < len; i++) {
      rCols.push(<MenuItem value={i} key={i} primaryText={this.state.colNames[ i ]} />)
    }
    return rCols
  }

  render () {
    return (
      <DropDownMenu
        value={this.state.selection}
        onChange={::this.handleChange}
      >
        {::this.buildList()}
      </DropDownMenu>
    )
  }

}
