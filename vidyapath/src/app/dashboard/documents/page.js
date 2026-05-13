'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import gsap from 'gsap';

const CATEGORIES = [
  { id: 'aadhaar', name: 'Aadhaar Card', icon: '🆔', type: 'Identity' },
  { id: 'marksheet_9', name: 'Grade 9 Marksheet', icon: '📄', type: 'Academic' },
  { id: 'marksheet_10', name: 'Grade 10 Marksheet', icon: '📄', type: 'Academic' },
  { id: 'marksheet_11', name: 'Grade 11 Marksheet', icon: '📄', type: 'Academic' },
  { id: 'marksheet_12', name: 'Grade 12 Marksheet', icon: '📄', type: 'Academic' },
  { id: 'income_cert', name: 'Income Certificate', icon: '💰', type: 'Financial' },
  { id: 'domicile', name: 'Domicile Certificate', icon: '🏠', type: 'Residence' },
  { id: 'photo', name: 'Passport Size Photo', icon: '📷', type: 'Photo' },
  { id: 'other', name: 'Other Document', icon: '📁', type: 'Misc' },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ type: 'aadhaar', file: null });
  const containerRef = useRef(null);

  const fetchDocs = async () => {
    try {
      const res = await api.request('/documents');
      if (res.success) setDocs(res.data);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const q = gsap.utils.selector(containerRef.current);
      gsap.fromTo(q('.doc-card'), 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return alert('Please select a file');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('type', uploadData.type);
    formData.append('name', CATEGORIES.find(c => c.id === uploadData.type).name);

    try {
      const res = await api.uploadDocument(formData);
      if (res.success) {
        setShowModal(false);
        setUploadData({ type: 'aadhaar', file: null });
        fetchDocs();
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.request(`/documents/${id}`, { method: 'DELETE' });
      setDocs(docs.filter(d => d._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="doc-page" ref={containerRef} style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>📁 Document Vault</h1>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Securely store and manage all your documents. Upload once, use everywhere.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 28px', background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 100%)',
            color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span>📤</span> Upload Document
        </button>
      </div>

      {docs.length === 0 ? (
        <div style={{ 
          padding: '100px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', 
          borderRadius: '40px', border: '2px dashed #E2E8F0' 
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛡️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Your Vault is Empty</h2>
          <p style={{ color: '#64748B', marginBottom: '32px' }}>Start uploading your documents to keep them safe and ready for applications.</p>
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: '12px 32px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}
          >
            Get Started →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {docs.map((doc, i) => {
            const cat = CATEGORIES.find(c => c.id === doc.type) || CATEGORIES[8];
            return (
              <div key={doc._id} className="doc-card glass-card" style={{ 
                padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' 
              }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '18px', background: '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>{doc.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{cat.type} • {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '9px', fontWeight: '900', padding: '4px 10px', borderRadius: '100px',
                    background: doc.verified ? '#ECFDF5' : '#FFFBEB',
                    color: doc.verified ? '#059669' : '#D97706',
                    textTransform: 'uppercase', textAlign: 'center'
                  }}>
                    {doc.verified ? 'Verified' : 'Pending'}
                  </span>
                  <button 
                    onClick={() => handleDelete(doc._id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer', padding: '4px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', background: 'white' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Upload Document</h2>
            <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '14px' }}>Choose a category and select your file (PDF, JPG, PNG).</p>
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Document Type</label>
                <select 
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }}
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select File</label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                  style={{ width: '100%', padding: '12px', background: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '16px', background: '#F1F5F9', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  style={{ 
                    flex: 2, padding: '14px', borderRadius: '16px', background: 'var(--vibrant-primary)', 
                    color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer',
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  {uploading ? 'Uploading...' : 'Start Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          transform: translateY(-4px);
          border-color: #2563EB;
          box-shadow: 0 30px 60px -12px rgba(37, 99, 235, 0.15);
        }
      `}</style>
    </div>
  );
}
