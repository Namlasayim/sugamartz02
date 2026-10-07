export type PaintingStatus = 'available' | 'sold' | 'featured' | 'murals'

export interface Settings {
  id: 1
  artist_name: string | null
  hero_tagline: string | null
  about_text: string | null
  profile_photo_url: string | null
  website_icon_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  whatsapp_number: string | null
  tiktok_url: string | null
  contact_email: string | null
}

export interface Painting {
  id: number
  title: string
  image_url: string | null
  price: number | null
  medium: string | null
  size: string | null
  description: string | null
  status: PaintingStatus
  display_order: number
  created_at: string
}
