'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', featuredImage: '', slug: '',
    categories: '', tags: '', readTime: '5 min read',
    authorName: 'Kushaagra Team', authorAvatar: '', authorBio: '',
    status: 'draft',
  });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBlogs();
      setBlogs(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      title: '', excerpt: '', content: '', featuredImage: '', slug: '',
      categories: '', tags: '', readTime: '5 min read',
      authorName: 'Kushaagra Team', authorAvatar: '', authorBio: '',
      status: 'draft',
    });
    setEditId(null);
  };

  const openEdit = async (id) => {
    try {
      const blog = blogs.find(b => b._id === id);
      if (!blog) return;
      setForm({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImage: blog.featuredImage || '',
        categories: (blog.categories || []).join(', '),
        tags: (blog.tags || []).join(', '),
        readTime: blog.readTime || '5 min read',
        authorName: blog.author?.name || 'Kushaagra Team',
        authorAvatar: blog.author?.avatar || '',
        authorBio: blog.author?.bio || '',
        status: blog.status || 'draft',
      });
      setEditId(id);
      setShowForm(true);
    } catch (e) {
      setMessage({ text: 'Failed to load blog', type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setForm({ ...form, title: value, slug });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage,
        readTime: form.readTime,
        status: form.status,
        categories: form.categories ? form.categories.split(',').map(c => c.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        author: {
          name: form.authorName,
          avatar: form.authorAvatar,
          bio: form.authorBio,
        },
      };

      if (editId) {
        await api.updateBlog(editId, body);
        setMessage({ text: '✅ Blog updated successfully!', type: 'success' });
      } else {
        await api.createBlog(body);
        setMessage({ text: '✅ Blog created successfully!', type: 'success' });
      }
      setShowForm(false);
      resetForm();
      fetchBlogs();
    } catch (e) {
      setMessage({ text: '❌ ' + (e.message || 'Failed to save'), type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return;
    try {
      await api.deleteBlog(id);
      setMessage({ text: '✅ Blog deleted', type: 'success' });
      fetchBlogs();
    } catch (e) {
      setMessage({ text: '❌ ' + (e.message || 'Failed to delete'), type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A' }}>Blog Management 📝</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{
          padding: '12px 24px', background: '#0B0B1A', color: 'white', border: 'none',
          borderRadius: '100px', fontWeight: '800', fontSize: '14px', cursor: 'pointer',
        }}>+ New Blog</button>
      </div>

      {message.text && (
        <div style={{
          padding: '12px', borderRadius: '12px', fontWeight: '700', marginBottom: '20px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
        }}>{message.text}</div>
      )}

      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['Title', 'Author', 'Status', 'Views', 'Likes', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No blogs yet.</td></tr>
            ) : blogs.map((blog) => (
              <tr key={blog._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>{blog.author?.name || 'Team'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: blog.status === 'published' ? '#ECFDF5' : '#FFFBEB',
                    color: blog.status === 'published' ? '#059669' : '#D97706',
                  }}>{blog.status.toUpperCase()}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#9CA3AF' }}>👁️ {blog.viewCount || 0}</td>
                <td style={{ padding: '14px 20px', fontSize: '13px', color: '#9CA3AF' }}>❤️ {blog.likes?.length || 0}</td>
                <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(blog._id)} style={{
                      padding: '6px 12px', background: '#EFF6FF', color: '#2563EB', border: 'none',
                      borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                    }}>Edit</button>
                    <button onClick={() => handleDelete(blog._id)} style={{
                      padding: '6px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none',
                      borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                    }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '40px',
        }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '28px' }}>
              {editId ? 'Edit Blog' : 'Create Blog'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Slug</label>
                  <input name="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', background: '#F9FAFB' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Excerpt</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Content (HTML)</label>
                <textarea name="content" value={form.content} onChange={handleChange} rows={10} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', fontFamily: 'monospace' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Featured Image URL</label>
                  <input name="featuredImage" value={form.featuredImage} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Read Time</label>
                  <input name="readTime" value={form.readTime} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Categories (comma separated)</label>
                  <input name="categories" value={form.categories} onChange={handleChange} placeholder="Scholarships, Competitions" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Author</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input name="authorName" value={form.authorName} onChange={handleChange} placeholder="Author Name" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                  <input name="authorAvatar" value={form.authorAvatar} onChange={handleChange} placeholder="Avatar URL" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
                </div>
                <input name="authorBio" value={form.authorBio} onChange={handleChange} placeholder="Author Bio" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', marginTop: '12px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' }}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={{
                  padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                }}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '14px', background: '#0B0B1A', color: 'white', border: 'none',
                  borderRadius: '14px', fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                }}>{saving ? 'Saving...' : editId ? 'Update Blog' : 'Create Blog'}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{
                  flex: 1, padding: '14px', background: '#F3F4F6', color: '#6B7280', border: 'none',
                  borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
