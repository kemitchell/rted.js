var assert = require('assert')
var rted = require('./')

var evenLeftRecursive = rted.recursive(
  {
    insert: function () { return 1 },
    delete: function () { return 1 },
    rename: function () { return 1 }
  },
  rted.leftmostRoot
)

assert.equal(
  evenLeftRecursive(
    {
      nodes: ['a', 'b'],
      edges: [
        {parent: 'a', child: 'b'}
      ]
    },
    {
      nodes: ['a', 'c'],
      edges: [
        {parent: 'a', child: 'c'}
      ]
    }
  ),
  1
)

assert.equal(
  evenLeftRecursive(
    {
      nodes: ['a', 'b'],
      edges: [
        {parent: 'a', child: 'b'}
      ]
    },
    {
      nodes: ['a', 'b', 'c', 'd'],
      edges: [
        {parent: 'a', child: 'b'},
        {parent: 'b', child: 'c'},
        {parent: 'c', child: 'd'}
      ]
    }
  ),
  2
)
