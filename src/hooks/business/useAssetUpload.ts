'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

const BUCKET = 'business-assets';

export type AssetKind = 'logo' | 'qris';

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
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const path = `${businessId}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabaseClient.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' });
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
