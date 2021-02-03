import {
  IMultiTree, IOption, TreeData, Processor, TraversalType, IOptionParams,
  MapCallback, FilterCallback
} from '@/interface/multiTree'
import { mergeOption, bfsTraverse, dfsTraverse, getRootNodeStructure, getNextLevelNodeStructure } from './util'
import Queue from '@/data-structures/Queue';
import _get from 'lodash/get';

export default class MultiTree implements IMultiTree {
  // 配置项
  private readonly _option: IOption;
  // 树结构的原始数据
  private readonly data: TreeData;

  constructor(data: TreeData, option?: IOptionParams) {
    this.data = data
    this._option = mergeOption(option)
  }

  forEach(callback: Processor, traversalType: TraversalType = 'dfs'): void {
    if (traversalType === 'bfs') {
      bfsTraverse(this.data, callback, this._option)
    } else {
      dfsTraverse(this.data, callback, this._option)
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
      if (parent) {
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

  // filter(callback: FilterCallback): TreeData {
  //   return undefined;
  // }

  // getStructuralData(): TreeData {
  //   return undefined;
  // }

  // reduce<T>(callback: ReduceCallback): T {
  //   return undefined;
  // }

  // toArray(relationKey: string, traversalType: TraversalType): object[] {
  //   return [];
  // }
}
