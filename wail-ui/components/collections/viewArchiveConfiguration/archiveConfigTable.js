import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import MyAutoSizer from '../../utilComponents/myAutoSizer'

const depthToConfig = d => {
  if (d === 1) {
    return 'Page Only'
  } else if (d === 2) {
    return 'Page + Same domain links'
  } else {
    return 'Page + All internal and external links'
  }
}

const seedToConfig = (state, viewingCol) => {
  const col = state.get('collections').get(viewingCol)
  console.log(col.toJS())
  const colName = col.get('colName')
  const crawls = state.get('runs').filter((crawl, jid) => crawl.get('forCol') === colName)
  let sTcs = []
  col.get('seeds').forEach(seed => {
    seed.get('jobIds').forEach(jid => {
      let crawl = crawls.get(`${jid}`)
      if (crawl) {
        sTcs.push({
          url: seed.get('url'),
          config: depthToConfig(crawl.get('depth'))
        })
      } else {
        sTcs.push({
          url: seed.get('url'),
          config: 'Page Only'
        })
      }
      return true
    })
    return true
  })
  return sTcs
}

const stateToProps = (state, ownProps) => ({
  sc: seedToConfig(state, ownProps.viewingCol)
})

class ArchiveConfigTable extends Component {
  static propTypes = {
    sc: PropTypes.array.isRequired,
    viewingCol: PropTypes.string.isRequired,
    containerElement: PropTypes.string.isRequired
  }

  rendTr () {
    let {sc} = this.props
    let len = sc.length
    let trs = []
    for (let i = 0; i < len; ++i) {
      let {url, config} = sc[i]
      trs.push(<TableRow key={`${i}-${url}`}>
        <TableRowColumn key={`${i}-${url}-seed-url`}>
          {url}
        </TableRowColumn>
        <TableRowColumn key={`${i}-${url}-config`}>
          {config}
        </TableRowColumn>
      </TableRow>)
    }
    return trs
  }

  render () {
    const seedConfigs = this.rendTr()
    return (
      <MyAutoSizer findElement={this.props.containerElement}>
        {({height}) => (
          <Table height={`${height - 230}px`}>
            <TableHeader
              selectable={false}
              displaySelectAll={false}
              adjustForCheckbox={false}
            >
              <TableRow >
                <TableHeaderColumn>Seed Url</TableHeaderColumn>
                <TableHeaderColumn>Configuration</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              showRowHover={false}
              displayRowCheckbox={false}
            >
              {seedConfigs}
            </TableBody>
          </Table>
        )}
      </MyAutoSizer>
    )
  }
}

export default connect(stateToProps)(ArchiveConfigTable)
