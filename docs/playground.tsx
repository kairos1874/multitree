/* eslint-disable react/jsx-no-target-blank */

import React from 'react';
import { bfsTraverse } from '../src/data-structures/MultiTree/util'
import treeData from './_mock/treeData.mock'
import treeData2 from './_mock/treeData2.mock'
import menuData from './_mock/menuData.mock'
import MultiTree from '../src/data-structures/MultiTree/index'

const entity = new MultiTree(treeData, {
  childrenKey: 'child',
  targetChildrenKey: 'nodes',
  routeKey: 'name'
})
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

console.log(entity.toArray())

// dfsTraverse(
//   treeData,
//   (item, structData, vm) => {
//     // debugger
//     console.log(item.label, structData.index, structData.route, {
//       ...item,
//       ...structData,
//     });
//   },
//   {
//     routeKey: 'label',
//     childrenKey: 'child',
//     targetChildrenKey: 'children'
//   },
// )

bfsTraverse(treeData2, (item, structure, vm) => {
  console.log(item.name, structure.depth, structure.route.join('-'))
}, {
  routeKey: 'name'
})

export default () => {
  return <div />
};
