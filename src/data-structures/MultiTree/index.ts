
import {
  IMultiTree, IOption, TreeData, Processor, TraversalType, IOptionParams,
  MapCallback, FilterCallback, ReduceCallback, IGetRouteBetweenTwoNodeOption
} from '@/interface/multiTree'
import { mergeOption, bfsTraverse, dfsTraverse, getRootNodeStructure, getNextLevelNodeStructure } from './util'

export default class MultiTree implements IMultiTree {
  // 配置项
  private readonly _option: IOption;
  // 树结构的原始数据
  private readonly data: TreeData;

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

  pick(callback: FilterCallback): object[] {
    const result = []
    this.forEach((item, structure, vm) => {
      if (callback(item, structure, vm)) {
        result.push(item)
      }
    })
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

  reduce<T>(callback: ReduceCallback, initialValue: T, traversalType: TraversalType = 'dfs'): T {
    let total = initialValue
    let traverse = bfsTraverse
    if (traversalType === 'bfs') {
      traverse = dfsTraverse
    }
    traverse(
      this.data,
      (item, nodeStructure, vm) => {
        total = callback(total, item, nodeStructure, vm);
      },
      this._option,
    );

    return total
  }

  /**
   * 找出两个节点之间的路径
   * */
  getRouteBetweenTwoNode(startNode: any, endNode: any, option?: IGetRouteBetweenTwoNodeOption) {
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
      result = result.concat(endRoute.slice(tempIndex))
      return result
    } else {
      return []
    }
  }

  // shake 用这个代替 filter

  // filter(callback: FilterCallback): TreeData {
  //   return undefined;
  // }

  // getStructuralData(): TreeData {
  //   return undefined;
  // }

  // getTreeInfo
  // return depth degree
  // 获取二维平面的矩阵
}
