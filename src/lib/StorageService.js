import { supabase } from './supabase';

/**
 * StorageService handles file uploads to Supabase buckets.
 * Buckets expected: 'avatars', 'logos', 'products', 'attachments'
 */
class StorageService {
    /**
     * Upload a file to a specific bucket
     * @param {string} bucket - Bucket name
     * @param {string} path - Remote path (e.g. "userId/avatar.png")
     * @param {File|Blob} file - File object
     */
    async uploadFile(bucket, path, file) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { success: true, url: publicUrl, path: data.path };
        } catch (err) {
            console.error(`[StorageService] Upload failed for ${bucket}/${path}:`, err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Delete a file from a bucket
     */
    async deleteFile(bucket, path) {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error(`[StorageService] Delete failed for ${bucket}/${path}:`, err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Specialized helper for user avatars
     */
    async uploadAvatar(userId, file) {
        const fileExt = file.name.split('.').pop();
        const path = `${userId}/avatar-${Date.now()}.${fileExt}`;
        return this.uploadFile('avatars', path, file);
    }

    /**
     * Specialized helper for company logos
     */
    async uploadLogo(userId, file) {
        const fileExt = file.name.split('.').pop();
        const path = `${userId}/logo-${Date.now()}.${fileExt}`;
        return this.uploadFile('logos', path, file);
    }
}

export const storageService = new StorageService();
