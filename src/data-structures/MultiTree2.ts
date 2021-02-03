import Stack from './Stack'
import Queue from './Queue'
import {
  TreeData, Processor, IOptionParams, IMultiTree
} from '@/interface/multiTree'

/**
 * 合并配置选项
 * */
function mergeOption(option?: IOptionParams) {
  const defaultOption = {
    childrenKey: 'children',
    routeKey: 'id',
    targetChildrenKey: 'children',
  }

  let targetOption = { ...defaultOption }

  if (option?.childrenKey) {
    targetOption = {
      ...defaultOption,
      targetChildrenKey: option.childrenKey,
    }
  }

  return {
    ...targetOption,
    ...option,
  }
}

/**
 * 生成根节点的结构化信息
 * */
function getRootNodeStructure(node: object, option: IOptionParams, rootIndex: number) {
  const { routeKey, childrenKey } = option
  const { [childrenKey]: children, [routeKey]: nodeRoute } = node
  const isChildrenArrayAndNotEmpty = Array.isArray(children) && children.length > 0

  return {
    depth: rootIndex,                                             // 节点的深度，也可以理解为层级
    index: `${rootIndex}`,                                        // 索引，比如 '0-2-4-55-61-3'
    route: [].concat(nodeRoute),                                  // 从根节点到当前节点的路径
    siblings: [node],                                             // 同属一个父节点的兄弟节点们（含自身）
    children: isChildrenArrayAndNotEmpty ? children : [],         // 子节点
    degree: isChildrenArrayAndNotEmpty > 0 ? children.length : 0, // 该节点的度，也就是子节点的数量
    parent: null,                                                 // 父节点
    isLeaf: !isChildrenArrayAndNotEmpty,                          // 是否为叶子节点
  }
}

/**
 * 在遍历时累增节点的结构化信息
* */
function getNextLevelNodeStructure(parentNode: object, option: IOptionParams, traverseIndex: number) {
  const { childrenKey, routeKey } = option
  const { [childrenKey]: parentNodeChildren, _structure: { depth, index, route }, ...content } = parentNode
  const { [childrenKey]: children, [routeKey]: nodeRoute } = Array.isArray(parentNodeChildren) ? parentNodeChildren[traverseIndex] : {}
  const isChildrenArrayAndNotEmpty = Array.isArray(children) && children.length > 0

  return {
    depth: depth + 1,                                         // 节点的深度，也可以理解为层级
    index: index.concat(`-${traverseIndex}`),                 // 索引，比如 '0-2-4-55-61-3'
    route: route.concat(nodeRoute),                           // 从根节点到当前节点的路径
    siblings: parentNodeChildren,                             // 同属一个父节点的兄弟节点们（含自身）
    children: isChildrenArrayAndNotEmpty ? children : [],     // 子节点
    degree: isChildrenArrayAndNotEmpty ? children.length : 0, // 该节点的度，也就是子节点的数量
    parent: content,                                          // 父节点
    isLeaf: !isChildrenArrayAndNotEmpty,                      // 是否为叶子节点
  };
}

/**
 * 深度优先遍历，使用栈来实现
 * @param   {Object | null} data 树结构的 json 数据
 * @param   {Function} callback 回调函数
 * @param   {Object}  option
 * */
export function dfsTraverse(data: object | object[], callback: Processor, option?: IOptionParams) {
  if (data === null) {
    return
  }

  const newOption = mergeOption(option)
  const { childrenKey = 'children' } = newOption
  const stack = new Stack()
  let order = 0

  // 入栈
  if (Array.isArray(data)) {
    for (let i = data.length - 1; i >= 0; i--) {
      stack.push({
        ...data[i],
        _structure: getRootNodeStructure(data[i], newOption, i),
      })
    }
  } else {
    stack.push({
      ...data,
      _structure: getRootNodeStructure(data, newOption, 0),
    })
  }

  while (!stack.isEmpty()) {
    // 出栈
    const node = stack.pop()
    const { [childrenKey]: children, _structure, ...content } = node;
    callback(
      content,
      {
        ..._structure,
        order,
      },
      data,
    );
    order++
    if (Array.isArray(children) && children.length > 0) {
      const length = children.length;
      for (let i = length - 1; i >= 0; i--) {
        // 入栈
        stack.push({
          ...children[i],
          _structure: getNextLevelNodeStructure(node, newOption, i),
        });
      }
    }
  }
}

/**
 * 广度优先遍历，使用队列来实现
 * @param   {Object | null} data 树结构的 json 数据
 * @param   {Function} callback 回调函数
 * @param   {Object}  option
 * */
export function bfsTraverse(data: object | object[], callback: Processor, option?: IOptionParams) {
  if (data === null) {
    return
  }

  const newOption = mergeOption(option)
  const { childrenKey = 'children' } = newOption
  const queue = new Queue()
  let order = 0

  // 入队
  if (Array.isArray(data)) {
    for (let i = 0; i <= data.length - 1; i++) {
      queue.enqueue({
        ...data[i],
        _structure: getRootNodeStructure(data[i], newOption, i),
      })
    }
  } else {
    queue.enqueue({
      ...data,
      _structure: getRootNodeStructure(data, newOption, 0),
    })
  }

  while (!queue.isEmpty()) {
    // 出队
    const node = queue.dequeue()
    const { [childrenKey]: children, _structure, ...content } = node
    callback(
      content,
      {
        ..._structure,
        order,
      },
      data,
    );
    order++;
    if (Array.isArray(children) && children.length > 0) {
      const length = children.length;
      for (let i = 0; i <= length - 1; i++) {
        // 入队
        queue.enqueue({
          ...children[i],
          _structure: getNextLevelNodeStructure(node, newOption, i),
        })
      }
    }
  }
}

// 递归实现的深度优先遍历，待实现，但不是很推荐使用
export function dfsTraverseWithRecursion(data: object, callback: Processor, option: IOptionParams) {}
// 递归实现的广度优先遍历，待实现，但不是很推荐使用
export function bfsTraverseWithRecursion(data: object, callback: Processor, option: IOptionParams) {}
