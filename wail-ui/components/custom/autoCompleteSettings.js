import React from 'react'
import MenuItem from 'material-ui/MenuItem'

export const noFilter = () => true

export const caseInsensitivePrefixFilter = (searchText, key) => {
  return key.toLowerCase().startsWith(searchText.toLowerCase())
}

export const defaultFilter = caseInsensitivePrefixFilter

export const caseInsensitiveFilter = (searchText, key) => {
  return key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
}

export const caseSensitiveFilter = (searchText, key) => {
  return searchText !== '' && key.indexOf(searchText) !== -1
}

export const nonBlankCaseInsPrefixFilter = (searchText, key) => {
  return searchText !== '' ? caseInsensitivePrefixFilter(searchText, key) : false
}

const levenshteinDistance = (searchText, key) => {
  const current = []
  let prev
  let value

  for (let i = 0; i <= key.length; i++) {
    for (let j = 0; j <= searchText.length; j++) {
      if (i && j) {
        if (searchText.charAt(j - 1) === key.charAt(i - 1)) value = prev
        else value = Math.min(current[j], current[j - 1], prev) + 1
      } else {
        value = i + j
      }
      prev = current[j]
      current[j] = value
    }
  }
  return current.pop()
}
export const levenshteinDistanceFilter = (distanceLessThan) => {
  if (distanceLessThan === undefined) {
    return levenshteinDistance
  } else if (typeof distanceLessThan !== 'number') {
    throw 'Error: levenshteinDistanceFilter is a filter generator, not a filter!'
  }

  return (s, k) => levenshteinDistance(s, k) < distanceLessThan
}

export const fuzzyFilter = (searchText, key) => {
  const compareString = key.toLowerCase()
  searchText = searchText.toLowerCase()

  let searchTextIndex = 0
  for (let index = 0; index < key.length; index++) {
    if (compareString[index] === searchText[searchTextIndex]) {
      searchTextIndex += 1
    }
  }

  return searchTextIndex === searchText.length
}

export const defaultMenuItemRender = (settings, option) => ( // eslint-disable-line react/display-name
  <MenuItem
    key={option.value}
    primaryText={option.label}
    value={option.value}
    {...settings.props}
  />
)

const renderHighlightedOption = (optionLabel, searchText) => {
  let searchTextIndex = optionLabel.toLowerCase().indexOf(searchText.toLowerCase())
  if (searchTextIndex > -1) {
    let matchStartIndex = searchTextIndex,
      matchEndIndex = matchStartIndex + searchText.length
    let labelStart = optionLabel.substring(0, matchStartIndex),
      labelMatch = optionLabel.substring(matchStartIndex, matchEndIndex),
      labelEnd = optionLabel.substring(matchEndIndex)
    return <span>{labelStart}<strong>{labelMatch}</strong>{labelEnd}</span>
  }
  else {
    return <span>{optionLabel}</span>
  }
}
export const highlightedMenuItemRender = (settings, option) => ( // eslint-disable-line react/display-name
  <MenuItem
    key={option.value}
    value={option.value}
    {...settings.props}
  >
    { renderHighlightedOption(option.label, settings.searchText) }
  </MenuItem>
)

export const showAllOptions = (props) => {
  const { filter } = props
  return {
    filter: filter || caseInsensitivePrefixFilter,
    openOnFocus: true
  }
}

export const showLimitedOptions = (props) => {
  const { filter, maxSearchResults } = props
  return {
    filter: filter || nonBlankCaseInsPrefixFilter,
    openOnFocus: false,
    showOptionsWhenBlank: false,
    maxSearchResults: maxSearchResults || 10
  }
}

export const highlightMatchedOptionText = () => {
  return {
    menuItemRenderer: highlightedMenuItemRender
  }
}