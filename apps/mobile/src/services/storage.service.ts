import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';

export function uploadStallPhoto(
  localUri: string,
  userId: string,
): Promise<string> {
  return uploadBucketPhoto('stalls', localUri, userId);
}

async function uploadBucketPhoto(
  bucket: 'submissions' | 'stalls',
  localUri: string,
  userId: string,
): Promise<string> {
  const compressed = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1200 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  const response = await fetch(compressed.uri);
  const arrayBuffer = await response.arrayBuffer();
  const fileName = `${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function uploadSubmissionPhoto(
  localUri: string,
  userId: string,
): Promise<string> {
  return uploadBucketPhoto('submissions', localUri, userId);
}
