'use client';

import { useState } from 'react';
import styles from './FilterBar.module.css';
import {
  INDIAN_STATES, CASTE_CATEGORIES, GENDER_OPTIONS, INCOME_SLABS,
  ORGANIZER_TYPES, LEVELS, REWARD_TYPES, MODE_OPTIONS,
  SORT_OPTIONS, DEADLINE_FILTERS, ALL_GRADES,
} from '@/lib/constants';

const filterConfig = {
  scholarship: {
    extraFilters: ['gender', 'categories', 'maxIncome', 'organizerType', 'rewardType', 'deadline'],
    showState: true,
    showGrade: true,
    showFree: true,
  },
  competition: {
    extraFilters: ['level', 'mode', 'organizerType', 'rewardType', 'deadline'],
    showState: false,
    showGrade: true,
    showFree: true,
  },
  scheme: {
    extraFilters: ['gender', 'categories', 'maxIncome', 'organizerType', 'deadline'],
    showState: true,
    showGrade: true,
    showFree: false,
  },
};

export default function FilterBar({
  type = 'scholarship',
  filters = {},
  onChange,
  onReset,
  categories = [],
  activeCategory = 'All',
  onCategoryChange,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const cfg = filterConfig[type] || filterConfig.scholarship;
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  const activeChips = [];
  if (filters.search) activeChips.push({ key: 'search', label: `"${filters.search}"` });
  if (filters.grade) activeChips.push({ key: 'grade', label: `Grade ${filters.grade}` });
  if (filters.state) activeChips.push({ key: 'state', label: filters.state });
  if (filters.gender && filters.gender !== 'all') activeChips.push({ key: 'gender', label: filters.gender === 'male' ? 'Male' : 'Female' });
  if (filters.categories) activeChips.push({ key: 'categories', label: filters.categories });
  if (filters.maxIncome) {
    const slab = INCOME_SLABS.find(s => s.value === filters.maxIncome);
    if (slab) activeChips.push({ key: 'maxIncome', label: slab.label });
  }
  if (filters.organizerType) activeChips.push({ key: 'organizerType', label: ORGANIZER_TYPES.find(o => o.value === filters.organizerType)?.label });
  if (filters.level) activeChips.push({ key: 'level', label: LEVELS.find(l => l.value === filters.level)?.label });
  if (filters.mode) activeChips.push({ key: 'mode', label: MODE_OPTIONS.find(m => m.value === filters.mode)?.label });
  if (filters.rewardType) activeChips.push({ key: 'rewardType', label: REWARD_TYPES.find(r => r.value === filters.rewardType)?.label });
  if (filters.deadline === 'urgent') activeChips.push({ key: 'deadline', label: 'Urgent' });
  if (filters.deadline === 'upcoming') activeChips.push({ key: 'deadline', label: 'Upcoming' });
  if (filters.free === 'true') activeChips.push({ key: 'free', label: 'Free Only' });

  const handleChange = (key, value) => {
    onChange(key, value || '');
  };

  return (
    <div className={styles.wrapper}>
      {/* Row 1: Categories */}
      {categories.length > 0 && (
        <div className={styles.tabPills}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Row 2: Search + Sort + Toggle */}
      <div className={styles.primaryRow}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${type}s...`}
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
          />
          {filters.search && (
            <button className={styles.clearSearch} onClick={() => handleChange('search', '')}>✕</button>
          )}
        </div>

        <select
          className={styles.filterSelect}
          value={filters.sort || 'deadline'}
          onChange={e => handleChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          className={`${styles.toggleBtn} ${showAdvanced || hasActiveFilters ? styles.active : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>⚙️</span> Filters
          {hasActiveFilters && <span className={styles.countBadge}>{activeChips.length}</span>}
        </button>

        {hasActiveFilters && (
          <button className={styles.resetBtn} onClick={onReset}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Row 3: Advanced Filters (collapsible) */}
      {showAdvanced && (
        <div className={styles.advancedRow}>
          {cfg.showGrade && (
            <select className={styles.filterSelect} value={filters.grade || ''} onChange={e => handleChange('grade', e.target.value)}>
              <option value="">All Grades</option>
              {ALL_GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          )}

          {cfg.showState && (
            <select className={styles.filterSelect} value={filters.state || ''} onChange={e => handleChange('state', e.target.value)}>
              <option value="">All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('gender') && (
            <select className={styles.filterSelect} value={filters.gender || 'all'} onChange={e => handleChange('gender', e.target.value)}>
              {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('categories') && (
            <select className={styles.filterSelect} value={filters.categories || ''} onChange={e => handleChange('categories', e.target.value)}>
              <option value="">All Categories</option>
              {CASTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('maxIncome') && (
            <select className={styles.filterSelect} value={filters.maxIncome || ''} onChange={e => handleChange('maxIncome', e.target.value)}>
              <option value="">All Income</option>
              {INCOME_SLABS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('organizerType') && (
            <select className={styles.filterSelect} value={filters.organizerType || ''} onChange={e => handleChange('organizerType', e.target.value)}>
              <option value="">All Organizers</option>
              {ORGANIZER_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('level') && (
            <select className={styles.filterSelect} value={filters.level || ''} onChange={e => handleChange('level', e.target.value)}>
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('mode') && (
            <select className={styles.filterSelect} value={filters.mode || ''} onChange={e => handleChange('mode', e.target.value)}>
              <option value="">All Modes</option>
              {MODE_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('rewardType') && (
            <select className={styles.filterSelect} value={filters.rewardType || ''} onChange={e => handleChange('rewardType', e.target.value)}>
              <option value="">All Rewards</option>
              {REWARD_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          )}

          {cfg.extraFilters.includes('deadline') && (
            <select className={styles.filterSelect} value={filters.deadline || ''} onChange={e => handleChange('deadline', e.target.value)}>
              {DEADLINE_FILTERS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          )}

          {cfg.showFree && (
            <label className={styles.freeToggle}>
              <input
                type="checkbox"
                checked={filters.free === 'true'}
                onChange={e => handleChange('free', e.target.checked ? 'true' : '')}
              />
              <span>Free Only</span>
            </label>
          )}
        </div>
      )}

      {/* Row 4: Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className={styles.chipsRow}>
          {activeChips.map(chip => (
            <span key={chip.key} className={styles.chip}>
              {chip.label}
              <button className={styles.chipRemove} onClick={() => handleChange(chip.key, '')}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
