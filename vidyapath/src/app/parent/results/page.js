/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from './results.module.css';

export default function ParentResultsPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic filter states
  const [search, setSearch] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // 'National' or 'State' or ''

  // Modal (Iframe portal view) state
  const [activePortal, setActivePortal] = useState(null); // { name, url, examName }
  const [iframeLoading, setIframeLoading] = useState(false);

  useEffect(() => {
    fetchResultSources();
  }, []);

  const fetchResultSources = async () => {
    setLoading(true);
    try {
      // Fetch all sources to perform fast client-side filtering & state extraction
      const res = await api.getResultSources();
      const data = res.data || [];
      setAllItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching result portals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run filtering whenever search, filters, or source data changes
  useEffect(() => {
    let result = [...allItems];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.examName?.toLowerCase().includes(q) ||
          item.state?.toLowerCase().includes(q)
      );
    }

    // Board filter
    if (selectedBoard) {
      result = result.filter((item) => item.board === selectedBoard);
    }

    // State filter
    if (selectedState) {
      result = result.filter((item) => item.state === selectedState);
    }

    // Level (Class) filter
    if (selectedLevel) {
      result = result.filter((item) => item.level === selectedLevel);
    }

    // Category filter (National / State)
    if (selectedCategory) {
      result = result.filter((item) => {
        const cat = (item.board === 'State' || item.state) ? 'State' : 'National';
        return cat === selectedCategory;
      });
    }

    setFilteredItems(result);
  }, [search, selectedBoard, selectedState, selectedLevel, selectedCategory, allItems]);

  const handleOpenPortal = (item) => {
    setActivePortal(item);
    setIframeLoading(true);
  };

  const handleClosePortal = () => {
    setActivePortal(null);
    setIframeLoading(false);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedBoard('');
    setSelectedState('');
    setSelectedLevel('');
    setSelectedCategory('');
  };

  // Dynamically extract states available in the seeded dataset
  const availableStates = Array.from(
    new Set(allItems.map((item) => item.state).filter(Boolean))
  ).sort();

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>
          🏆 Results & Examination Portals
        </h1>
        <p className={styles.subtitle}>
          Track your child's academic performance. View and verify official board results and scorecards directly.
        </p>
      </div>

      {/* Dynamic Filters Panel */}
      <div className={styles.filterPanel}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search board name, state, or exam (e.g. CBSE, UP Board)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          {(search || selectedBoard || selectedState || selectedLevel || selectedCategory) && (
            <button onClick={clearAllFilters} className={styles.clearFiltersBtn}>
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Board Type</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Board Types</option>
              <option value="CBSE">CBSE (Central)</option>
              <option value="ICSE">ICSE / CISCE</option>
              <option value="State">State Boards</option>
              <option value="Other">Other Boards</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Filter by State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All States</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Class / Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Classes</option>
              <option value="10">Class 10th (Matric)</option>
              <option value="12">Class 12th (Intermediate)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className={styles.quickChipsRow}>
          <span className={styles.chipsLabel}>Quick Filters:</span>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'National' ? '' : 'National')}
            className={`${styles.chip} ${selectedCategory === 'National' ? styles.chipActive : ''}`}
          >
            National Boards 🇮🇳
          </button>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'State' ? '' : 'State')}
            className={`${styles.chip} ${selectedCategory === 'State' ? styles.chipActive : ''}`}
          >
            State Boards 🗺️
          </button>
          <button
            onClick={() => setSelectedLevel(selectedLevel === '10' ? '' : '10')}
            className={`${styles.chip} ${selectedLevel === '10' ? styles.chipActive : ''}`}
          >
            Class 10th 🏫
          </button>
          <button
            onClick={() => setSelectedLevel(selectedLevel === '12' ? '' : '12')}
            className={`${styles.chip} ${selectedLevel === '12' ? styles.chipActive : ''}`}
          >
            Class 12th 🎓
          </button>
        </div>
      </div>

      {/* Results Listings */}
      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.shimmerCard} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '24px', background: 'white' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>No result portals match your criteria</div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Try resetting filters or adjusting your search term.</p>
          <button onClick={clearAllFilters} className={styles.clearFiltersBtn} style={{ marginTop: '16px' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.resultsGrid}>
          {filteredItems.map((item) => {
            const isState = item.board === 'State' || item.state;
            return (
              <div key={item._id} className={styles.resultCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.boardName}>{item.name}</h3>
                  <div className={styles.badgeRow}>
                    <span className={`${styles.badge} ${isState ? styles.badgeState : styles.badgeNational}`}>
                      {isState ? 'State Board' : 'National Board'}
                    </span>
                    <span className={`${styles.badge} ${styles.badgeClass}`}>
                      Class {item.level}th
                    </span>
                    {item.state && (
                      <span className={`${styles.badge} ${styles.badgeOther}`}>
                        📍 {item.state}
                      </span>
                    )}
                  </div>
                  <p className={styles.examNameText}>{item.examName}</p>
                </div>
                {item.description && <p className={styles.cardDesc}>{item.description}</p>}
                
                <div className={styles.cardActions}>
                  <button onClick={() => handleOpenPortal(item)} className={styles.checkBtn}>
                    <span>🔍 Check Roll No Result</span>
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.externalBtn}
                    title="Open in new tab directly"
                  >
                    ↗️
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Live Iframe Portal Modal */}
      {activePortal && (
        <div className={styles.modalOverlay} onClick={handleClosePortal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrapper}>
                <div className={styles.modalTitle}>{activePortal.name}</div>
                <div className={styles.modalSubtitle}>{activePortal.examName}</div>
              </div>
              <div className={styles.modalControls}>
                <a
                  href={activePortal.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.modalLinkBtn}
                >
                  🌐 Open in New Tab
                </a>
                <button onClick={handleClosePortal} className={styles.closeBtn}>
                  ✕
                </button>
              </div>
            </div>

            {/* Warning / Tip Banner */}
            <div className={styles.modalBanner}>
              ⚠️ <strong>Disclaimer:</strong> This is a secure, direct viewport to the official government results page (
              <a href={activePortal.url} target="_blank" rel="noreferrer" className={styles.modalBannerLink}>
                {activePortal.url}
              </a>
              ). Enter your child's Roll Number or credentials below to retrieve their scores. If the portal is blank, click <strong>Open in New Tab</strong>.
            </div>

            <div className={styles.iframeContainer}>
              {iframeLoading && (
                <div className={styles.iframeLoading}>
                  <div className={styles.spinner} />
                  <span>Establishing secure connection to Board server...</span>
                </div>
              )}
              <iframe
                src={activePortal.url}
                className={styles.iframe}
                onLoad={() => setIframeLoading(false)}
                title={`${activePortal.name} Portal`}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
