import { Metadata } from 'next'
import CropWrapper from './crop-wrapper'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Crop Image Free Online — Crop Photos & Screenshots | Toolify',
    description: 'Crop JPG, PNG, and WEBP images locally in your browser. Drag to select crop box with custom aspect ratios (1:1, 16:9, 4:3, 3:4). Zero uploads.',
    keywords: ['crop image', 'crop photos', 'crop screenshots', 'aspect ratio crop', 'free online photo cropper', 'trim images'],
  }
}

export default function ImageCropPage() {
  return <CropWrapper />
}
