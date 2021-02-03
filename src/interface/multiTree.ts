export interface IOption {
  childrenKey: string;        // 子树的属性名
  routeKey: string;           // 路径的属性名
  targetChildrenKey: string; // 数据转换后的子树的属性名
}

export interface IOptionParams {
  childrenKey?: string;       // 子树的属性名
  routeKey?: string;          // 路径的属性名
  targetChildrenKey?: string; // 数据转换后的子树的属性名
}

// 节点的结构化信息
export interface INodeStructure {
  depth?: number;   // 节点的深度，也可以理解为层级
  degree?: number;  // 该节点的度，也就是子节点的数量
  index?: string;   // 索引，比如 '0-2-4-55-61-3'
  route?: any[];    // 从根节点到当前节点的路径
  siblings?: any[]; // 同属一个父节点的兄弟节点们（含自身）
  children?: any[]; // 子节点
  isLeaf?: boolean; // 是否为叶子节点
}

export interface ITraverseNodeStructure extends INodeStructure {
  order?: number; // 遍历顺序
}

// 树结构的数据
export type TreeData = object | object[]

// 遍历方法的回调函数
export type Processor = (
  node: object,                       // 当前节点的信息
  structure?: ITraverseNodeStructure, // 当前节点的结构信息
  data?: TreeData                     // 树结构的数据
) => void

//
export type MapCallback = (
  node: object,                       // 当前节点的信息
  structure?: ITraverseNodeStructure, // 当前节点的结构信息
  data?: TreeData                     // 树结构的数据
) => object

export type FilterCallback = (
  node: object,               // 当前节点的信息
  structure?: INodeStructure, // 当前节点的结构信息
  data?: TreeData             // 树结构的数据
) => boolean

export type ReduceCallback = <T = any>(
  total: T,                   // 初始值, 或者计算结束后的返回值
  node: object,               // 当前节点的信息
  structure?: INodeStructure, // 当前节点的结构信息
  data?: TreeData             // 树结构的数据
) => T

export type TraversalType = 'dfs' | 'bfs' // 遍历方式

export interface IMultiTree {
  _option: IOption

  data: TreeData

  /**
   * 遍历，类似数组的 forEach，可以分为深度优先遍历和广度优先遍历两种方式
   * @param   {Function} callback 回调函数
   * @param   {String} traversalType 遍历方式，'dfs'表示深度优先，'bfs'表示广度优先
   * @return  {Object} 新的树
   */
  forEach: (callback: Processor, traversalType?: TraversalType) => void

  /**
   * 映射成一棵新的树，用法类似数组的 map 方法
   * @param   {Function} callback 回调函数
   * @return  {Object} 新的树
   * */
  map: (callback: MapCallback) => TreeData

  /**
   * 按条件筛选出符合条件的节点，返回树结构
   * 如果子节点符合条件，则其父辈节点也会包含
   * @param   {Function} callback 回调函数
   * @return  {Object} 一棵新的树
   * */
  filter: (callback: FilterCallback) => TreeData

  /**
   * 按条件筛选出符合条件的节点，返回数组，也可以当做搜索来用
   * @param   {Function} callback 回调函数
   * @return  {Array} 符合条件的节点
   * */
  pick: (callback: FilterCallback) => object[]

  /**
  * 累加器，用法类似数组的 reduce 方法
   * @param   {Function} callback 回调函数
   * @return  {any} 累加处理后新的值
  * */
  reduce: <T = any>(callback: ReduceCallback) => T

  /**
   * 转换成数组
   * @param   {string} relationKey
   * @param   {String} traversalType 遍历方式，'dfs' 表示深度优先，'bfs' 表示广度优先
   * @return  {Array} 转换后的数组
   * */
  toArray: (relationKey: string, traversalType?: TraversalType) => object[]

  /**
   * 获取结构化后的数据
   * */
  getStructuralData: () => TreeData

  // getNodesAndRelations

  // getTreeStructure
}

// 森林形态
export interface IForest extends IMultiTree {
}
