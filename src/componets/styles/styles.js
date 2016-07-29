import { red500, blue500 } from 'material-ui/styles/colors'
import spacing from 'material-ui/styles/spacing'
import { zIndex } from 'material-ui/styles'

export default {
  buttonBasic: {
    margin: '25px 10px 0 30px'
  },
  underlineStyle: {
    borderColor: blue500
  },
  underlineStyleError: {
    borderColor: red500
  },
  button: {
    // padding: '10px',
    right: 0,
    margin: 12
  },
  buttonMemento: {
    // left: '5px',
    marginTop: 35
  },
  buttonPad: {
    right: 0,
    margin: 45
  },
  urlInput: {
    left: 20
  },
  heritrixJobList: {
    overflow: 'hidden',
    overflowY: 'scroll',
    height: 140
  },
  root: {
    paddingTop: spacing.desktopKeylineIncrement
  },
  appBar: {
    position: 'fixed',
    // Needed to overlap the examples
    zIndex: zIndex.appBar + 1,
    top: 0
  },
  ncAppBar: {
    display: 'flex',
    boarderRadius: '0px',
    position: 'fixed',
    width: '100%',
    // Needed to overlap the examples
    zIndex: zIndex.appBar + 1,
    top: 0
  },
  navDrawer: {
    zIndex: zIndex.appBar - 1
  },

  basicTapRightColPad: {
    paddingLeft: 55
  },
  mementoMessage: {
    paddingTop: 10,
    paddingLeft: 10
  },
  spinningMemento: {
    paddingTop: 10,
    paddingLeft: 115
  },
  mementoCount: {
    paddingLeft: 115
  },
  tableHeaderCol: {
    paddingLeft: '12px',
    paddingRight: '12px',
    cursor: 'default'
  },
  tableHeader: {
    borderBottomStyle: 'none',
    cursor: 'default'
  },
  tableRowCol: {
    paddingLeft: '12px',
    paddingRight: '12px',
    wordWrap: 'break-word',
    textOverflow: 'none',
    whiteSpace: 'normal',
    cursor: 'default'
  },
  cursor: {
    cursor: 'default'
  },
  settingsCol: {
    width: '80px'
  },
  settingsActionCol: {
    width: '180px'
  },
  settingsButton: {
    marginLeft: '10px'
  },
  servicesSS: {
    width: '80px',
    cursor: 'default'
  },
  servicesActionsH: {
    width: '200px',
    cursor: 'default',
    textAlign: 'center',
  },
  servicesActions: {
    width: '200px',
    cursor: 'default'
  },
  serviceActionButton: {
    margin: '10px'
  }
}
