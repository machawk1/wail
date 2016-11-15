import React, {Component, PropTypes} from 'react'
import Immutable from 'immutable'
import autobind from 'autobind-decorator'
import shallowCompare from 'react-addons-shallow-compare'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import {Flex, Item} from 'react-flex'
import Add from 'material-ui/svg-icons/content/add'
import {AutoSizer} from 'react-virtualized'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import Search from 'material-ui/svg-icons/action/search'
import {Card, CardHeader, CardTitle, CardText, CardMedia, CardActions} from 'material-ui/Card'
import SortDirection from './sortDirection'
import SortHeader from './sortHeader'
import ViewWatcher from '../../../wail-core/util/viewWatcher'
import Divider from 'material-ui/Divider'
import IconButton from 'material-ui/IconButton'
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table'
import {connect} from 'react-redux'
import {Link, IndexLink} from 'react-router'
import {openUrlInBrowser} from '../../actions/util-actions'
import ActionFavorite from 'material-ui/svg-icons/action/favorite'
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border'
import CollectionViewHeader from './collectionViewHeader'
import {shell, remote} from 'electron'
import Formsy from 'formsy-react'
import {
  FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup,
  FormsySelect, FormsyText, FormsyTime, FormsyToggle
} from 'formsy-material-ui/lib'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/FlatButton'
import CollAddSeedHeader from './colAddSeedHeader'

const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    marginBottom: 16,
  },
  paperStyle: {
    width: 300,
    margin: 'auto',
    padding: 20,
  },
  switchStyle: {
    marginBottom: 16,
  },
  submitStyle: {
    marginTop: 32,
  },

}

const errorMessages = {
  wordsError: 'Please only use letters',
  numericError: 'Please provide a number',
  urlError: 'Please provide a valid URL',
}

@connect()
export default class CollectionAddSeed extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      conSubmit: false
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    console.log('col add seed should component update', shallowCompare(this, nextProps, nextState))
    return shallowCompare(this, nextProps, nextState)
  }


  render () {
    console.log(this.props)
    return (
      <div style={{ width: '100%', height: '100%', }}>
        <CollAddSeedHeader col={this.props.params.col}/>
        <Card style={{ margin: '0 25px 25px 25px'}}>
          <CardHeader title={'Seed to Add'}/>
          <CardMedia style={{ width: '90%' }}>
            <TextField
              fullWidth
              style={{ marginLeft: 25, marginRight: 25, }}
              floatingLabelText='URL'
              id='archive-url-input'
            />
          </CardMedia>
          <Flex row alignItems='baseline' justifyContent='space-between'>
            <RadioButtonGroup name='archive' defaultSelected='single-page'
                              style={{ width: '50%', paddingLeft: 25, marginTop: 20 }}>
              <RadioButton
                value='single-page'
                label='Archive Page Only'
                style={styles.radioButton}
              />
              <RadioButton
                value='page-same-domain'
                label='Archive Page and internal (same domain) links'
                style={styles.radioButton}
              />
              <RadioButton
                value='page-same-domain-external'
                label='Archive Page and all (internal and external) links'
                style={styles.radioButton}
              />
            </RadioButtonGroup>
            <RaisedButton label='Check Seed' style={{ marginRight: 25 }}/>
          </Flex>
          <CardActions>
            <RaisedButton primary label='Cancel'/>
            <RaisedButton primary label='Add and Archive Now'/>
          </CardActions>
        </Card>
      </div>
    )
  }
}

/*


 */

