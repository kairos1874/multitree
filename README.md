## 使用

## 使用
```
yarn add @hyrule/multitree
```

## 工具方法
dfsTraverse(treeData, callback, [option])

使用深度优先进行遍历树结构

#### 参数

1. treeData *(Array | Object)*: 需要处理的树形数据
2. callback *(Function)*: 回调函数
3. `[option]` *(Object)*: 配置项

其中 callback 为 (item, structure, data) => {}，item 为该节点当前遍历到的节点的数据，structure 为该节点的在树结构中的结构化信息，data 为原始的树结构数据

```javascript | typescript
import { dfsTraverse } from '@hyrule/multitree'
dfsTraverse(treeData, (item, structure, data) => {
  console.log(item, structure, data)
}, {
    childrenKey: 'children',
    targetChildrenKey: 'children',
    routeKey: 'id'
})
```

bfsTraverse(treeData, callback, [option])

使用广度优先进行遍历树结构

#### 参数

1. treeData *(Array | Object)*: 需要处理的树形数据
2. callback *(Function)*: 回调函数
3. `[option]` *(Object)*: 配置项

其中 callback 为 (item, structure, data) => {}，item 为该节点当前遍历到的节点的数据，structure 为该节点的在树结构中的结构化信息，data 为原始的树结构数据

```javascript | typescript
import { bfsTraverse } from '@hyrule/multitree'
bfsTraverse(treeData, (item, structure, data) => {
  console.log(item, structure, data)
}, {
    childrenKey: 'children',
    targetChildrenKey: 'children',
    routeKey: 'id'
})
```
