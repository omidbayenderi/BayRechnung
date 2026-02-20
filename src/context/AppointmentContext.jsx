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
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        slotDuration: 30, // minutes
        bufferTime: 5, // minutes between appointments
        holidays: [], // array of ISO date strings 'YYYY-MM-DD'
        breaks: { start: '13:00', end: '14:00', enabled: false }
    });

    // Initial Fetch from Supabase
    useEffect(() => {
        const loadAppointmentData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                // Fetch services
                const { data: servicesData, error: sErr } = await supabase.from('services').select('*').eq('user_id', currentUser.id);
                if (!sErr && servicesData && servicesData.length > 0) {
                    setServices(servicesData);
                } else if (!sErr) {
                    const ls = localStorage.getItem('bay_services');
                    if (ls && JSON.parse(ls).length > 0) setServices(JSON.parse(ls));
                }

                // Fetch staff
                const { data: staffData, error: stErr } = await supabase.from('staff').select('*').eq('user_id', currentUser.id);
                if (!stErr && staffData && staffData.length > 0) {
                    setStaff(staffData);
                } else if (!stErr) {
                    const ls = localStorage.getItem('bay_staff');
                    if (ls && JSON.parse(ls).length > 0) setStaff(JSON.parse(ls));
                }

                // Fetch appointments
                const { data: apptData, error: aErr } = await supabase.from('appointments').select('*').eq('user_id', currentUser.id);
                if (!aErr && apptData && apptData.length > 0) {
                    const mapped = apptData.map(a => ({
                        id: a.id,
                        date: a.start_time.split('T')[0],
                        time: a.start_time.split('T')[1].substring(0, 5),
                        customerName: a.customer_name,
                        customerPhone: a.customer_phone || '',
                        serviceId: a.service_id,
                        staffId: a.staff_id,
                        status: a.status,
                        paymentStatus: a.payment_status,
                        amount: a.amount,
                        notes: a.notes,
                        type: a.type || 'appointment' // 'appointment' or 'block'
                    }));
                    setAppointments(mapped);
                } else if (!aErr) {
                    const ls = localStorage.getItem('bay_appointments');
                    if (ls && JSON.parse(ls).length > 0) setAppointments(JSON.parse(ls));
                }

                // Fetch settings
                const { data: settingsData, error: settingsError } = await supabase.from('appointment_settings').select('*').eq('user_id', currentUser.id).maybeSingle();
                if (settingsError) throw settingsError;

                if (settingsData) {
                    setSettings({
                        workingHours: { start: settingsData.working_hours_start, end: settingsData.working_hours_end },
                        workingDays: settingsData.working_days,
                        slotDuration: settingsData.slot_duration,
                        bufferTime: settingsData.buffer_time,
                        holidays: settingsData.holidays,
                        breaks: settingsData.breaks
                    });
                }
            } catch (err) {
                console.error('Error loading appointment data, using local fallback:', err);
                const localServices = localStorage.getItem('bay_services');
                if (localServices) setServices(JSON.parse(localServices));

                const localSettings = localStorage.getItem('bay_appointment_settings');
                if (localSettings) setSettings(JSON.parse(localSettings));

                const localAppts = localStorage.getItem('bay_appointments');
                if (localAppts) setAppointments(JSON.parse(localAppts));
            } finally {
                setLoading(false);
            }
        };

        loadAppointmentData();
    }, [currentUser?.id]);

    // Check if user has premium plan
    const isPremium = () => {
        // Allow if user is premium, or company is premium
        return currentUser?.plan === 'premium' || companyProfile?.plan === 'premium';
    };

    // LocalStorage Sync for Public Preview
    useEffect(() => {
        if (currentUser?.id && !loading) {
            localStorage.setItem('bay_services', JSON.stringify(services));
            localStorage.setItem('bay_appointment_settings', JSON.stringify(settings));
            localStorage.setItem('bay_appointments', JSON.stringify(appointments));
            localStorage.setItem('bay_staff', JSON.stringify(staff));
        }
    }, [services, settings, appointments, staff, currentUser, loading]);

    // Actions
    const addAppointment = async (appt) => {
        if (!currentUser?.id) return null;

        const service = services.find(s => s.id === appt.serviceId);
        const duration = service?.duration || 30;

        // Construct ISO strings for start and end
        const startISO = `${appt.date}T${appt.time}:00Z`;
        const endISO = new Date(new Date(startISO).getTime() + duration * 60000).toISOString();

        const id = uuidv4();
        const newAppt = {
            id,
            user_id: currentUser.id,
            customer_name: appt.customerName,
            customer_email: appt.customerEmail,
            customer_phone: appt.customerPhone,
            service_id: appt.serviceId,
            staff_id: appt.staffId,
            start_time: startISO,
            end_time: endISO,
            status: 'confirmed', // confirm by default for internal adds
            notes: appt.notes
        };

        const { data, error } = await supabase.from('appointments').insert(newAppt).select().single();

        let mapped = {};
        if (error) {
            console.error('Error saving appointment (using fallback):', error);
            if (currentUser?.isSupabase) {
                syncService.enqueue('appointments', 'insert', newAppt);
            } else {
                console.warn('[Appointment] Skipping sync enqueue - not a Supabase user');
            }
            mapped = {
                ...appt,
                id,
                startTime: startISO,
                endTime: endISO
            };
        } else {
            console.log('[Appointment] Appointment successfully saved to Supabase:', data.id);
            mapped = {
                ...appt,
                id: data.id,
                startTime: data.start_time,
                endTime: data.end_time
            };
        }

        setAppointments(prev => [...prev, mapped]);
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
            // if type exists in DB it should be 'block', otherwise we rely on notes or service_id=null
            start_time: startISO,
            end_time: endISO,
            status: 'confirmed',
            notes: notes,
            customer_name: 'System Block'
        };

        const { data, error } = await supabase.from('appointments').insert(newBlock).select().single();
        let mapped = {};
        if (error) {
            console.error('Error saving block (using fallback):', error);
            syncService.enqueue('appointments', 'insert', newBlock);
            mapped = {
                id,
                date: startISO.split('T')[0],
                time: startISO.split('T')[1].substring(0, 5),
                notes: notes,
                type: 'block'
            };
        } else {
            mapped = {
                id: data.id,
                date: data.start_time.split('T')[0],
                time: data.start_time.split('T')[1].substring(0, 5),
                notes: data.notes,
                type: 'block'
            };
        }

        setAppointments(prev => [...prev, mapped]);
        return mapped;
    };

    const updateAppointment = async (id, updates) => {
        const dbUpdates = {};
        if (updates.customerName) dbUpdates.customer_name = updates.customerName;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.date && updates.time) {
            dbUpdates.start_time = `${updates.date}T${updates.time}:00Z`;
            // Need service duration for end_time update... keeping simple for now
        }

        const { error } = await supabase.from('appointments').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating appointment:', error);
            syncService.enqueue('appointments', 'update', dbUpdates, id);
        }

        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const deleteAppointment = async (id) => {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) {
            console.error('Error deleting appointment:', error);
            syncService.enqueue('appointments', 'delete', null, id);
        }
        setAppointments(prev => prev.filter(a => a.id !== id));
    };

    const addService = async (service) => {
        if (!currentUser?.id) return;
        const id = uuidv4();
        const dbService = {
            id,
            user_id: currentUser.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            color: service.color
        };

        const { data, error } = await supabase.from('services').insert(dbService).select().single();
        if (error) {
            console.error('Error adding service fallback:', error);
            if (currentUser?.isSupabase) {
                syncService.enqueue('services', 'insert', dbService);
            } else {
                console.warn('[Appointment] Skipping sync enqueue - not a Supabase user');
            }
            setServices(prev => [...prev, { ...service, id }]);
        } else if (data) {
            console.log('[Appointment] Service successfully saved to Supabase:', data.id);
            setServices(prev => [...prev, data]);
        }
    };

    const deleteService = async (id) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) {
            console.error('Error deleting service:', error);
            syncService.enqueue('services', 'delete', null, id);
        }
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const updateService = async (updatedService) => {
        const { error } = await supabase.from('services').update(updatedService).eq('id', updatedService.id);
        if (error) console.error('Error updating service:', error);
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    };

    const addStaff = async (member) => {
        if (!currentUser?.id) return;
        const id = uuidv4();
        const dbMember = { ...member, id, user_id: currentUser.id };
        const { data, error } = await supabase.from('staff').insert(dbMember).select().single();

        if (error) {
            console.error('Error adding staff fallback:', error);
            syncService.enqueue('staff', 'insert', dbMember);
            setStaff(prev => [...prev, { ...member, id }]);
        } else if (data) {
            setStaff(prev => [...prev, data]);
        }
    };

    const deleteStaff = async (id) => {
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) {
            syncService.enqueue('staff', 'delete', null, id);
        }
        setStaff(prev => prev.filter(s => s.id !== id));
    };

    const updateSettings = async (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        if (currentUser?.id) {
            const dbData = {
                user_id: currentUser.id,
                working_hours_start: newSettings.workingHours?.start || settings.workingHours.start,
                working_hours_end: newSettings.workingHours?.end || settings.workingHours.end,
                working_days: newSettings.workingDays || settings.workingDays,
                slot_duration: newSettings.slotDuration || settings.slotDuration,
                buffer_time: newSettings.bufferTime || settings.bufferTime,
                holidays: newSettings.holidays || settings.holidays,
                breaks: newSettings.breaks || settings.breaks
            };
            await supabase.from('appointment_settings').upsert(dbData, { onConflict: 'user_id' });
        }
    };

    const getService = (id) => services.find(s => s.id === id);
    const getStaff = (id) => staff.find(s => s.id === id);

    const createPublicBooking = async (bookingDetails) => {
        const result = await addAppointment({
            ...bookingDetails,
            status: 'pending' // Online bookings start as pending
        });
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
