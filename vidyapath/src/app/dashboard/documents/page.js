/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const fileIcon = (item) => {
  if (item.type === 'folder') return '�';
  if (item.mimeType?.includes('pdf')) return '📄';
  if (item.mimeType?.includes('image')) return '�️';
  return '�';
};

export default function DocumentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);
  const [folderName, setFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadItems = async (parentId) => {
    setLoading(true);
    try {
      const res = await api.getFileNodes({ parentId: parentId || 'root' });
      setItems(res.data || []);
      setMessage({ text: '', type: '' });
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Failed to load files', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(currentFolder);
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setMessage({ text: 'Folder name required', type: 'error' });
      return;
    }
    if (creating) return;
    setCreating(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticFolder = {
      _id: tempId,
      name: folderName.trim(),
      type: 'folder',
    };
    setItems((prev) => [optimisticFolder, ...prev]);
    try {
      await api.createFolder({ name: folderName.trim(), parentId: currentFolder || null });
      setFolderName('');
      await loadItems(currentFolder);
      setMessage({ text: 'Folder created', type: 'success' });
    } catch (error) {
      console.error(error);
      setItems((prev) => prev.filter((item) => item._id !== tempId));
      setMessage({ text: error.message || 'Failed to create folder', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentId', currentFolder || '');
      await api.uploadFileNode(formData);
      await loadItems(currentFolder);
      setMessage({ text: 'File uploaded', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleOpen = (item) => {
    if (item.type === 'folder') {
      setCurrentFolder(item._id);
      setBreadcrumbs((prev) => [...prev, { id: item._id, name: item.name }]);
      return;
    }
    const url = api.getImageUrl(item.url);
    if (url) window.open(url, '_blank');
  };

  const handleBreadcrumb = (crumb, index) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolder(crumb.id);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await api.deleteFileNode(item._id);
      await loadItems(currentFolder);
      setMessage({ text: 'Deleted successfully', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Delete failed', type: 'error' });
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Files & Folders 🗂️</h1>
      <p style={{ color: '#6B7280', marginBottom: '28px' }}>Store and organize your documents just like a drive.</p>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '14px',
          marginBottom: '18px',
          fontWeight: '700',
          fontSize: '13px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
        }}>{message.text}</div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {breadcrumbs.map((crumb, index) => (
          <button
            key={crumb.id || 'root'}
            onClick={() => handleBreadcrumb(crumb, index)}
            style={{
              border: 'none',
              background: index === breadcrumbs.length - 1 ? '#2563EB' : '#F3F4F6',
              color: index === breadcrumbs.length - 1 ? 'white' : '#6B7280',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            {crumb.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="New folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
          style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '12px', minWidth: '220px' }}
        />
        <button
          onClick={handleCreateFolder}
          disabled={creating || !folderName.trim()}
          style={{ padding: '10px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '800', cursor: 'pointer' }}
        >
          {creating ? 'Creating...' : 'Create Folder'}
        </button>
        <label style={{ padding: '10px 16px', background: '#0F172A', color: 'white', borderRadius: '999px', fontWeight: '800', cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>Loading files...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280', border: '1px dashed #E5E7EB', borderRadius: '18px' }}>
          No files or folders here yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
          {items.map((item) => (
            <div key={item._id} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '24px' }}>{fileIcon(item)}</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0B0B1A' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.type === 'folder' ? 'Folder' : `${Math.round((item.size || 0) / 1024)} KB`}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => handleOpen(item)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '999px', border: 'none', background: '#EEF2FF', color: '#4F46E5', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                >
                  {item.type === 'folder' ? 'Open' : 'Preview'}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '999px', border: 'none', background: '#FEE2E2', color: '#EF4444', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
