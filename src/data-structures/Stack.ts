// @ts-nocheck

/**
 * 栈
 * */
import LinkedList from './LinkedList';

export default class Stack {
  private linkedList: LinkedList;

  constructor() {
    this.linkedList = new LinkedList();
  }

  get length() {
    return this.linkedList.toArray().length;
  }

  /**
   * 判断栈是否为空，如果链表中没有头部元素，则栈为空
   */
  isEmpty() {
    return !this.linkedList.head;
  }

  /**
   * 访问顶端元素
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }

    // 返回头部元素，不删除元素
    return this.linkedList.head.value;
  }

  push(value) {
    this.linkedList.prepend(value);
  }

  pop() {
    const removeHead = this.linkedList.deleteHead();
    return removeHead ? removeHead.value : null;
  }

  toArray() {
    return this.linkedList.toArray().map(node => node.value);
  }

  clear() {
    while (!this.isEmpty()) {
      this.pop();
    }
  }
}
