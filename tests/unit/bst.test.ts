import { describe, expect, test } from 'vitest'
import { insertNode, deleteNode, getInorderTraversal, BSTNode } from '@/lib/utils/bst-helper'

describe('Binary Search Tree (BST) Algorithmic Utility', () => {
  test('should insert nodes in correct BST order and traverse inorder', () => {
    let root: BSTNode | null = null
    
    root = insertNode(root, 50)
    root = insertNode(root, 30)
    root = insertNode(root, 70)
    root = insertNode(root, 20)
    root = insertNode(root, 40)

    // Inorder traversal should yield sorted values
    expect(getInorderTraversal(root)).toEqual([20, 30, 40, 50, 70])
  })

  test('should delete leaf nodes correctly', () => {
    let root: BSTNode | null = {
      value: 50,
      left: { value: 30, left: null, right: null },
      right: { value: 70, left: null, right: null },
    }

    root = deleteNode(root, 30)
    expect(getInorderTraversal(root)).toEqual([50, 70])
    expect(root?.left).toBeNull()
  })

  test('should delete nodes with one child correctly', () => {
    let root: BSTNode | null = {
      value: 50,
      left: {
        value: 30,
        left: { value: 20, left: null, right: null },
        right: null,
      },
      right: { value: 70, left: null, right: null },
    }

    root = deleteNode(root, 30)
    expect(getInorderTraversal(root)).toEqual([20, 50, 70])
    expect(root?.left?.value).toBe(20)
  })

  test('should delete nodes with two children correctly', () => {
    let root: BSTNode | null = {
      value: 50,
      left: {
        value: 30,
        left: { value: 20, left: null, right: null },
        right: { value: 40, left: null, right: null },
      },
      right: { value: 70, left: null, right: null },
    }

    root = deleteNode(root, 30)
    expect(getInorderTraversal(root)).toEqual([20, 40, 50, 70])
    expect(root?.left?.value).toBe(40) // inorder successor replacement
  })
})
