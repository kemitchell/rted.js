var assert = require('assert')
var debug = require('debug')('rted')

exports.rightmostRoot = function (graph) {
  var nodes = graph.nodes
  for (var index = graph.nodes.length - 1; index > -1; index--) {
    var node = nodes[index]
    if (isRoot(graph, node)) return node
  }
}

exports.leftmostRoot = function (graph) {
  var nodes = graph.nodes
  for (var index = 0; index < nodes.length; index++) {
    var node = nodes[index]
    if (isRoot(graph, node)) return node
  }
}

function isRoot (context, node) {
  return !context.edges.some(function (edge) {
    return edge.child === node
  })
}

var EMPTY = {nodes: [], edges: []}

function isEmpty (graph) {
  return graph.nodes.length === 0
}

exports.recursive = function (costs, traverse) {
  assert.equal(typeof costs, 'object')
  assert.equal(typeof costs.insert, 'function')
  assert.equal(typeof costs.delete, 'function')
  assert.equal(typeof costs.rename, 'function')
  assert(
    traverse === exports.rightmostRoot ||
    traverse === exports.leftmostRoot
  )
  return function distance (f, g) {
    assert(isAGraph(f), 'first argument not a graph')
    assert(isAGraph(g), 'second argument not a graph')
    var v, w

    // δ(∅, ∅) = 0
    if (isEmpty(f) && isEmpty(g)) {
      debug('both empty')
      return 0
    // δ(F, ∅) = δ(F − v, ∅) + cd(v)
    } else if (isEmpty(g)) {
      debug('g is empty')
      v = traverse(f)
      return distance(minus(f, v), EMPTY) + costs.delete(v)
    // δ(∅, G) = δ(∅, G − w) + ci(w)
    } else if (isEmpty(f)) {
      debug('f is empty')
      w = traverse(g)
      return distance(EMPTY, minus(g, w)) + costs.insert(w)
    } else {
      // if F is not a tree or G is not a tree:
      if (!isATree(f) || !isATree(g)) {
        debug('one tree')
        v = traverse(f)
        w = traverse(g)
        // δ(F, G) = min ...
        return Math.min(
          // δ(F − v, G) + cd(v)
          distance(minus(f, v), g) + costs.delete(v),
          // δ(F, G − w) + ci(w)
          distance(f, minus(g, w)) + costs.insert(w),
          // δ(Fv, Gw) + δ(F − Fv, G − Gw)
          (
            distance(subtree(f, v), subtree(g, w)) +
            distance(
              minus(f, subtree(f, v)),
              minus(g, subtree(g, w))
            )
          )
        )
      // if F is a tree and G is a tree:
      } else {
        debug('both trees')
        v = traverse(f)
        w = traverse(g)
        // δ(F, G) = min ...
        return Math.min(
          // δ(F − v, G) + cd(v)
          distance(minus(f, v), g) + costs.delete(v),
          // δ(F, G − w) + ci(w)
          distance(f, minus(g, w)) + costs.insert(w),
          // δ(F − v, G − w) + cr(v, w)
          distance(minus(f, v), minus(g, w)) + costs.rename(v, w)
        )
      }
    }
  }
}

function isAGraph (argument) {
  return (
    typeof argument === 'object' &&
    // Nodes
    argument.hasOwnProperty('nodes') &&
    Array.isArray(argument.nodes) &&
    argument.nodes.every(function (element) {
      return typeof element === 'string'
    }) &&
    // Edges
    argument.hasOwnProperty('edges') &&
    Array.isArray(argument.edges) &&
    argument.edges.every(function (edge) {
      return (
        typeof edge === 'object' &&
        edge.hasOwnProperty('parent') &&
        typeof edge.parent === 'string' &&
        edge.hasOwnProperty('child') &&
        typeof edge.child === 'string'
      )
    })
  )
}

function subtree (graph, newRoot) {
  var descendantsOfNewRoot = descendantsOf(graph, newRoot)
  var nodes = graph.nodes.filter(function (node) {
    return node === newRoot || descendantsOfNewRoot.includes(node)
  })
  var edges = graph.edges.filter(function (edge) {
    return nodes.some(function (node) {
      return edge.graph === node || edge.child === node
    })
  })
  return {nodes, edges}
}

function descendantsOf (graph, node) {
  var returned = []
  // Find and add children.
  graph.edges.forEach(function (edge) {
    if (edge.parent === node) returned.push(edge.child)
  })
  // Find and add descendants of children.
  returned.forEach(function (child) {
    descendantsOf(graph, child).forEach(function (descendant) {
      returned.push(descendant)
    })
  })
  return returned
}

exports.minus = minus

function minus (graph, removing) {
  if (isAGraph(removing)) return minusSubtree(graph, removing)
  else return minusNode(graph, removing)
}

function minusNode (graph, removing) {
  return {
    nodes: graph.nodes.filter(function (otherNode) {
      return otherNode !== removing
    }),
    edges: graph.edges.filter(function (edge) {
      return edge.parent !== removing && edge.child !== removing
    })
  }
}

function minusSubtree (graph, subtree) {
  var nodes = subtree.nodes
  for (var index = 0; index < nodes.length; index++) {
    var node = nodes[index]
    graph = minus(graph, node)
  }
  return graph
}

function isATree (graph) {
  return graph.nodes.every(function (node) {
    return graph.edges.some(function (edge) {
      return edge.parent === node || edge.child === node
    })
  })
}
