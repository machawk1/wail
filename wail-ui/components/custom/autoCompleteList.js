// adapted from https://github.com/callemall/material-ui/blob/8e80a35e8d2cdb410c3727333e8518cadc08783b/src/List/List.js
import React, {Component, PropTypes} from 'react'
import propTypes from 'material-ui/utils/propTypes'
import Subheader from 'material-ui/Subheader'
import deprecated from 'material-ui/utils/deprecatedPropType'
import warning from 'warning'
import { VirtualScroll } from 'react-virtualized'

class List extends Component {
  static propTypes = {
    childFilter: PropTypes.func.isRequired,
    /**
     * These are usually `ListItem`s that are passed to
     * be part of the list.
     */
    items: PropTypes.array,
    /**
     * If true, the subheader will be indented by 72px.
     */
    insetSubheader: deprecated(PropTypes.bool,
      'Refer to the `subheader` property.'),
    menuHeight: PropTypes.number.isRequired,
    renderItem: PropTypes.func.isRequired,
    /**
     * Override the inline-styles of the root element.
     */
    style: PropTypes.object,
    /**
     * The subheader string that will be displayed at the top of the list.
     */
    subheader: deprecated(PropTypes.node,
      'Instead, nest the `Subheader` component directly inside the `List`.'),
    /**
     * Override the inline-styles of the subheader element.
     */
    subheaderStyle: deprecated(PropTypes.object,
      'Refer to the `subheader` property.'),
    width : PropTypes.number.isRequired,
    /**
     * @ignore
     * ** Breaking change ** List no longer supports `zDepth`. Instead, wrap it in `Paper`
     * or another component that provides zDepth.
     */
    zDepth: propTypes.zDepth,
  }

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  render() {
    const {
      items,
      insetSubheader = false,
      style,
      subheader,
      subheaderStyle,
      zDepth,
      width,
      childFilter,
      renderItem,
      menuHeight,
      ...other,
    } = this.props

    warning((typeof zDepth === 'undefined'), 'List no longer supports `zDepth`. Instead, wrap it in `Paper` ' +
      'or another component that provides zDepth.')

    let hasSubheader = false

    if (subheader) {
      hasSubheader = true
    } else {
      const firstChild = items[0]
      if (React.isValidElement(firstChild) && firstChild.type === Subheader) {
        hasSubheader = true
      }
    }

    const styles = {
      root: {
        padding: 0,
        paddingBottom: 8,
        paddingTop: hasSubheader ? 0 : 8,
      },
    }

    let rowCount = items.length
    let rowHeight = 48
    let rowRenderer = (i) => {
      let option = items[i.index]
      return childFilter(renderItem(option), i.index)
    }

    return (
      <div
        {...other}
        style={Object.assign(styles.root, style)}
      >
        {subheader && <Subheader inset={insetSubheader} style={subheaderStyle}>{subheader}</Subheader>}
        <VirtualScroll
          rowRenderer={rowRenderer}
          rowCount={rowCount}
          rowHeight={rowHeight}
          // 30 is just some room to prevent the scrollbar from showing
          height={Math.min(menuHeight - 30, rowCount * rowHeight)}
          width={width}
        />
      </div>
    )
  }
}

export default List