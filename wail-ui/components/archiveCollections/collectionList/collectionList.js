import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {List} from 'material-ui/List'
import {Scrollbars} from 'react-custom-scrollbars'
import ColListItem from './collectionListItem'

export default class CollectionList extends Component {
  static propTypes = {
    cols: PropTypes.oneOfType([
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string
      }),
      PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string
      }))
    ]).isRequired,
    clicked: PropTypes.func.isRequired
  }

  render () {
    let { cols, clicked } = this.props
    // <List children={cols.map(c => <ColListItem key={`colli-${c}`} name={c} clicked={clicked}/>)}/>
    let rCols = do {
      if (Array.isArray(cols)) {
        cols.map(c => <ColListItem key={`colli-${c.name}`} name={c.name} description={c.description} clicked={clicked}/>)
      } else {
        <ColListItem key={`colli-${cols.name}`} name={cols.name} description={cols.description} clicked={clicked}/>
      }
    }
    return (
      <Scrollbars>
        {rCols}
      </Scrollbars>
    )
  }
}