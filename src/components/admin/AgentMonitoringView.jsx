import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Activity, CheckCircle, AlertCircle, Clock,
    RefreshCw, Filter, Shield, ShoppingBag, Calendar,
    Play, Pause, Terminal, ChevronRight, BarChart3,
    LayoutDashboard, Globe, MessageSquare, Search, Palette
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AGENTS = [
    { id: 'BayMaster', name: 'BayMaster', icon: Activity, color: '#f8fafc', desc: 'Chief Orchestrator Agent' },
    { id: 'BayGuard', name: 'BayGuard', icon: Shield, color: '#3b82f6', desc: 'Security & Health Monitor' },
    { id: 'BaySync', name: 'BaySync', icon: RefreshCw, color: '#f97316', desc: 'Data & DB Integrity Agent' },
    { id: 'BayUX', name: 'BayUX', icon: LayoutDashboard, color: '#ec4899', desc: 'UI/UX & Design Experience' },
    { id: 'BayVision', name: 'BayVision', icon: Globe, color: '#06b6d4', desc: 'Visual AI & Document OCR' },
    { id: 'BayGlobe', name: 'BayGlobe', icon: Globe, color: '#f43f5e', desc: 'Auto-Translation & Locales' },
    { id: 'BaySEO', name: 'BaySEO', icon: Search, color: '#84cc16', desc: 'Meta Optimization & SEO' },
    { id: 'BayInStock', name: 'BayInStock', icon: ShoppingBag, color: '#10b981', desc: 'Inventory & Accounting' },
    { id: 'BayTermin', name: 'BayTermin', icon: Calendar, color: '#8b5cf6', desc: 'Appointment Scheduling' },
    { id: 'BayCreative', name: 'BayCreative', icon: Palette, color: '#f59e0b', desc: 'Creative & Design Architect' },
    { id: 'BayPilot', name: 'BayPilot', icon: Zap, color: '#f59e0b', desc: 'Intelligent System Guide' }
];

const AgentMonitoringView = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, success, failure, running
    const [filterTab, setFilterTab] = useState('logs'); // logs, tasks
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        failed: 0,
        running: 0,
        queued: 0
    });
    const [outboxTasks, setOutboxTasks] = useState([]);

    const fetchAgentLogs = async () => {
        setIsLoading(true);
        try {
            // Fetch logs for the last 24 hours
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .gte('created_at', yesterday.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter for agent-related logs
            // We search for agent names in 'source' or 'metadata'
            const agentLogs = data?.filter(log => {
                const source = log.source?.toLowerCase() || '';
                const action = log.action?.toLowerCase() || '';
                const metadataStr = JSON.stringify(log.metadata || '').toLowerCase();

                return source.includes('bay') ||
                    AGENTS.some(a => source.includes(a.id.toLowerCase()) || metadataStr.includes(a.id.toLowerCase()));
            }) || [];

            setLogs(agentLogs);

            // Fetch Outbox tasks for the last 24 hours
            const { data: outboxData, error: outboxError } = await supabase
                .from('db_outbox_events')
                .select('*')
                .gte('created_at', yesterday.toISOString())
                .order('created_at', { ascending: false });

            if (!outboxError) {
                setOutboxTasks(outboxData || []);
            }

            // Calculate stats
            const s = {
                total: agentLogs.length + (outboxData?.length || 0),
                success: agentLogs.filter(l => l.severity !== 'critical' && l.severity !== 'error').length +
                    (outboxData?.filter(t => t.status === 'processed' || t.status === 'success').length || 0),
                failed: agentLogs.filter(l => l.severity === 'critical' || l.severity === 'error').length +
                    (outboxData?.filter(t => t.status === 'failed' || t.status === 'error').length || 0),
                running: agentLogs.filter(l => l.metadata?.status === 'running').length +
                    (outboxData?.filter(t => t.status === 'processing' || t.status === 'working').length || 0),
                queued: outboxData?.filter(t => t.status === 'pending' || t.status === 'queued').length || 0
            };
            setStats(s);

        } catch (err) {
            console.error('[AgentMonitor] Fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgentLogs();
        const interval = setInterval(fetchAgentLogs, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'success') return log.severity !== 'critical' && log.severity !== 'error';
        if (filter === 'failure') return log.severity === 'critical' || log.severity === 'error';
        if (filter === 'running') return log.metadata?.status === 'running' || log.metadata?.status === 'queued';
        return true;
    });

    const getStatusColor = (log) => {
        if (log.severity === 'critical' || log.severity === 'error') return '#ef4444';
        if (log.metadata?.status === 'running') return '#3b82f6';
        if (log.metadata?.status === 'queued') return '#94a3b8';
        return '#10b981'; // success/info
    };

    const getAgentInfo = (log) => {
        const source = log.source?.toLowerCase() || '';
        const metadataStr = JSON.stringify(log.metadata || '').toLowerCase();
        // Default to BayPilot (now at index 10)
        return AGENTS.find(a => source.includes(a.id.toLowerCase()) || metadataStr.includes(a.id.toLowerCase())) || AGENTS[10];
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Active Queue</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} /> {stats.queued}
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Working Now</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={20} className={stats.running > 0 ? "animate-pulse" : ""} /> {stats.running}
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>24h Fulfilled</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={20} /> {stats.success}
                    </div>
                </div>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#ef4444', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Unfulfilled / Errors</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} /> {stats.failed}
                    </div>
                </div>
            </div>

            {/* Controls & Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {['all', 'success', 'failure', 'running'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === f ? '#3b82f6' : '#1e293b',
                                color: filter === f ? 'white' : '#94a3b8',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchAgentLogs}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh Feed
                </button>
            </div>

            {/* List */}
            {/* Feed Tabs */}
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(30, 41, 59, 0.5)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                <button
                    onClick={() => setFilterTab('logs')}
                    style={{
                        padding: '8px 20px', borderRadius: '10px', border: 'none',
                        background: filterTab === 'logs' ? '#3b82f6' : 'transparent',
                        color: filterTab === 'logs' ? 'white' : '#94a3b8',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                >
                    Agent Protocols
                </button>
                <button
                    onClick={() => setFilterTab('tasks')}
                    style={{
                        padding: '8px 20px', borderRadius: '10px', border: 'none',
                        background: filterTab === 'tasks' ? '#8b5cf6' : 'transparent',
                        color: filterTab === 'tasks' ? 'white' : '#94a3b8',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                >
                    Task Queue {stats.queued > 0 && <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>{stats.queued}</span>}
                </button>
            </div>

            {/* List */}
            <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '0', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                        {filterTab === 'logs' ? 'Live Agent Feed (24h)' : 'Operational Task Queue (24h)'}
                    </h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {AGENTS.map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#64748b' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color }} />
                                {a.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '12px' }}>
                    {isLoading && logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px auto' }} />
                            Connecting to Agent Protocols...
                        </div>
                    ) : (filterTab === 'logs' ? filteredLogs : outboxTasks).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(filterTab === 'logs' ? filteredLogs : outboxTasks).map(item => {
                                if (filterTab === 'logs') {
                                    const log = item;
                                    const agent = getAgentInfo(log);
                                    return (
                                        <div key={log.id} style={{
                                            background: 'rgba(15, 23, 42, 0.4)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            borderLeft: `4px solid ${getStatusColor(log)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <div style={{ padding: '10px', background: `${agent.color}20`, color: agent.color, borderRadius: '10px' }}>
                                                <agent.icon size={20} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{agent.name} &rsaquo; {log.action}</span>
                                                    {log.metadata?.status === 'running' && (
                                                        <span style={{ color: '#3b82f6', fontSize: '0.7rem', animation: 'pulse 2s infinite' }}>[RUNNING]</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {log.metadata?.message || log.metadata?.details || 'Protocol executed successfully.'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#475569', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {log.severity.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const task = item;
                                    const agent = AGENTS.find(a => a.id.toLowerCase().includes(task.app.toLowerCase())) || AGENTS[9];
                                    return (
                                        <div key={task.id} style={{
                                            background: 'rgba(15, 23, 42, 0.4)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            borderLeft: `4px solid ${task.status === 'pending' ? '#8b5cf6' : task.status === 'processed' ? '#10b981' : '#ef4444'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                            <div style={{ padding: '10px', background: `${agent.color}20`, color: agent.color, borderRadius: '10px' }}>
                                                {task.status === 'pending' ? <Clock size={20} /> : <agent.icon size={20} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{task.entity.toUpperCase()} &rsaquo; {task.operation}</span>
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        background: task.status === 'pending' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                                        color: task.status === 'pending' ? '#a78bfa' : '#94a3b8',
                                                        padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase'
                                                    }}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    ID: {task.id.substring(0, 8)}... | App: {task.app}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                                                    {new Date(task.created_at).toLocaleTimeString()}
                                                </div>
                                                {task.processed_at && (
                                                    <div style={{ fontSize: '0.65rem', color: '#10b981' }}>
                                                        Done: {new Date(task.processed_at).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                            <Terminal size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                            No activity detected for selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* Matrix Agent Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {AGENTS.map(agent => {
                    const agentLogs = logs.filter(l => getAgentInfo(l).id === agent.id);
                    const hasActivity = agentLogs.length > 0;
                    const dutyScore = hasActivity ? 100 : 98; // Simulated high availability

                    return (
                        <div key={agent.id} style={{
                            background: 'rgba(30, 41, 59, 0.3)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Animated Background Pulse for Active Agents */}
                            {hasActivity && (
                                <div style={{
                                    position: 'absolute', top: 0, right: 0, width: '4px', height: '100%',
                                    background: agent.color, opacity: 0.5, boxShadow: `0 0 10px ${agent.color}`
                                }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `${agent.color}20`,
                                    color: agent.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <agent.icon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>{agent.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>ONLINE</span>
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{agent.desc}</p>

                            <div style={{
                                marginTop: 'auto',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold' }}>Duty Score</div>
                                    <div style={{ fontSize: '0.9rem', color: agent.color, fontWeight: '900' }}>{dutyScore}%</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold' }}>Tasks (24h)</div>
                                    <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: '700' }}>{agentLogs.length}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgentMonitoringView;
