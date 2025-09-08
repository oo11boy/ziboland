export interface MenuItem {
  id: number;
  name: string;
  link: string;
  mothercat: boolean;
  icon: string;
  subcat: {
    id: number;
    name: string;
    items: { id: number; name: string }[];
  }[];
}


export interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  alt: string;
}
