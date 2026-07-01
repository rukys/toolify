// Folder Structure Comparison Utility

export interface DiffNode {
  name: string
  path: string
  isDir: boolean
  status: 'added' | 'deleted' | 'unchanged'
  children: Record<string, DiffNode>
}

// Convert a list of paths (flat string array) into a unified comparative tree
export function compareFolderStructures(listA: string[], listB: string[]): DiffNode {
  const setA = new Set(listA.map((p) => p.trim()).filter(Boolean))
  const setB = new Set(listB.map((p) => p.trim()).filter(Boolean))

  const root: DiffNode = {
    name: 'root',
    path: '',
    isDir: true,
    status: 'unchanged',
    children: {},
  }

  // Helper to add nodes to the tree
  const addNode = (filePath: string, status: 'added' | 'deleted' | 'unchanged') => {
    const parts = filePath.split('/')
    let current = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const pathSoFar = parts.slice(0, index + 1).join('/')

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: pathSoFar,
          isDir: !isLast,
          status,
          children: {},
        }
      } else {
        // If status differs, set appropriately
        // If one is deleted and another added under same path (rare but possible), unchanged is fallback
        if (current.children[part].status !== status) {
          current.children[part].status = 'unchanged'
        }
      }
      current = current.children[part]
    })
  }

  // Populate from Set A (if not in B, it was deleted in B)
  setA.forEach((filePath) => {
    if (!setB.has(filePath)) {
      addNode(filePath, 'deleted')
    } else {
      addNode(filePath, 'unchanged')
    }
  })

  // Populate from Set B (if not in A, it was added in B)
  setB.forEach((filePath) => {
    if (!setA.has(filePath)) {
      addNode(filePath, 'added')
    }
  })

  return root
}
