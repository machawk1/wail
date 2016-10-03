import React, {Component, PropTypes} from 'react'
import {withRouter} from 'react-router'
import ColStore from '../../../stores/collectionStore'
import AutoComplete from 'material-ui/AutoComplete'
import wc from '../../../constants/wail-constants'
import autobind from 'autobind-decorator'

const defaultCol = wc.Default_Collection

class CollectionListSearch extends Component {
  static propTypes = {
    currCollection: PropTypes.string.isRequired,
  }

  constructor (...args) {
    super(...args)
    this.state = {
      colNames: ColStore.colNames.length > 0 ? ColStore.colNames : [ defaultCol ]
    }
  }

  componentWillMount () {
    ColStore.on('got-all-collections', this.getColNames)
    ColStore.on('added-new-collection', this.getColNames)
  }

  componentWillUnmount () {
    ColStore.removeListener('got-all-collections', this.getColNames)
    ColStore.removeListener('added-new-collection', this.getColNames)
  }

  @autobind
  getColNames () {
    this.setState({ colNames: ColStore.colNames })
  }

  @autobind
  handleChange (choice, index) {
    console.log(this.props)
    console.log('basic col list handle Change', choice, index)
    if (index === -1) {
      if (this.state.colNames.includes(choice)) {
        this.props.router.push(`/wayback/${choice}`)
      }
    } else {
      this.props.router.push(`/wayback/${this.state.colNames[ index ]}`)
    }

  }

  render () {
    console.log(this.props)
    return (
      <AutoComplete
        style={{ width: '200px' }}
        openOnFocus
        maxSearchResults={4}
        searchText={this.props.currCollection}
        hintText="Select Collection To View"
        filter={AutoComplete.fuzzyFilter}
        dataSource={this.state.colNames}
        onNewRequest={this.handleChange}
      />
    )
  }
}

export default withRouter(CollectionListSearch)
