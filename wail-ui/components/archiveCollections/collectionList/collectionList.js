import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import Divider from 'material-ui/Divider'
import {Scrollbars} from 'react-custom-scrollbars'
import ColListItem from './collectionListItem'


export default class CollectionList extends Component {
  static propTypes = {
    cols: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    viewWatcher: PropTypes.object.isRequired,
    from: PropTypes.string.isRequired,
  }

  constructor (...args) {
    super(...args)
    console.log(this.context)
    this.state = {
      rCols: [
        <h2 key="CollectionL-Header">
          Collections
        </h2>,
        <Divider key="CollectionL-Divider"/>
      ]
    }
  }

  @autobind
  clicked (name) {
    let { viewWatcher, from } = this.props
    viewWatcher.view(from, name)
  }

  componentWillMount () {
    let { rCols } = this.state
    let { cols } = this.props
    // <List children={cols.map(c => <ColListItem key={`colli-${c}`} name={c} clicked={clicked}/>)}/>

    if (Array.isArray(cols)) {
      console.log(cols)
      let len = cols.length - 1
      cols.forEach((name,index) => {
        rCols.push(<ColListItem key={`colli-${name}`} name={name}
                                clicked={this.clicked}/>)
        if(index < len) {
          rCols.push(<Divider key={`CollectionL-Divider-${name}`}/>)
        }
      })
    } else {
      rCols.push(<ColListItem key={`colli-${name}`} name={name}
                              clicked={this.clicked}/>)
    }
    this.setState({ rCols })
  }

  render () {
    return (
      <Scrollbars>
        {this.state.rCols}
      </Scrollbars>
    )
  }
}

