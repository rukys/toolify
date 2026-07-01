// Interactive Binary Search Tree (BST) Algorithmic Utility

export interface BSTNode {
  value: number
  left: BSTNode | null
  right: BSTNode | null
}

export function insertNode(root: BSTNode | null, value: number): BSTNode {
  if (root === null) {
    return { value, left: null, right: null }
  }

  if (value < root.value) {
    root.left = insertNode(root.left, value)
  } else if (value > root.value) {
    root.right = insertNode(root.right, value)
  }

  return root
}

export function deleteNode(root: BSTNode | null, value: number): BSTNode | null {
  if (root === null) return null

  if (value < root.value) {
    root.left = deleteNode(root.left, value)
    return root
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value)
    return root
  }

  // Node found!
  // Case 1: Leaf node (no children)
  if (root.left === null && root.right === null) {
    return null
  }

  // Case 2: One child
  if (root.left === null) return root.right
  if (root.right === null) return root.left

  // Case 3: Two children (find inorder successor)
  let successorParent = root
  let successor = root.right
  while (successor.left !== null) {
    successorParent = successor
    successor = successor.left
  }

  root.value = successor.value

  if (successorParent !== root) {
    successorParent.left = successor.right
  } else {
    successorParent.right = successor.right
  }

  return root
}

export function getInorderTraversal(root: BSTNode | null): number[] {
  const result: number[] = []
  const traverse = (node: BSTNode | null) => {
    if (node === null) return
    traverse(node.left)
    result.push(node.value)
    traverse(node.right)
  }
  traverse(root)
  return result
}
