import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { syncService } from '../lib/SyncService';

const AppointmentContext = createContext();

export const useAppointments = () => useContext(AppointmentContext);

export const AppointmentProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Business settings (can be moved to database later if needed, keeping simple for now)
    const [settings, setSettings] = useState({
        workingHours: { start: '09:00', end: '18:00' },
        workingHoursWeekend: { start: '10:00', end: '16:00' },
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        slotDuration: 30, // minutes
        bufferTime: 5, // minutes between appointments
        holidays: [], // array of ISO date strings 'YYYY-MM-DD'
        breaks: { start: '13:00', end: '14:00', enabled: false },
        dailyHours: {
            Mon: { start: '09:00', end: '18:00' },
            Tue: { start: '09:00', end: '18:00' },
            Wed: { start: '09:00', end: '18:00' },
            Thu: { start: '09:00', end: '18:00' },
            Fri: { start: '09:00', end: '18:00' },
            Sat: { start: '10:00', end: '16:00' },
            Sun: { start: '10:00', end: '16:00' }
        }
    });

    // Initial Fetch from Supabase
    useEffect(() => {
        const loadAppointmentData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                // 0. Load from LocalStorage first for INSTANT UI
                const localServices = localStorage.getItem(`bay_services_${currentUser.id}`);
                const localStaff = localStorage.getItem(`bay_staff_${currentUser.id}`);
                const localAppts = localStorage.getItem(`bay_appointments_${currentUser.id}`);
                const localSettings = localStorage.getItem(`bay_appointment_settings_${currentUser.id}`);

                if (localServices) setServices(JSON.parse(localServices));
                if (localStaff) setStaff(JSON.parse(localStaff));
                if (localAppts) setAppointments(JSON.parse(localAppts));
                if (localSettings) setSettings(JSON.parse(localSettings));

                // CRITICAL: Set loading to false as soon as local cache is ready.
                setLoading(false);

                // 1. If it's a mock user (demo), STOP HERE. 
                // DB sync will fail anyway due to foreign key constraints.
                if (currentUser.authMode === 'mock' || currentUser.id.startsWith('0000')) {
                    console.log('[Appointment] Mock session detected, skipping Supabase sync');
                    setLoading(false);
                    return;
                }

                // 1.5. WAIT for full profile to avoid RLS race conditions
                if (currentUser.isSkeleton) {
                    console.log('[Appointment] Skeleton user detected, waiting for full profile...');
                    return;
                }

                // 2. Fetch from Supabase for real cloud users
                const [servicesRes, staffRes, apptRes, settingsRes] = await Promise.all([
                    supabase.from('services').select('*').eq('user_id', currentUser.id),
                    supabase.from('staff').select('*').eq('user_id', currentUser.id),
                    supabase.from('appointments').select('*').eq('user_id', currentUser.id),
                    supabase.from('appointment_settings').select('*').eq('user_id', currentUser.id).maybeSingle()
                ]);

                // Helper: Merge remote data with local offline changes
                const mergeWithLocalQueue = (remoteData, tableName, normalizer = (x) => x) => {
                    const syncQueue = (syncService.queue || JSON.parse(localStorage.getItem('bay_sync_queue') || '[]'))
                        .filter(q => q.table === tableName);

                    const safeRemote = remoteData || [];
                    let merged = [...safeRemote];

                    // 1. Apply Deletes
                    const deleteIds = syncQueue.filter(q => q.action === 'delete').map(q => String(q.targetId));
                    merged = merged.filter(item => !deleteIds.includes(String(item.id)));

                    // 2. Apply Updates
                    const updates = syncQueue.filter(q => q.action === 'update');
                    updates.forEach(u => {
                        const index = merged.findIndex(item => String(item.id) === String(u.targetId));
                        if (index > -1) {
                            merged[index] = { ...merged[index], ...u.data };
                        }
                    });

                    // 3. Apply Inserts
                    const inserts = syncQueue.filter(q => q.action === 'insert').map(q => q.data);
                    inserts.forEach(ins => {
                        const existsById = merged.find(m => String(m.id) === String(ins.id));
                        if (!existsById) {
                            merged.unshift(ins);
                        }
                    });

                    // 4. PROPAGATION LAG PROTECTION:
                    // If local storage has items that are neither in DB nor in sync queue, 
                    // they might be recently synced items that haven't propagated to the read-replica yet.
                    const localItemsStr = localStorage.getItem(`bay_${tableName}_${currentUser.id}`);
                    if (localItemsStr) {
                        try {
                            const localItems = JSON.parse(localItemsStr);
                            localItems.forEach(localItem => {
                                const idx = merged.findIndex(m => String(m.id) === String(localItem.id));
                                const isDeleted = syncQueue.find(q => q.action === 'delete' && String(q.targetId) === String(localItem.id));
                                if (idx === -1 && !isDeleted) {
                                    // Missing from remote, restore from local (lag protection)
                                    if (localItem.id && String(localItem.id).length > 5) {
                                        merged.push(localItem);
                                    }
                                } else if (idx !== -1 && !isDeleted) {
                                    // Item exists, but local might have newer details (e.g. status)
                                    // For staff, we usually trust DB unless queue is not empty
                                    // For appointments, status reversion is a common issue
                                    if (tableName === 'appointments' && localItem.status !== merged[idx].status) {
                                        const hasPendingUpdate = syncQueue.find(q => q.action === 'update' && String(q.targetId) === String(localItem.id));
                                        if (!hasPendingUpdate) {
                                            merged[idx] = { ...merged[idx], status: localItem.status };
                                        }
                                    }
                                }
                            });
                        } catch (e) {
                            console.warn("Failed to parse local storage in merge", e);
                        }
                    }

                    return merged.map(normalizer);
                };

                // Helper: Merge single object with local offline changes (for settings)
                const mergeSettingsWithLocalQueue = (remoteData, tableName) => {
                    // Try to load current local state for mapping fallback
                    const localItemsStr = localStorage.getItem(`bay_${tableName}_${currentUser.id}`);
                    let localObj = null;
                    try {
                        if (localItemsStr) localObj = JSON.parse(localItemsStr);
                    } catch (e) { }

                    // Merge remote row with local object (for fields that might be missing in DB but in LS)
                    // Then prioritize pending sync queue
                    let merged = remoteData ? { ...(localObj || {}), ...remoteData } : (localObj || null);

                    const queue = (syncService.queue || JSON.parse(localStorage.getItem('bay_sync_queue') || '[]'))
                        .filter(q => q.table === tableName && q.action === 'update');

                    // Apply the most recent pending update from the queue
                    if (queue.length > 0) {
                        const latestUpdate = queue[queue.length - 1];
                        merged = { ...(merged || {}), ...latestUpdate.data };
                    }

                    // PROPAGATION LAG PROTECTION (Specific for settings)
                    // If localObj has values different from merged (remote), and no pending queue,
                    // keep local if it looks "newer" or more complete.
                    if (localObj && !queue.length && remoteData) {
                        // Heuristic: If localObj has a schedule and remote doesn't, or if remote is defaults
                        const remoteIsDefault = remoteData.working_hours_start === '09:00' && remoteData.working_hours_end === '18:00';
                        const localIsDifferent = localObj.workingHours?.start !== remoteData.working_hours_start;
                        if (localIsDifferent && remoteIsDefault) {
                            // This might be a fresh DB row over-writing a rich local state
                            merged = { ...remoteData, ...localObj };
                        }
                    }

                    return merged;
                };

                // Merge with pending sync queue
                const syncQueue = JSON.parse(localStorage.getItem('bay_sync_queue') || '[]');

                // 1. Services
                if (servicesRes.data || (localServices && !servicesRes.error)) {
                    const normalizeService = (s) => ({ ...s });
                    setServices(mergeWithLocalQueue(servicesRes.data, 'services', normalizeService));
                }

                // 2. Staff
                if (staffRes.data || (localStaff && !staffRes.error)) {
                    const normalizeStaff = (s) => ({
                        ...s,
                        name: s.full_name || s.name // Map DB full_name to UI name
                    });
                    setStaff(mergeWithLocalQueue(staffRes.data, 'staff', normalizeStaff));
                }

                // 3. Appointments
                if (apptRes.data || (localAppts && !apptRes.error)) {
                    const normalizeAppt = (a) => {
                        const startTimeStr = a.start_time || new Date().toISOString();
                        return {
                            id: a.id,
                            user_id: a.user_id,
                            date: startTimeStr.split('T')[0],
                            time: startTimeStr.includes('T') ? startTimeStr.split('T')[1].substring(0, 5) : '00:00',
                            customerName: a.customer_name,
                            customerPhone: a.customer_phone || '',
                            serviceId: a.service_id,
                            staffId: a.staff_id,
                            status: a.status,
                            paymentStatus: a.payment_status,
                            amount: a.amount,
                            notes: a.notes,
                            type: a.type || 'appointment',
                            startTime: a.start_time,
                            endTime: a.end_time
                        };
                    };
                    setAppointments(mergeWithLocalQueue(apptRes.data, 'appointments', normalizeAppt));
                }

                // 4. Settings
                const mergedSettingsData = mergeSettingsWithLocalQueue(settingsRes.data, 'appointment_settings');
                if (mergedSettingsData) {
                    setSettings(prev => ({
                        ...prev,
                        workingHours: {
                            start: mergedSettingsData.working_hours_start || mergedSettingsData.workingHours?.start || prev.workingHours.start,
                            end: mergedSettingsData.working_hours_end || mergedSettingsData.workingHours?.end || prev.workingHours.end
                        },
                        workingHoursWeekend: {
                            start: mergedSettingsData.breaks?.schedule?.Sat?.start || mergedSettingsData.workingHoursWeekend?.start || prev.workingHoursWeekend.start,
                            end: mergedSettingsData.breaks?.schedule?.Sat?.end || mergedSettingsData.workingHoursWeekend?.end || prev.workingHoursWeekend.end
                        },
                        workingDays: mergedSettingsData.working_days || mergedSettingsData.workingDays || prev.workingDays,
                        slotDuration: mergedSettingsData.slot_duration || mergedSettingsData.slotDuration || prev.slotDuration,
                        bufferTime: mergedSettingsData.buffer_time || mergedSettingsData.bufferTime || prev.bufferTime,
                        holidays: mergedSettingsData.holidays || prev.holidays,
                        breaks: mergedSettingsData.breaks || prev.breaks,
                        dailyHours: mergedSettingsData.breaks?.schedule || mergedSettingsData.dailyHours || prev.dailyHours
                    }));
                }
            } catch (err) {
                console.error('Error loading appointment data, using local fallback:', err);
            } finally {
                // setLoading(false); // Already false
            }
        };

        loadAppointmentData();

        // 4. REAL-TIME: Listen for all data changes while owner is online
        if (currentUser?.id && currentUser.authMode !== 'mock') {
            const channel = supabase
                .channel('appointment_module_realtime')
                // 1. Appointments
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'appointments', filter: `user_id=eq.${currentUser.id}` },
                    (payload) => {
                        const newAppt = normalizeAppt(payload.new);
                        setAppointments(prev => {
                            if (prev.find(a => String(a.id) === String(newAppt.id))) return prev;
                            return [...prev, newAppt];
                        });
                    }
                )
                // 2. Services
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${currentUser.id}` },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setServices(prev => {
                                if (prev.find(s => String(s.id) === String(payload.new.id))) return prev;
                                return [...prev, payload.new];
                            });
                        } else if (payload.eventType === 'UPDATE') {
                            setServices(prev => prev.map(s => String(s.id) === String(payload.new.id) ? payload.new : s));
                        } else if (payload.eventType === 'DELETE') {
                            setServices(prev => prev.filter(s => String(s.id) !== String(payload.old.id)));
                        }
                    }
                )
                // 3. Staff
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'staff', filter: `user_id=eq.${currentUser.id}` },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setStaff(prev => {
                                if (prev.find(s => String(s.id) === String(payload.new.id))) return prev;
                                return [...prev, payload.new];
                            });
                        } else if (payload.eventType === 'UPDATE') {
                            setStaff(prev => prev.map(s => String(s.id) === String(payload.new.id) ? payload.new : s));
                        } else if (payload.eventType === 'DELETE') {
                            setStaff(prev => prev.filter(s => String(s.id) !== String(payload.old.id)));
                        }
                    }
                )
                // 4. Settings
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'appointment_settings', filter: `user_id=eq.${currentUser.id}` },
                    (payload) => {
                        const s = payload.new;
                        setSettings(prev => {
                            const newDailyHours = s.breaks?.schedule || s.dailyHours || prev.dailyHours;
                            return {
                                ...prev,
                                workingHours: {
                                    start: s.working_hours_start || newDailyHours?.Mon?.start || prev.workingHours.start,
                                    end: s.working_hours_end || newDailyHours?.Mon?.end || prev.workingHours.end
                                },
                                workingHoursWeekend: {
                                    start: newDailyHours?.Sat?.start || prev.workingHoursWeekend.start,
                                    end: newDailyHours?.Sat?.end || prev.workingHoursWeekend.end
                                },
                                workingDays: s.working_days || prev.workingDays,
                                slotDuration: s.slot_duration || prev.slotDuration,
                                bufferTime: s.buffer_time || prev.bufferTime,
                                holidays: s.holidays || prev.holidays,
                                breaks: s.breaks || prev.breaks,
                                dailyHours: newDailyHours
                            };
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentUser?.id, currentUser?.isSkeleton]);

    // Check if user has premium plan
    const isPremium = () => {
        // Allow if user is premium, or company is premium
        return currentUser?.plan === 'premium' || companyProfile?.plan === 'premium';
    };

    // LocalStorage Sync for Public Preview
    useEffect(() => {
        if (currentUser?.id && !loading) {
            // Safety: Don't overwrite with empty state if we just loaded or if state is suspicious
            // However, legitimately empty lists are possible. 
            // We only block if BOTH remote and local loads are in progress.
            const hasData = services.length > 0 || appointments.length > 0 || staff.length > 0 || settings.workingDays?.length > 0;

            // If completely empty, we check if it was previously populated in this session
            // to avoid resetting on temporary rendering blips or loading states.
            const localRaw = localStorage.getItem(`bay_appointment_settings_${currentUser.id}`);
            if (!hasData && localRaw && localRaw.length > 20) {
                // Suspiciously empty state while LS has data - skip overwrite
                return;
            }

            localStorage.setItem(`bay_services_${currentUser.id}`, JSON.stringify(services));
            localStorage.setItem(`bay_appointment_settings_${currentUser.id}`, JSON.stringify(settings));
            localStorage.setItem(`bay_appointments_${currentUser.id}`, JSON.stringify(appointments));
            localStorage.setItem(`bay_staff_${currentUser.id}`, JSON.stringify(staff));
        }
    }, [services, settings, appointments, staff, currentUser?.id, loading]);

    // Actions
    const addAppointment = async (appt, targetUserId = null) => {
        const userId = targetUserId || currentUser?.id;
        if (!userId) return null;

        const service = services.find(s => s.id === appt.serviceId);
        const duration = service?.duration || 30;

        const startISO = `${appt.date}T${appt.time}:00Z`;
        const endISO = new Date(new Date(startISO).getTime() + duration * 60000).toISOString();

        const id = uuidv4();
        const newAppt = {
            id,
            user_id: userId,
            customer_name: appt.customerName,
            customer_email: appt.customerEmail,
            customer_phone: appt.customerPhone,
            service_id: appt.serviceId,
            staff_id: appt.staffId,
            start_time: startISO,
            end_time: endISO,
            status: appt.status || 'confirmed',
            notes: appt.notes
        };

        const mapped = {
            ...appt,
            id,
            startTime: startISO,
            endTime: endISO
        };

        // If it's the current user (admin), update state and use syncService
        if (currentUser?.id === userId) {
            setAppointments(prev => [...prev, mapped]);
            syncService.enqueue('appointments', 'insert', newAppt);
        } else {
            // Public booking: Direct insert to Supabase
            try {
                const { error } = await supabase.from('appointments').insert(newAppt);
                if (error) throw error;
            } catch (err) {
                console.error('Error creating public booking:', err);
                return null;
            }
        }

        return mapped;
    };

    const addBlock = async (date, time, duration, notes) => {
        if (!currentUser?.id) return null;

        const startISO = `${date}T${time}:00Z`;
        const endISO = new Date(new Date(startISO).getTime() + duration * 60000).toISOString();

        const id = uuidv4();
        const newBlock = {
            id,
            user_id: currentUser.id,
            start_time: startISO,
            end_time: endISO,
            status: 'confirmed',
            notes: notes,
            customer_name: 'System Block'
        };

        const mapped = {
            id,
            date,
            time,
            notes,
            type: 'block'
        };

        setAppointments(prev => [...prev, mapped]);
        syncService.enqueue('appointments', 'insert', newBlock);
        return mapped;
    };

    const updateAppointment = async (id, updates) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

        const dbUpdates = {};
        if (updates.customerName) dbUpdates.customer_name = updates.customerName;
        if (updates.customerEmail) dbUpdates.customer_email = updates.customerEmail;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.date && updates.time) {
            dbUpdates.start_time = `${updates.date}T${updates.time}:00Z`;
        }

        // Action-based feedback (EMAIL SIMULATION)
        if (updates.status) {
            const appt = appointments.find(a => a.id === id);
            if (appt?.customerEmail) {
                console.log(`[EMAIL SIM] Sending status update to ${appt.customerEmail}: Your appointment is node ${updates.status}`);
            }
        }

        syncService.enqueue('appointments', 'update', dbUpdates, id);
    };

    const deleteAppointment = async (id) => {
        setAppointments(prev => prev.filter(a => a.id !== id));
        syncService.enqueue('appointments', 'delete', null, id);
    };

    const addService = async (service) => {
        if (!currentUser?.id) return;

        const id = service.id || uuidv4();
        const dbService = {
            id,
            user_id: currentUser.id,
            name: service.name,
            description: service.description,
            price: parseFloat(service.price) || 0,
            duration: parseInt(service.duration) || 30,
            color: service.color || '#3b82f6'
        };

        // Optimistic UI update
        setServices(prev => [...prev, dbService]);

        // Enqueue immediately for robust persistence
        syncService.enqueue('services', 'insert', dbService);
        return dbService;
    };

    const deleteService = async (id) => {
        setServices(prev => prev.filter(s => s.id !== id));
        syncService.enqueue('services', 'delete', null, id);
    };

    const updateService = async (updatedService) => {
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
        syncService.enqueue('services', 'update', updatedService, updatedService.id);
    };

    const addStaff = async (member) => {
        if (!currentUser?.id) return;
        const id = member.id || uuidv4();
        const dbMember = {
            id,
            user_id: currentUser.id,
            full_name: member.name, // Use database column name
            role: member.role,
            color: member.color || '#3b82f6'
        };

        // Optimistic update
        setStaff(prev => [...prev, {
            ...dbMember,
            name: member.name // Ensure UI-friendly 'name' field is present
        }]);

        syncService.enqueue('staff', 'insert', dbMember);
        return dbMember;
    };

    const deleteStaff = async (id) => {
        setStaff(prev => prev.filter(s => s.id !== id));
        syncService.enqueue('staff', 'delete', null, id);
    };

    const updateSettings = async (newSettings) => {
        const mergedSettings = { ...settings, ...newSettings };
        setSettings(mergedSettings);

        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                working_hours_start: mergedSettings.workingHours?.start,
                working_hours_end: mergedSettings.workingHours?.end,
                working_days: mergedSettings.workingDays,
                slot_duration: mergedSettings.slotDuration,
                buffer_time: mergedSettings.bufferTime,
                holidays: mergedSettings.holidays,
                // Embed daily schedule into breaks JSON object for persistence
                // This covers weekends and individual day overrides
                breaks: {
                    ...mergedSettings.breaks,
                    schedule: mergedSettings.dailyHours
                }
            };
            syncService.enqueue('appointment_settings', 'update', dbData);
        }
    };

    const getService = (id) => services.find(s => s.id === id);
    const getStaff = (id) => staff.find(s => s.id === id);

    const createPublicBooking = async (bookingDetails, targetUserId = null) => {
        const result = await addAppointment({
            ...bookingDetails,
            status: 'pending' // Online bookings start as pending
        }, targetUserId);
        return result;
    };

    const appointmentValue = useMemo(() => ({
        appointments,
        services,
        staff,
        settings,
        loading,
        addAppointment,
        addBlock,
        updateAppointment,
        deleteAppointment,
        addService,
        deleteService,
        updateService,
        addStaff,
        deleteStaff,
        getService,
        getStaff,
        updateSettings,
        createPublicBooking,
        syncStatus: syncService.getStatus()
    }), [appointments, services, staff, settings, loading]);

    return (
        <AppointmentContext.Provider value={appointmentValue}>
            {children}
        </AppointmentContext.Provider>
    );
};
