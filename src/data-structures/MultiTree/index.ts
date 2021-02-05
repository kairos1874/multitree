
import {
  IMultiTree, IOption, TreeData, Processor, TraversalType, IOptionParams,
  MapCallback, FilterCallback, ReduceCallback, IGetRouteBetweenTwoNodeOption
} from '@/interface/multiTree'
import { mergeOption, bfsTraverse, dfsTraverse, getRootNodeStructure, getNextLevelNodeStructure } from './util'
import Stack from '../../data-structures/Stack'

export default class MultiTree implements IMultiTree {
  // 配置项
  private readonly _option: IOption;
  // 树结构的原始数据
  private data: TreeData;

  constructor(data: TreeData, option?: IOptionParams) {
    this.data = data
    this._option = mergeOption(option)
  }

  forEach(callback: Processor, traversalType: TraversalType = 'dfs', option?: IOptionParams): void {
    const newOption = {
      ...this._option,
      ...option
    }
    if (traversalType === 'bfs') {
      bfsTraverse(this.data, callback, newOption)
    } else {
      dfsTraverse(this.data, callback, newOption)
    }
  }

  map(callback: MapCallback, option?: IOptionParams): TreeData {
    if (this.data === null) {
      return null
    }

    const newOption = {
      ...this._option,
      ...option
    }
    const vm = this
    const { childrenKey, targetChildrenKey } = newOption

    function recursion(data: object) {
      const { [childrenKey]: children, _structure, ...content } = data
      const target = callback(
        content,
        {
          ..._structure,
        },
        vm.data,
      )
      if (Array.isArray(children) && children.length > 0) {
        target[targetChildrenKey] = [];
        for (let i = 0; i < children.length; i++) {
          target[targetChildrenKey].push(
            recursion({
              ...children[i],
              _structure: getNextLevelNodeStructure(data, newOption, i),
            }),
          );
        }
      }
      return target;
    }

    if (Array.isArray(this.data)) {
      return this.data.map((item, index) => {
        return recursion({
          ...item,
          _structure: getRootNodeStructure(item, newOption, index),
        })
      })
    }

    return recursion({
      ...this.data,
      _structure: getRootNodeStructure(this.data, newOption, 0),
    })
  }

  pick(callback: FilterCallback, option?: IOptionParams): object[] {
    const result = []
    this.forEach((item, structure, vm) => {
      if (callback(item, structure, vm)) {
        result.push(item)
      }
    }, 'bfs', option)
    return result
  }

  toArray(relationKey: string = 'id', traversalType?: TraversalType): object[] {
    const result = []
    this.forEach((item, structure, vm) => {
      const { parent } = structure
      let parentNode = null
      if ('parent' in structure && parent) {
        const { parent: { [relationKey]: tempParentNode } } = structure
        parentNode = tempParentNode
      }

      result.push({
        ...item,
        parent: parentNode
      });
    }, traversalType)

    return result
  }

  reduce<T>(callback: ReduceCallback, initialValue: T, traversalType: TraversalType = 'dfs', option?: IOptionParams): T {
    let total = initialValue
    const newOption = {
      ...this._option,
      ...option
    }

    this.forEach((item, structure, vm) => {
      total = callback(total, item, structure, vm)
    }, traversalType, newOption)

    return total
  }

  /**
   * filter 方法，用递归实现，返回树结构
   * */
  filter(callback: FilterCallback, option?: IOptionParams) {
    const vm = this
    if (this.data === null) {
      return null
    }
    const newOption = {
      ...this._option,
      ...option
    }
    const { childrenKey, targetChildrenKey } = newOption

    function recursion(data: object) {
      const { [childrenKey]: children, _structure, ...content } = data;
      if (Array.isArray(children) && children.length > 0) {
        const shortlisted: any[] = children
          .map((item, subIndex) => {
            return recursion({
              ...item,
              _structure: getNextLevelNodeStructure(data, newOption, subIndex),
            })
          })
          .filter(ele => ele !== null)

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
              ..._structure,
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
              ..._structure,
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

    if (Array.isArray(this.data)) {
      return this.data.map((item, index) => {
        return recursion({
          ...item,
          _structure: getRootNodeStructure(item, newOption, index),
        })
      }).filter(ele => ele !== null)
    }

    return recursion({
      ...this.data,
      _structure: getRootNodeStructure(this.data, newOption, 0),
    })
  }

  /**
   * 找出两个节点之间的路径
   * */
  getRouteBetweenTwoNode(startNode: any, endNode: any, option: IGetRouteBetweenTwoNodeOption = {
    matchKey: 'id',
    routeKey: 'id'
  }) {
    const { matchKey, routeKey } = option
    let matched = [false, false]
    let matchedNodes = []
    this.forEach((item, structure, vm) => {
      const { [matchKey]: targetField } = item
      if (targetField === startNode && (!matched[0])) {
        matched[0] = true
        matchedNodes.unshift({
          ...item,
          route: structure?.route
        })
      }
      if (targetField === endNode && (!matched[1])) {
        matched[1] = true
        matchedNodes.push({
          ...item,
          route: structure?.route
        })
      }
      if (matchedNodes.length >= 2) {
        return
      }
    }, 'bfs', {
      routeKey,
    })

    if (matchedNodes.length === 2) {
      const startRoute = [...matchedNodes[0].route]
      const endRoute = [...matchedNodes[1].route]
      let result = []
      let tempIndex = -1

      while (startRoute.length > 0) {
        const cur = startRoute.pop()
        tempIndex = endRoute.indexOf(cur)

        if (tempIndex < 0) {
          result.push(cur)
        } else {
          break
        }
      }
      if (tempIndex > -1) {
        result = result.concat(endRoute.slice(tempIndex))
      } else {
        result = []
      }
      return result
    } else {
      return []
    }
  }

  /**
   * 获取所有的 节点 和 节点之间的连线关系，可以用在绘图等方面，使用深度优先遍历
   * */
  getNodesAndRelations(relationKey: string = 'id') {
    if (this.data === null) {
      return {
        nodes: [],
        relations: [],
      }
    }
    const { childrenKey } = this._option
    const nodes = []
    const relations = []
    const stack = new Stack()

    if (Array.isArray(this.data)) {
      for (let i = this.data.length - 1; i >= 0; i--) {
        stack.push(this.data[i])
      }
    } else {
      stack.push(this.data)
    }

    while (!stack.isEmpty()) {
      const node = stack.pop()
      const { [childrenKey]: children, ...content } = node
      nodes.push(content)
      if (Array.isArray(children) && children.length > 0) {
        const length = children.length
        for (let i = length - 1; i >= 0; i--) {
          stack.push(children[i])
          const { [relationKey]: parentAttr } = node
          const { [relationKey]: childAttr } = children[i]
          relations.push({
            parent: parentAttr,
            child: childAttr,
          })
        }
      }
    }

    return {
      nodes,
      relations,
    }
  }

  // addNode(parent: any, node, matchKey: string = 'id') {
  //   if (parent === null) {
  //     if (Array.isArray(this.data)) {
  //       this.data = this.data.concat(node)
  //     } else {
  //       this.data = [this.data].concat(node)
  //     }
  //   } else {
  //
  //   }
  // }
}
