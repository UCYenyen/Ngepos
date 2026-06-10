export interface BusinessAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
  shape?: 'square' | 'circle';
  tint?: string;
  className?: string;
}
