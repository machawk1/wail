import React, {Component, PropTypes} from 'react'
import SeedListItem from './seedListItem'
import {reduxForm} from 'redux-form/immutable'
import S from 'string'
import seedName from './seedName'

export default class SeedList extends Component {
  static propTypes = {
    warcSeeds: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  constructor (...args) {
    super(...args)
    this.state = {
      page: 0
    }
  }

  nextPage () {
    this.setState({ page: this.state.page + 1 })
  }

  previousPage () {
    this.setState({ page: this.state.page - 1 })
  }

  moreThanOne (wsLen, page, warcSeeds, onSubmit, formConfig) {
    let FormPage = reduxForm(formConfig)(SeedListItem)
    if (page < wsLen - 1 && page > 0) {
      return (<FormPage onSubmit={::this.nextPage} canGoBack previousPage={::this.previousPage} submitter={false}
        seed={warcSeeds[ page ]} />)
    } else if (page === wsLen - 1) {
      return (<FormPage onSubmit={onSubmit} canGoBack previousPage={::this.previousPage} submitter
        seed={warcSeeds[ page ]} />)
    } else {
      return (<FormPage onSubmit={::this.nextPage} canGoBack={false} submitter={false} seed={warcSeeds[ page ]} />)
    }
  }

  render () {
    const { onSubmit, warcSeeds } = this.props
    const { page } = this.state
    let formConfig = {
      form: 'fsSeedDiscovery',  // a unique identifier for this form,
      destroyOnUnmount: false,
      validate (values) {
        const errors = {}
        let name = seedName(warcSeeds[ page ].name)
        let realSeed = values.get(name)
        if (!realSeed) {
          errors[ name ] = 'Required'
        } else {
          if (S(realSeed).isEmpty()) {
            errors[ name ] = 'Must Select The Seed'
          }
        }
        return errors
      }
    }

    let wsLen = warcSeeds.length
    let configuredFormPage
    if (wsLen > 0) {
      if (wsLen > 1) {
        configuredFormPage = this.moreThanOne(wsLen, page, warcSeeds, onSubmit, formConfig)
      } else {
        let FormPage = reduxForm(formConfig)(SeedListItem)
        configuredFormPage = <FormPage onSubmit={onSubmit} canGoBack={false} submitter
          seed={warcSeeds[ page ]} />
      }
    } else {
      configuredFormPage = <p>No Seeds To Add</p>
    }
    return (
      <div style={{ marginLeft: 16, width: '100%', height: '50%' }}>
        {configuredFormPage}
      </div>
    )
  }
}
