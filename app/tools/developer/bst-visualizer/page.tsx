import { Metadata } from 'next'
import BSTVisualizerClient from './bst-visualizer-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Binary Search Tree (BST) Interactive Visualizer | Toolify',
    description: 'Animate and visualize Binary Search Tree (BST) operations (insert, search, delete) in real-time. Great educational tool for algorithm developers.',
    keywords: ['binary search tree visualizer', 'bst animation online', 'data structures learning tool', 'bst node insertion simulator', 'binary tree diagram generator'],
  }
}

export default function BSTVisualizerPage() {
  return <BSTVisualizerClient />
}
