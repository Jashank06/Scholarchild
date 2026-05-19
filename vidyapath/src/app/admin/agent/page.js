'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AIMascot from '@/components/admin/AIMascot';
import TiltCard from '@/components/admin/TiltCard';
import styles from './agent.module.css';

const TYPE_BADGE_MAP = {
  scholarship: styles.badgeScholarship,
  competition: styles.badgeCompetition,
  scheme: styles.badgeScheme,
  fellowship: styles.badgeFellowship,
  internship: styles.badgeInternship,
  camp: styles.badgeCamp,
  workshop: styles.badgeWorkshop,
  other: styles.badgeOther,
};

const TRUST_BADGE_MAP = {
  verified: styles.badgeVerified,
  suspicious: styles.badgeSuspicious,
  unverified: styles.badgeUnverified,
};

function ConfidenceRing({ value, size = 56 }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className={styles.confidenceRing} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className={styles.bgCircle} cx={size / 2} cy={size / 2} r={r} />
        <circle className={styles.fgCircle} cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className={styles.confidenceValue}>{value}</div>
    </div>
  );
}

function PriorityBar({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className={styles.priorityBar}>
      <span className={styles.priorityLabel}>Priority</span>
      <div className={styles.priorityTrack}>
        <div className={styles.priorityFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span className={styles.priorityValue} style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Live Animated Icons ───
const PendingIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin-slow 4s linear infinite' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const ApprovedIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const RejectedIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'shake-soft 3s ease-in-out infinite' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const DuplicatesIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 3s linear infinite' }}>
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="14.89" x2="21" y2="3"></line>
    <polyline points="8 21 3 21 3 16"></polyline>
    <line x1="20" y1="9.11" x2="3" y2="21"></line>
  </svg>
);

const CalendarIcon = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bounce-soft 2s ease-in-out infinite' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M8 14h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 18h.01"></path>
    <path d="M12 18h.01"></path>
    <path d="M16 18h.01"></path>
  </svg>
);

export default function AgentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [selectAllGlobal, setSelectAllGlobal] = useState(false);
  const [filter, setFilter] = useState({ status: 'pending', type: '', sort: 'priority' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [processing, setProcessing] = useState(new Set());
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!loading) {
      // Animate Stats
      gsap.fromTo('.stat-card-anim', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
      );
      // Animate Cards
      gsap.fromTo('.opp-card-anim',
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, [loading, opportunities.length]);

  // Suppress specific React Three Fiber / Three.js deprecation warnings that we don't control
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return;
      originalWarn(...args);
    };
    return () => { console.warn = originalWarn; };
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, pendingRes, logsRes] = await Promise.all([
        api.getAgentDashboard(),
        api.getAgentPending({ status: filter.status, type: filter.type, sort: filter.sort, limit: 50, page }),
        api.getAgentScanLogs({ limit: 10 }),
      ]);
      setStats(dashRes.data || {});
      setOpportunities(pendingRes.data || []);
      setTotalPages(pendingRes.pagination?.pages || 1);
      setScanLogs(logsRes.data || []);
    } catch (e) {
      console.error('Agent dashboard error:', e);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { setPage(1); }, [filter.status, filter.type, filter.sort]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Actions ───
  const handleApprove = async (id) => {
    setProcessing(p => new Set(p).add(id));
    try {
      const res = await api.approveAgentOpportunity(id);
      showMessage(res.message || 'Approved!');
      setOpportunities(prev => prev.filter(o => o._id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      // Refresh stats
      const dashRes = await api.getAgentDashboard();
      setStats(dashRes.data || {});
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setProcessing(p => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this opportunity?')) return;
    setProcessing(p => new Set(p).add(id));
    try {
      await api.rejectAgentOpportunity(id, 'Rejected by admin');
      showMessage('Opportunity rejected.');
      setOpportunities(prev => prev.filter(o => o._id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      const dashRes = await api.getAgentDashboard();
      setStats(dashRes.data || {});
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setProcessing(p => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleBulkApprove = async () => {
    const totalToApprove = selectAllGlobal ? stats.pending : selected.size;
    if (totalToApprove === 0) return showMessage('No items selected', 'error');
    if (!confirm(`Approve all ${totalToApprove} opportunities?`)) return;
    setScanning(true);
    try {
      const payload = selectAllGlobal 
        ? { all: true, filter: { type: filter.type } } 
        : { ids: [...selected] };
      const res = await api.bulkApproveAgent(payload);
      showMessage(res.message || 'Approved!');
      setSelected(new Set());
      setSelectAllGlobal(false);
      fetchData();
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    showMessage('⏳ Processing file through AI pipeline...', 'info');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.scanAgentExcel(formData);
      showMessage(res.message || 'Import complete!');
      fetchData();
    } catch (e) {
      showMessage(e.message || 'Import failed', 'error');
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handleUrlScan = async () => {
    if (!scanUrl.trim()) return;
    setScanning(true);
    setShowUrlModal(false);
    showMessage('⏳ Scanning URL...', 'info');
    try {
      const res = await api.scanAgentUrl(scanUrl.trim());
      showMessage(res.message || 'URL scanned!');
      setScanUrl('');
      fetchData();
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleLocalScan = async () => {
    setScanning(true);
    showMessage('⏳ Processing internal database...', 'info');
    try {
      const res = await api.scanAgentLocal();
      showMessage(res.message || 'Database processed!');
      fetchData();
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleCrawlerScan = async () => {
    setScanning(true);
    showMessage('⏳ Running autonomous Web Crawler (This may take a minute)...', 'info');
    try {
      const res = await api.scanAgentCrawler();
      showMessage(res.message || 'Crawler finished successfully!');
      fetchData();
    } catch (e) {
      showMessage(e.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setSelectAllGlobal(false);
  };

  const toggleSelectAll = () => {
    if (selected.size === opportunities.length) {
      setSelected(new Set());
      setSelectAllGlobal(false);
    } else {
      setSelected(new Set(opportunities.map(o => o._id)));
    }
  };

  if (loading) return <div className={styles.loadingWrap}><div className={styles.spinner}></div></div>;

  return (
    <div className={styles.agentPage} ref={containerRef}>
      {/* ─── Header ─── */}
      <div className={styles.agentHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: '24px', padding: '10px' }}>
            <AIMascot status={scanning ? 'scanning' : processing.size > 0 ? 'processing' : 'idle'} style={{ width: '100px', height: '100px' }} />
          </div>
          <div>
            <div className={styles.agentTitle} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '2rem', margin: 0, background: 'linear-gradient(to right, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Kushaagra Core AI
              </h1>
              <span className={`${styles.statusBadge} ${stats.agentStatus?.isActive ? styles.statusActive : styles.statusIdle}`} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                <span className={styles.pulse} style={{ width: '10px', height: '10px' }}></span>
                {scanning ? 'Hunting...' : processing.size > 0 ? 'Processing...' : stats.agentStatus?.isActive ? 'Online' : 'Idle'}
              </span>
            </div>
            <p style={{ color: '#4B5563', margin: '8px 0 0', fontSize: '15px', fontWeight: 500 }}>
              Intelligent opportunity detection & classification engine
              {stats.agentStatus?.lastScanTime && <span style={{ color: '#9CA3AF', fontSize: '13px', marginLeft: '8px' }}>• Last scan: {new Date(stats.agentStatus.lastScanTime).toLocaleString('en-IN')}</span>}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {(selected.size > 0 || selectAllGlobal) && (
            <button className={`${styles.actionBtn} ${styles.btnBulkApprove}`} onClick={handleBulkApprove} disabled={scanning} style={{ boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
              ✅ Approve {selectAllGlobal ? stats.pending : selected.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* ─── Message ─── */}
      {message.text && (
        <div className={`${styles.toast} ${message.type === 'success' ? styles.toastSuccess : message.type === 'error' ? styles.toastError : styles.toastInfo}`}>
          {message.text}
        </div>
      )}

      {/* ─── Stats ─── */}
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes spin { 100% { transform: rotate(-360deg); } }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(16,185,129,0.2)); } 50% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(16,185,129,0.8)); } }
        @keyframes shake-soft { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes bounce-soft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
      <div className={styles.statsGrid}>
        {[
          { icon: <PendingIcon color="#F59E0B" />, label: 'Pending Review', value: stats.pending || 0, color: '#F59E0B' },
          { icon: <ApprovedIcon color="#10B981" />, label: 'Approved', value: stats.approved || 0, color: '#10B981' },
          { icon: <RejectedIcon color="#EF4444" />, label: 'Rejected', value: stats.rejected || 0, color: '#EF4444' },
          { icon: <DuplicatesIcon color="#8B5CF6" />, label: 'Duplicates', value: stats.duplicate || 0, color: '#8B5CF6' },
          { icon: <CalendarIcon color="#0EA5E9" />, label: "Today's Finds", value: stats.todayCount || 0, color: '#0EA5E9' },
        ].map((stat, i) => (
          <div key={i} className={`stat-card-anim ${styles.statCard}`} style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
            transform: 'translateZ(0)' // Hardware acceleration
          }}>
            <div className={styles.statIcon} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{stat.icon}</div>
            <div className={styles.statValue} style={{ color: stat.color, textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{stat.value}</div>
            <div className={styles.statLabel} style={{ fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filters ─── */}
      <div className={styles.filtersBar}>
        <select className={styles.filterSelect} value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
          <option value="duplicate">🔄 Duplicates</option>
          <option value="all">📋 All</option>
        </select>
        <select className={styles.filterSelect} value={filter.type}
          onChange={e => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="scholarship">🎓 Scholarship</option>
          <option value="competition">🏆 Competition</option>
          <option value="scheme">🏛️ Scheme</option>
          <option value="fellowship">📚 Fellowship</option>
          <option value="internship">💼 Internship</option>
          <option value="camp">🏕️ Camp</option>
          <option value="workshop">🔧 Workshop</option>
        </select>
        <select className={styles.filterSelect} value={filter.sort}
          onChange={e => setFilter({ ...filter, sort: e.target.value })}>
          <option value="priority">Sort: Priority</option>
          <option value="confidence">Sort: Confidence</option>
          <option value="trust">Sort: Trust Score</option>
          <option value="newest">Sort: Newest</option>
        </select>
        {opportunities.length > 0 && filter.status === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <label className={styles.selectAllCheckbox}>
              <input type="checkbox" checked={(selected.size === opportunities.length || selectAllGlobal) && opportunities.length > 0}
                onChange={toggleSelectAll} />
              Select All ({opportunities.length})
            </label>
            {selected.size === opportunities.length && stats.pending > opportunities.length && !selectAllGlobal && (
              <span style={{ fontSize: '14px', color: '#4B5563', fontWeight: 500 }}>
                All {opportunities.length} items on this page are selected.{' '}
                <button 
                  onClick={() => setSelectAllGlobal(true)}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                >
                  Select all {stats.pending} pending opportunities
                </button>
              </span>
            )}
            {selectAllGlobal && (
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>
                🎉 Selected all {stats.pending} opportunities across all pages!
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Opportunity Cards ─── */}
      <div className={styles.cardsGrid}>
        {opportunities.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🤖</div>
            <div className={styles.emptyTitle}>
              {filter.status === 'pending' ? 'No pending opportunities' : `No ${filter.status} opportunities`}
            </div>
            <div className={styles.emptyText}>
              Import an Excel file or scan a URL to get started
            </div>
          </div>
        ) : opportunities.map(opp => (
          <TiltCard key={opp._id} priorityScore={opp.priorityScore?.overall || 0} className={`opp-card-anim ${styles.oppCard} ${selected.has(opp._id) ? styles.selected : ''} ${opp.duplicateCheck?.isDuplicate ? styles.duplicate : ''} ${opp.agentStatus === 'approved' ? styles.approved : ''}`}>
            <div className={styles.cardTop}>
              <div className={styles.cardLeft}>
                {filter.status === 'pending' && (
                  <input type="checkbox" className={styles.cardCheckbox}
                    checked={selected.has(opp._id)} onChange={() => toggleSelect(opp._id)} />
                )}
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{opp.title}</h3>
                  <div className={styles.cardBadges}>
                    <span className={`${styles.badge} ${TYPE_BADGE_MAP[opp.type] || styles.badgeOther}`}>
                      {opp.type}
                    </span>
                    <span className={`${styles.badge} ${TRUST_BADGE_MAP[opp.aiMetadata?.trustLevel] || styles.badgeUnverified}`}>
                      {opp.aiMetadata?.trustLevel === 'verified' ? '🟢' : opp.aiMetadata?.trustLevel === 'suspicious' ? '🟡' : '🔴'} {opp.aiMetadata?.trustLevel || 'unverified'}
                    </span>
                    {opp.duplicateCheck?.isDuplicate && (
                      <span className={`${styles.badge} ${styles.badgeDuplicate}`}>⚠️ Duplicate</span>
                    )}
                    <span className={`${styles.badge} ${styles.badgeSource}`}>
                      {opp.source?.type?.replace('_', ' ') || 'manual'}
                    </span>
                  </div>
                </div>
              </div>
              <ConfidenceRing value={opp.aiMetadata?.overallConfidence || 0} />
            </div>

            {/* Details */}
            <div className={styles.cardDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Organizer</span>
                <span className={styles.detailValue}>{opp.organizer?.name || '—'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Level</span>
                <span className={styles.detailValue}>{opp.organizer?.level || '—'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{opp.category || '—'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Award</span>
                <span className={styles.detailValue} style={{ color: '#059669', fontWeight: 700 }}>
                  {opp.rewards?.cashAmount > 0 ? `₹${opp.rewards.cashAmount.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Deadline</span>
                <span className={styles.detailValue}>
                  {opp.dates?.applicationDeadline ? new Date(opp.dates.applicationDeadline).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Trust Score</span>
                <span className={styles.detailValue} style={{ fontWeight: 700 }}>{opp.aiMetadata?.trustScore || 0}/100</span>
              </div>
            </div>

            {/* Tags */}
            {opp.tags?.length > 0 && (
              <div className={styles.tagsRow}>
                {opp.tags.slice(0, 8).map((tag, i) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
                {opp.tags.length > 8 && <span className={styles.tag}>+{opp.tags.length - 8}</span>}
              </div>
            )}

            {/* Priority */}
            <PriorityBar score={opp.priorityScore?.overall || 0} />

            {/* Duplicate info */}
            {opp.duplicateCheck?.isDuplicate && (
              <div style={{ fontSize: '12px', color: '#DC2626', background: '#FEF2F2', padding: '8px 14px', borderRadius: '10px', marginBottom: '14px', fontWeight: 600 }}>
                ⚠️ {opp.duplicateCheck.matchDetails}
              </div>
            )}

            {/* Actions */}
            {opp.agentStatus === 'pending' && (
              <div className={styles.cardActions}>
                {opp.application?.externalLink && (
                  <a href={opp.application.externalLink} target="_blank" rel="noopener noreferrer" className={styles.editBtn} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
                    🔗 Link
                  </a>
                )}
                <button className={styles.rejectBtn} onClick={() => handleReject(opp._id)} disabled={processing.has(opp._id)} style={{ transform: 'translateZ(10px)' }}>
                  ❌ Reject
                </button>
                <button className={styles.approveBtn} onClick={() => handleApprove(opp._id)} disabled={processing.has(opp._id)} style={{ transform: 'translateZ(15px)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
                  {processing.has(opp._id) ? '...' : '✅ Approve & Publish'}
                </button>
              </div>
            )}
          </TiltCard>
        ))}
      </div>

      {/* ─── Pagination Controls ─── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px', marginBottom: '20px' }}>
          <button 
            disabled={page === 1} 
            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ padding: '10px 20px', borderRadius: '12px', background: page === 1 ? '#F3F4F6' : '#FFFFFF', color: page === 1 ? '#9CA3AF' : '#2563EB', border: '1px solid #E5E7EB', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
          >
            ← Previous Page
          </button>
          <div style={{ fontWeight: 600, color: '#4B5563' }}>
            Page {page} of {totalPages}
          </div>
          <button 
            disabled={page === totalPages} 
            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ padding: '10px 20px', borderRadius: '12px', background: page === totalPages ? '#F3F4F6' : '#2563EB', color: page === totalPages ? '#9CA3AF' : '#FFFFFF', border: 'none', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: page === totalPages ? 'none' : '0 4px 10px rgba(37, 99, 235, 0.3)' }}
          >
            Next Page →
          </button>
        </div>
      )}

      {/* ─── Scan Logs ─── */}
      {scanLogs.length > 0 && (
        <div className={styles.scanLogsSection}>
          <h2 className={styles.sectionTitle}>📜 Scan History</h2>
          <div className={styles.logsTimeline}>
            {scanLogs.map(log => (
              <div key={log._id} className={styles.logCard}>
                <div className={`${styles.logIcon} ${log.scanType === 'excel_import' ? styles.logExcel : log.scanType === 'url_scan' ? styles.logUrl : styles.logScheduled}`}>
                  {log.scanType === 'excel_import' ? '📊' : log.scanType === 'url_scan' ? '🔗' : '⏰'}
                </div>
                <div className={styles.logInfo}>
                  <div className={styles.logTitle}>
                    {log.scanType === 'excel_import' ? 'File Import' : 
                     log.scanType === 'url_scan' ? 'URL Scan' : 
                     log.scanType === 'bulk_sources' ? 'Web Crawler' : 'Scheduled Scan'}
                    {' — '}{log.source?.length > 50 ? log.source.substring(0, 50) + '...' : log.source}
                  </div>
                  <div className={styles.logMeta}>
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                    {log.durationMs && ` • ${(log.durationMs / 1000).toFixed(1)}s`}
                    {' • '}{log.status}
                  </div>
                </div>
                <div className={styles.logStats}>
                  <div className={styles.logStat}>
                    <div className={styles.logStatValue} style={{ color: '#10B981' }}>{log.opportunitiesCreated || 0}</div>
                    <div className={styles.logStatLabel}>Created</div>
                  </div>
                  <div className={styles.logStat}>
                    <div className={styles.logStatValue} style={{ color: '#8B5CF6' }}>{log.duplicatesSkipped || 0}</div>
                    <div className={styles.logStatLabel}>Duplicates</div>
                  </div>
                  <div className={styles.logStat}>
                    <div className={styles.logStatValue} style={{ color: '#EF4444' }}>{log.errorsEncountered || 0}</div>
                    <div className={styles.logStatLabel}>Errors</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── URL Scan Modal ─── */}
      {showUrlModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUrlModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>🔗 Scan URL for Opportunities</h3>
            <input className={styles.modalInput} type="url" placeholder="https://scholarships.gov.in/..."
              value={scanUrl} onChange={e => setScanUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrlScan()} autoFocus />
            <div className={styles.modalActions}>
              <button className={`${styles.actionBtn}`} style={{ background: '#F3F4F6', color: '#6B7280', borderColor: '#D1D5DB' }}
                onClick={() => setShowUrlModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.btnUrl}`} onClick={handleUrlScan} disabled={!scanUrl.trim()}>
                🔍 Scan Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
