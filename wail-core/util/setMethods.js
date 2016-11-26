Set.prototype.isSuperset = function(subset) {
  for (let elem of subset) {
    if (!this.has(elem)) {
      return false
    }
  }
  return true
}

Set.prototype.union = function(setB) {
  const union = new Set(this)
  for (let elem of setB) {
    union.add(elem)
  }
  return union
}

Set.prototype.intersection = function(setB) {
  const intersection = new Set()
  for (let elem of setB) {
    if (this.has(elem)) {
      intersection.add(elem)
    }
  }
  return intersection
}

Set.prototype.difference = function(setB) {
  const difference = new Set(this)
  for (let elem of setB) {
    difference.delete(elem)
  }
  return difference
}