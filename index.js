var assert = require('assert')

exports.rightmostRoot = function (argument) {
  return argument.nodes
    .reverse()
    .find(function (node) { return isRoot(argument, node) })
}

exports.leftmostRoot = function (argument) {
  return argument.nodes
    .find(function (node) { return isRoot(argument, node) })
}

function isRoot (context, node) {
  return !context.edges.some(function (edge) {
    return edge.child === node
  })
}

exports.recursive = function (costs, direction) {
  assert(costs)
  assert.equal(typeof costs.insert, 'function')
  assert.equal(typeof costs.delete, 'function')
  assert.equal(typeof costs.rename, 'function')
  assert(
    direction === exports.rightmostRoot ||
    direction === exports.leftmostRoot
  )
  return function distance (f, g) {
    assert(isAGraph(f))
    assert(isAGraph(g))
    var v, w

    if (empty(f) && empty(g)) {
      return 0
    } else if (empty(g)) {
      v = direction(f)
      return distance(withoutNode(f, v), g) + costs.delete(v)
    } else if (empty(f)) {
      w = direction(g)
      return distance(f, withoutNode(g, w)) + costs.insert(w)
    } else {
      if (!isATree(f) || !isATree(g)) {
        v = direction(f)
        w = direction(g)
        return Math.min(
          distance(withoutNode(f, v), g) + costs.delete(v),
          distance(f, withoutNode(g, w)) + costs.insert(w),
          distance(
            withoutSubtree(f, subtree(f, v)),
            withoutSubtree(g, subtree(g, w))
          )
        )
      } else {
        v = direction(f)
        w = direction(g)
        return Math.min(
          distance(withoutNode(f, v), g) + costs.delete(v),
          distance(f, withoutNode(g, w)) + costs.insert(w),
          distance(withoutNode(f, v), withoutNode(g, w)) + costs.rename(v, w)
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

exports.withoutNode = withoutNode

function withoutNode (graph, node) {
  return {
    nodes: graph.nodes.filter(function (otherNode) {
      return otherNode !== node
    }),
    edges: graph.edges.filter(function (edge) {
      return edge.parent !== node && edge.child !== node
    })
  }
}

exports.withoutSubtree = withoutSubtree

function withoutSubtree (graph, subtree) {
  return subtree.nodes.reduce(function (graph, node) {
    return withoutNode(graph, node)
  }, graph)
}

function empty (graph) {
  return graph.nodes.length === 0
}

function isATree (graph) {
  return graph.nodes.every(function (node) {
    return graph.edges.some(function (edge) {
      return edge.parent === node || edge.child === node
    })
  })
}
