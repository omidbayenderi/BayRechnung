import { supabase } from '../supabase';

/**
 * DB_AGENT_PATCH: Booking Entity Handler
 */
export const bookingHandler = async (event) => {
    const { operation, payload, tenant_id } = event;

    try {
        let query;
        const dataWithTenant = { ...payload, user_id: tenant_id };

        if (operation === 'create') {
            query = supabase.from('appointments').insert([dataWithTenant]);
        } else if (operation === 'update') {
            const { id, ...updates } = payload;
            const targetId = id || payload.id;
            if (!targetId) throw new Error("Missing ID for update operation");
            query = supabase.from('appointments').update(updates).eq('id', targetId).eq('user_id', tenant_id);
        } else if (operation === 'delete') {
            const targetId = payload.id || payload;
            if (!targetId) throw new Error("Missing ID for delete operation");
            query = supabase.from('appointments').delete().eq('id', targetId).eq('user_id', tenant_id);
        }

        if (!query) return { success: false, error: 'Invalid operation' };

        const { error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true };

    } catch (err) {
        return { success: false, error: err.message };
    }
};
