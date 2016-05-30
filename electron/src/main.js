import  React from "react"
import ReactDOM from "react-dom"
import Wail from './js/componets/wail'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()

const wail = document.getElementById('wail')



ReactDOM.render(<Wail />, wail)