import 'babel-polyfill'
import '../../../wail-core/util/setMethods'
import React from 'react'
import {render} from 'react-dom'
import ArchiveComponent from '../../../wail-archiver'

render(<ArchiveComponent />, document.getElementById('archiverMount'))
