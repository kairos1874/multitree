/**
 * 多叉树
 * */
import Stack from './Stack'
import Queue from './Queue'
import _get from 'lodash/get'

interface IOptionParams {
  childrenKey?: string;
  targetChildrenKey?: string;
  routeKey?: string;
}

interface IOption {
  childrenKey: string;
  targetChildrenKey: string;
  routeKey: string;
}

interface IStructData {
  depth?: number;
  index?: string;
  route?: any[];
  siblings?: any[];
  children?: any[];
  isLeaf?: boolean;
  degree?: number;
  order?: number;
}

type Processor = (x?: object, y?: IStructData, z?: object | null) => void;
type MapCallback = (x?: object, y?: IStructData, z?: object | null) => object;
type PickCallback = (x?: object, y?: IStructData, z?: object | null) => boolean;
type ReduceCallback = (w?: any, x?: object, y?: IStructData, z?: object | null) => any;
type TraversalType = 'dfs' | 'bfs';

function mergeOptionParams(option?: IOptionParams) {
  const defaultOption = {
    childrenKey: 'children',
    targetChildrenKey: 'children',
    routeKey: 'id',
  };

  let targetOption = {
    ...defaultOption,
  };

  if (option?.childrenKey) {
    targetOption = {
      ...targetOption,
      targetChildrenKey: option.childrenKey,
    };
  }

  targetOption = {
    ...targetOption,
    ...option,
  };
  return targetOption;
}

// 初始化树结构每个节点的 结构属性，主要用在回调函数中
function getInitialStructure(node: object, option: IOptionParams) {
  const { childrenKey, routeKey } = option
  const { [childrenKey]: children } = node
  const isChildrenArrayAndNotEmpty = Array.isArray(children) && children.length > 0
  return {
    depth: 0,
    index: '0',
    route: [].concat(node[routeKey]),
    siblings: [node],
    children: isChildrenArrayAndNotEmpty ? children : [],
    degree: isChildrenArrayAndNotEmpty > 0 ? children.length : 0,
    parent: null,
    isLeaf: !isChildrenArrayAndNotEmpty,
  }
}

// 每个节点的 结构属性的递增
function getIterativeStructure(parentNode: object, option: IOptionParams, iterativeIndex: number) {
  const { childrenKey, routeKey } = option;
  const { [childrenKey]: children, structure, ...content } = parentNode;
  const { depth, index, route } = structure;
  const { children: subChildren } = children[iterativeIndex];
  const isSubChildrenArrayAndNotEmpty = Array.isArray(subChildren) && subChildren.length > 0;

  return {
    depth: depth + 1,
    index: index.concat(`-${iterativeIndex}`),
    route: route.concat(_get(children[iterativeIndex], `${routeKey}`)),
    siblings: children,
    children: isSubChildrenArrayAndNotEmpty ? subChildren : [],
    degree: isSubChildrenArrayAndNotEmpty ? subChildren.length : 0,
    parent: content,
    isLeaf: !isSubChildrenArrayAndNotEmpty,
  };
}

// 广度优先遍历
export function bfsTraverse(data: object, callback: Processor, option?: IOptionParams) {
  let order = 0;
  const { childrenKey } = mergeOptionParams(option);
  const queue = new Queue();
  // 入队
  queue.enqueue({
    ...data,
    structure: getInitialStructure(data, mergeOptionParams(option)),
  });
  while (!queue.isEmpty()) {
    // 出队
    const node = queue.dequeue();
    const { [childrenKey]: children, structure, ...content } = node;
    callback(
      content,
      {
        ...structure,
        order,
      },
      data,
    );
    order++;
    if (Array.isArray(children) && children.length > 0) {
      const length = children.length;
      for (let i = 0; i <= length - 1; i++) {
        // const { children } = children[i];
        queue.enqueue({
          ...children[i],
          structure: getIterativeStructure(node, mergeOptionParams(option), i),
        });
      }
    }
  }
}

// 深度优先遍历
export function dfsTraverse(data: object, callback: Processor, option?: IOptionParams) {
  let order = 0;
  const { childrenKey } = mergeOptionParams(option);

  const stack = new Stack();
  // 入栈
  stack.push({
    ...data,
    structure: getInitialStructure(data, mergeOptionParams(option)),
  });
  while (!stack.isEmpty()) {
    // 出栈
    const node = stack.pop();
    const { [childrenKey]: children, structure, ...content } = node;
    callback(
      content,
      {
        ...structure,
        order,
      },
      data,
    );
    order++;
    if (Array.isArray(children) && children.length > 0) {
      const length = children.length;
      for (let i = length - 1; i >= 0; i--) {
        // 入栈
        stack.push({
          ...children[i],
          structure: getIterativeStructure(node, mergeOptionParams(option), i),
        });
      }
    }
  }
}

// 递归实现的深度优先遍历，待实现
export function dfsTraverseWithRecursion(data: object, callback: Processor) {}
// 递归实现的广度优先遍历，待实现
export function bfsTraverseWithRecursion(data: object, callback: Processor) {}

/**
 * 将数组转换成森林
 * */
export function arrayToForest(nodes: object[]) {
  // let forest: object[] = []
  // for (let i = 0; i < nodes.length; i++) {
  //   forest.push(nodes[i])
  // }
}

class MultiTree {
  private readonly data: object | null
  private readonly option: IOption

  constructor(data: object | null, option: IOptionParams) {
    const defaultOption = {
      childrenKey: 'children',
      targetChildrenKey: 'children',
      routeKey: 'id',
    };

    this.data = data;
    this.option = {
      ...defaultOption,
    };

    if (option.childrenKey) {
      this.option = {
        ...this.option,
        targetChildrenKey: option.childrenKey,
      };
    }

    this.option = {
      ...this.option,
      ...option,
    };
  }

  /**
   * map 方法，将树结构映射成另一棵树
   * */
  map(callback: MapCallback) {
    if (this.data === null) {
      return null;
    }
    const vm = this;
    const { childrenKey, targetChildrenKey } = this.option;
    // let order = 0

    function recursion(data: object) {
      const { [childrenKey]: children, structure, ...content } = data;
      const target = callback(
        content,
        {
          ...structure,
          // order,
        },
        vm.data,
      );
      // order++
      if (Array.isArray(children) && children.length > 0) {
        target[targetChildrenKey] = [];
        for (let i = 0; i < children.length; i++) {
          target[targetChildrenKey].push(
            recursion({
              ...children[i],
              structure: getIterativeStructure(data, vm.option, i),
            }),
          );
        }
      }
      return target;
    }
    return recursion({
      ...this.data,
      structure: getInitialStructure(this.data, this.option),
    });
  }

  /**
   * 获取结构化后的 data
   * */
  getStructuralData() {
    return this.map((item, structure) => {
      return {
        ...item,
        structure,
      };
    });
  }

  /**
   * pick 方法，挑选出符合条件的节点，返回的是符合条件的节点的数组
   * */
  pick(callback: PickCallback) {
    if (this.data === null) {
      return []
    }
    // let order = 0
    const structuralData = this.getStructuralData();
    const target = [];
    const queue = new Queue();
    queue.enqueue(structuralData);

    while (!queue.isEmpty()) {
      const node = queue.dequeue();
      const { [this.option.childrenKey]: children, structure, ...content } = node;
      if (callback(content, structure, this.data)) {
        target.push(content);
      }
      if (Array.isArray(children) && children.length > 0) {
        const length = children.length;
        for (let i = 0; i <= length - 1; i++) {
          queue.enqueue(children[i]);
        }
      }
    }
    return target
  }

  /**
   * filter 方法，用递归实现，返回树结构
   * */
  filter(callback: PickCallback) {
    const vm = this;
    if (this.data === null) {
      return null;
    }
    // let order = 0;

    const { childrenKey, targetChildrenKey } = this.option;

    function recursion(data: object) {
      const { [childrenKey]: children, structure, ...content } = data;
      if (Array.isArray(children) && children.length > 0) {
        const shortlisted: any[] = children
          .map((item, subIndex) => {
            return recursion({
              ...item,
              structure: getIterativeStructure(data, vm.option, subIndex),
            });
          })
          .filter(ele => ele !== null);

        if (shortlisted.length > 0) {
          return {
            ...content,
            [targetChildrenKey]: shortlisted,
          };
        }
        if (
          callback(
            content,
            {
              ...structure,
              // order,
            },
            vm.data as object,
          )
        ) {
          return { ...content };
        }
        return null;
      } else {
        if (
          callback(
            content,
            {
              ...structure,
              // order
            },
            vm.data as object,
          )
        ) {
          return { ...content };
        }
        return null;
      }
    }
    return recursion({
      ...this.data,
      structure: getInitialStructure(this.data, this.option),
    });
  }

  /**
   * 获取所有的 节点 和 节点之间的连线关系，可以用在绘图等方面，使用深度优先遍历
   * */
  getNodesAndRelations(relationKey: string = 'id') {
    if (this.data === null) {
      return {
        nodes: [],
        relations: [],
      };
    }
    const { childrenKey } = this.option;
    const nodes = [];
    const relations = [];
    const stack = new Stack();
    stack.push(this.data);

    while (!stack.isEmpty()) {
      const node = stack.pop();
      const { [childrenKey]: children, ...content } = node;
      nodes.push(content);
      if (Array.isArray(children) && children.length > 0) {
        const length = children.length;
        for (let i = length - 1; i >= 0; i--) {
          stack.push(children[i]);
          relations.push({
            source: _get(node, relationKey),
            target: _get(children[i], relationKey),
          });
        }
      }
    }

    return {
      nodes,
      relations,
    };
  }

  /**
   * flatten，扁平化，也即是转为数组，所以也可以当做 toArray 方法来用
   * */
  flatten(relationKey: string = 'id', traversalType: TraversalType = 'dfs') {
    if (this.data === null) {
      return [];
    }
    const result = [];

    switch (traversalType) {
      // 深度优先
      case 'dfs':
        dfsTraverse(this.data, (item, structData) => {
          result.push({
            ...item,
            parent: _get(structData, `parent.${relationKey}`),
          });
        });
        break;
      // 广度优先
      case 'bfs':
        bfsTraverse(this.data, (item, structData) => {
          result.push({
            ...item,
            parent: _get(structData, `parent.${relationKey}`),
          });
        });
        break;
      // 默认是深度优先
      default:
        dfsTraverse(this.data, (item, structData) => {
          result.push({
            ...item,
            parent: _get(structData, `parent.${relationKey}`),
          });
        });
        break;
    }
    return result;
  }

  /**
   * 类似于数组的 forEach, 遍历每个节点，遍历方式有'深度优先'和'广度优先'两种方式
   * dfs 是深度优先，bfs 是广度优先
   * */
  forEach(callback: Processor, traversalType: TraversalType = 'dfs') {
    if (traversalType === 'bfs') {
      bfsTraverse(this.data, callback, this.option);
    } else {
      dfsTraverse(this.data, callback, this.option);
    }
  }

  /**
   * reduce，类似数组的 reduce，可以用来做迭代累计等
   * */
  reduce(callback: ReduceCallback, initialValue, traversalType: TraversalType = 'dfs') {
    let total = initialValue;
    let traverse = bfsTraverse;
    if (traversalType === 'bfs') {
      traverse = dfsTraverse;
    }
    traverse(
      this.data,
      (item, nodeStructure, vm) => {
        total = callback(total, item, nodeStructure, vm);
      },
      this.option,
    );

    return total;
  }

  // // 添加、删除、修改节点，待开发
  // splice() {}
  // // 排序，待开发
  // sort() {}
  // // 移动节点，待开发
  // moveNode() {}
}

/**
 * 森林形态，也就是多棵树的集合，待开发
 * */
class Forest {
  constructor(data: any[], option: IOptionParams) {}
}

export default MultiTree;
