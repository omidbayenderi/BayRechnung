import { supabase } from '../supabase';

/**
 * DB_AGENT_PATCH: Invoice Entity Handler
 * Decoupled from the worker to allow easy scaling of new entities.
 */
export const invoiceHandler = async (event) => {
    const { operation, payload, tenant_id } = event;

    try {
        let query;

        // DB_AGENT_PATCH: Ensure tenant_id is injected into every write operation for multi-tenant safety
        const dataWithTenant = { ...payload, user_id: tenant_id }; // In this project, tenant_id is usually map to user_id (the employer)

        if (operation === 'create') {
            query = supabase.from('invoices').insert([dataWithTenant]);
        } else if (operation === 'update') {
            const { id, ...updates } = payload; // payload contains the updates
            if (!id && !payload.id) throw new Error("Missing ID for update operation");
            const targetId = id || payload.id;
            query = supabase.from('invoices').update(updates).eq('id', targetId).eq('user_id', tenant_id);
        } else if (operation === 'delete') {
            const targetId = payload.id || payload;
            if (!targetId) throw new Error("Missing ID for delete operation");
            query = supabase.from('invoices').delete().eq('id', targetId).eq('user_id', tenant_id);
        }

        if (!query) return { success: false, error: 'Invalid operation' };

        const { error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true };

    } catch (err) {
        return { success: false, error: err.message };
    }
};
