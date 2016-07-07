import { red500, blue500 } from 'material-ui/styles/colors'
import spacing from 'material-ui/styles/spacing'
import { zIndex } from 'material-ui/styles'

export default {
  buttonBasic: {
    margin: 12,
  },
  underlineStyle: {
    borderColor: blue500,
  },
  underlineStyleError: {
    borderColor: red500,
  },
  button: {
    // padding: '10px',
    right: '0px',
    margin: 12,
  },
  buttonMemento: {
    // left: '5px',
    marginTop: 35,
  },
  buttonPad: {
    right: '0px',
    margin: 45,
  },
  urlInput: {
    left: 10,
  },
  heritrixJobList: {
    overflow: "hidden",
    overflowY: "scroll",
    height: 300,
  },
  root: {
    paddingTop: spacing.desktopKeylineIncrement,
  },
  appBar: {
    position: 'fixed',
    // Needed to overlap the examples
    zIndex: zIndex.appBar + 1,
    top: 0,
  },
  navDrawer: {
    zIndex: zIndex.appBar - 1,
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
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  tableHeader: {
    borderBottomStyle: "none"
  },
  tableRowCol: {
    paddingLeft: "12px",
    paddingRight: "12px",
    wordWrap: "break-word",
    textOverflow: "none",
    whiteSpace: "normal",
  }

}