'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

const BUCKET = 'business-assets';
const WEBP_QUALITY = 0.85;

export type AssetKind = 'logo' | 'qris' | 'product';

async function toWebp(file: File): Promise<File> {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', WEBP_QUALITY);
    });
    if (!blob) return file;
    return new File([blob], 'image.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

interface UseAssetUploadResult {
  uploading: boolean;
  upload: (
    file: File,
    businessId: string,
    kind: AssetKind
  ) => Promise<string | null>;
}

export function useAssetUpload(): UseAssetUploadResult {
  const [uploading, setUploading] = useState(false);

  async function upload(
    file: File,
    businessId: string,
    kind: AssetKind
  ): Promise<string | null> {
    setUploading(true);
    try {
      const webpFile = await toWebp(file);
      const ext =
        webpFile.type === 'image/webp'
          ? 'webp'
          : file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const path = `${businessId}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabaseClient.storage
        .from(BUCKET)
        .upload(path, webpFile, {
          upsert: true,
          cacheControl: '3600',
          contentType: webpFile.type,
        });
      if (error) throw error;
      const { data } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, upload };
}
