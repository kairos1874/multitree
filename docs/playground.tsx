/* eslint-disable react/jsx-no-target-blank */

import React from 'react';
import { bfsTraverse } from '../src/data-structures/MultiTree2'
import treeData from './_mock/treeData.mock'
import treeData2 from './_mock/treeData2.mock'
import menuData from './_mock/menuData.mock'

// const entity = new MultiTree(treeData2, {
//   childrenKey: 'children',
//   routeKey: 'label',
//   targetChildrenKey: 'children',
// })

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
  console.log(item.name, structure.index, structure.route.join('-'))
}, {
  routeKey: 'name'
})

export default () => {
  return <div />
};
