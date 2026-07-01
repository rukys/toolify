import { Metadata } from 'next'
import FolderDiffClient from './folder-diff-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Folder Structure Diff Checker — Directory Comparator | Toolify',
    description: 'Compare file list trees and directory structures side-by-side. Spot added, modified, or deleted files instantly offline.',
    keywords: ['folder structures diff', 'compare directories online', 'directory diff checker', 'file list comparator', 'tree structures comparison', 'git directory check'],
  }
}

export default function FolderDiffPage() {
  return <FolderDiffClient />
}
