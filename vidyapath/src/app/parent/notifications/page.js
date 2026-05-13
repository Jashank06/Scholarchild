'use client';

import { useState, useEffect } from 'react';
import styles from '../../dashboard/home.module.css';
import api from '@/lib/api';

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Notifications 🔔</h1>
        <p style={{ color: '#6B7280' }}>Stay updated with scholarship alerts and child activity.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>No notifications yet</h3>
            <p style={{ color: '#6B7280' }}>We'll notify you when there's something important.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              style={{
                padding: '20px', background: notif.isRead ? 'white' : '#F0F7FF',
                borderRadius: '16px', border: '1px solid',
                borderColor: notif.isRead ? '#E5E7EB' : '#BFDBFE',
                cursor: 'pointer', transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {!notif.isRead && <div style={{ width: '8px', height: '8px', background: '#2563EB', borderRadius: '50%', position: 'absolute', right: '20px', top: '24px' }} />}
              <div style={{ fontWeight: '800', color: '#0B0B1A', marginBottom: '4px', fontSize: '15px' }}>{notif.title}</div>
              <div style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.5' }}>{notif.message}</div>
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '12px', fontWeight: '700' }}>{new Date(notif.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
