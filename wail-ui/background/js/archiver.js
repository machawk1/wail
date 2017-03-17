import 'babel-polyfill'
import '../../../wail-core/util/setMethods'
import React from 'react'
import {render} from 'react-dom'
import ArchiveComponent from '../../../wail-twitter/archive/archiveComponent'

render(<ArchiveComponent />, document.getElementById('archiverMount'))
