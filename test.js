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

var figure3 = {
  nodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  edges: [
    {parent: 'a', child: 'b'},
    {parent: 'a', child: 'c'},
    {parent: 'c', child: 'd'},
    {parent: 'c', child: 'e'},
    {parent: 'e', child: 'f'},
    {parent: 'c', child: 'g'}
  ]
}

assert.equal(rted.leftmostRoot(figure3), 'a')
assert.equal(rted.rightmostRoot(figure3), 'a')

var removed1 = rted.minus(figure3, rted.leftmostRoot(figure3))
assert.equal(rted.rightmostRoot(removed1), 'c')
assert.equal(rted.leftmostRoot(removed1), 'b')

assert.deepEqual(
  rted.minus(removed1, rted.rightmostRoot(removed1)),
  {
    nodes: ['b', 'd', 'e', 'f', 'g'],
    edges: [
      {parent: 'e', child: 'f'}
    ]
  }
)
assert.deepEqual(
  rted.minus(removed1, rted.leftmostRoot(removed1)),
  {
    nodes: ['c', 'd', 'e', 'f', 'g'],
    edges: [
      {parent: 'c', child: 'd'},
      {parent: 'c', child: 'e'},
      {parent: 'e', child: 'f'},
      {parent: 'c', child: 'g'}
    ]
  }
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

process.exit()

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
        {parent: 'a', child: 'd'},
        {parent: 'b', child: 'c'}
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
