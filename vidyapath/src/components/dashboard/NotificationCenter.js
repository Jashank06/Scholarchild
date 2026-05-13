'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import gsap from 'gsap';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.request('/notifications');
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current, 
        { opacity: 0, y: 10, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.request(`/notifications/${notif._id}/read`, { method: 'PUT' });
        fetchNotifications();
      }
      setIsOpen(false);
      if (notif.link) router.push(notif.link);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.request('/notifications/read-all', { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer',
          padding: '10px', borderRadius: '12px', transition: 'background 0.2s',
          position: 'relative'
        }}
        onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
        onMouseLeave={(e) => e.target.style.background = 'none'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            background: '#EF4444', color: 'white', fontSize: '10px',
            fontWeight: '900', padding: '2px 6px', borderRadius: '100px',
            border: '2px solid white'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute', top: '60px', right: '0', width: '360px',
            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Notifications</h3>
            <button 
              onClick={markAllRead}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Mark all read
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '16px 20px', borderBottom: '1px solid #F8FAFC',
                    cursor: 'pointer', transition: 'background 0.2s',
                    background: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)',
                    display: 'flex', gap: '16px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)'}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: n.isRead ? '#F1F5F9' : '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                  }}>
                    {n.icon || (n.type === 'deadline' ? '⏰' : n.type === 'achievement' ? '🏅' : '🔔')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', marginTop: '6px' }}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
