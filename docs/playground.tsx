/* eslint-disable react/jsx-no-target-blank */

import React from 'react';
import treeData from './_mock/treeData.mock'
import treeData2 from './_mock/treeData2.mock'
import menuData from './_mock/menuData.mock'
import MultiTree from '../src/index'

const entity = new MultiTree(treeData, {
  childrenKey: 'child',
  targetChildrenKey: 'nodes',
  routeKey: 'name'
})

console.log(entity.getRouteBetweenTwoNode('音乐人', '电影编剧', {
  routeKey: 'label',
  matchKey: 'label'
}))

console.log(entity.filter((item, structure, vm) => {
  return item.label === '音乐人'
}))

console.log(entity.getNodesAndRelations('label'))

const entity2 = new MultiTree(treeData2, {
  routeKey: 'name'
})

// entity.forEach((item, structure, vm) => {
//   debugger
//   console.log(item.name, structure.index, structure.route.join('-'))
// }, 'bfs')

// console.log(entity.map((item, structure, vm) => {
//   debugger
//   return {
//     ...item,
//     structure
//   }
// }, {
//   targetChildrenKey: 'ddddddd'
// }))

// console.log(entity.pick((item, structure, vm) => {
//   return structure.depth === 3
// }))


// console.log(entity.reduce((prev, item, construct, vm) => {
//   return prev.concat(`-${item.label}`)
// }, 'head', 'dfs'))

// console.log(entity.reduce((prev, item, construct, vm) => {
//   debugger
//   return prev.push(item.label)
// }, [], 'dfs'))

// console.log(entity.toArray())

// bfsTraverse(treeData2, (item, structure, vm) => {
//   console.log(item.name, structure.depth, structure.route.join('-'))
// }, {
//   routeKey: 'name'
// })

export default () => {
  return <div />
};
