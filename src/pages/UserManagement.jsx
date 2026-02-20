import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useInvoice } from '../context/InvoiceContext';
import { motion } from 'framer-motion';
import { Search, UserPlus, Mail, Shield, Building, Edit2, Trash2, MoreVertical, X, Check, Users } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const UserManagement = () => {
    const { t } = useLanguage();
    const { companyProfile, employees, saveEmployee, deleteEmployee, updateEmployee } = useInvoice();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Worker',
        sites: '', // Store as string for input, convert to array for storage
        status: 'Active'
    });
    const [editId, setEditId] = useState(null);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ROLES = ['Admin', 'Manager', 'Site Lead', 'Accountant', 'Worker'];
    const STATUSES = ['Active', 'Inactive', 'Pending'];

    const getRoleLabel = (role) => {
        const key = `role_${role.toLowerCase().replace(' ', '_')}`;
        return t(key) || role;
    };

    const getStatusLabel = (status) => {
        const key = `status_${status.toLowerCase()}`;
        return t(key) || status;
    };

    const handleAddNew = () => {
        setFormData({ name: '', email: '', role: 'Worker', sites: '', status: 'Active' });
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleEdit = (emp) => {
        setFormData({
            name: emp.name,
            email: emp.email,
            role: emp.role,
            sites: Array.isArray(emp.sites) ? emp.sites.join(', ') : emp.sites,
            status: emp.status || 'Active'
        });
        setIsEditing(true);
        setEditId(emp.id);
        setShowModal(true);
    };

    const handleDeleteClick = (emp) => {
        setDeleteConfirm(emp);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteEmployee(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const sitesArray = formData.sites.split(',').map(s => s.trim()).filter(s => s);

        const employeeData = {
            ...formData,
            sites: sitesArray.length > 0 ? sitesArray : ['Main']
        };

        if (isEditing && editId) {
            updateEmployee(editId, employeeData);
        } else {
            saveEmployee(employeeData);
        }

        setShowModal(false);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>{t('users')}</h1>
                    <p>{t('overviewText')}</p>
                </div>
                <button className="primary-btn" onClick={handleAddNew} style={{ boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}>
                    <UserPlus size={20} />
                    {t('addEmployee')}
                </button>
            </header>

            {/* Admin User Stats */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="card glass premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0 }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('totalUsers')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{employees.length}</div>
                    </div>
                </div>
                <div className="card glass premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0 }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981' }}>
                        <Check size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('active')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{employees.filter(e => e.status === 'Active').length}</div>
                    </div>
                </div>
                <div className="card glass premium-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 0 }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('role_admin')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{employees.filter(e => e.role === 'Admin').length}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="search-bar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Search className="text-muted" size={20} />
                    <input
                        type="text"
                        placeholder={t('searchUsers')}
                        className="input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="card">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>{t('customer')} / {t('fullName')}</th>
                            <th>{t('role')}</th>
                            <th>{t('site')}</th>
                            <th>{t('status')}</th>
                            <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp, index) => (
                            <motion.tr
                                key={emp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar" style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)`,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            {emp.name ? emp.name[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{emp.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{emp.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Shield size={16} className="text-primary" />
                                        <span>{getRoleLabel(emp.role)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building size={16} className="text-muted" />
                                        <span>{Array.isArray(emp.sites) ? emp.sites.join(', ') : emp.sites}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${emp.status === 'Active' ? 'success' : 'warning'}`} style={{
                                        background: emp.status === 'Active' ? '#dcfce7' : '#fef9c3',
                                        color: emp.status === 'Active' ? '#166534' : '#854d0e',
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600'
                                    }}>
                                        {getStatusLabel(emp.status)}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="icon-btn" onClick={() => handleEdit(emp)} title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDeleteClick(emp)} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    {t('noData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px', padding: '24px' }}>
                        <div className="modal-header">
                            <h2>{isEditing ? t('edit') : t('addEmployee')}</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('fullName')}</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('email')}</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>{t('role')}</label>
                                    <select
                                        className="form-input"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>{t('status')}</label>
                                    <select
                                        className="form-input"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('site')} (comma separated)</label>
                                <input
                                    className="form-input"
                                    value={formData.sites}
                                    onChange={e => setFormData({ ...formData, sites: e.target.value })}
                                    placeholder={t('sites_placeholder')}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="primary-btn">
                                    <Check size={18} /> {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title={t('delete')}
                message={t('delete_confirm_message').replace('{name}', deleteConfirm?.name)}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
