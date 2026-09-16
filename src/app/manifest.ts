import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeCircle',
    short_name: 'HomeCircle',
    description: 'Know your family\'s money. Plan your month. Save together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png',
      }
    ],
  }
}
