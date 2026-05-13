'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function InstitutionStudentsPage() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setUser(me.user);
        // Students would come from managedStudents or via school enrollment
        setStudents([]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Students 👩‍🎓</h1>
          <p style={{ color: '#6B7280' }}>Manage your enrolled students and track their progress.</p>
        </div>
        <button style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>
          + Invite Students
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '32px' }}>
        <input type="text" placeholder="Search students by name, grade..."
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
        />
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '24px',
          padding: '80px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👩‍🎓</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px' }}>
            No students enrolled yet
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Invite students to join your institution on Kushaagra. They'll be able to discover scholarships matched to your school.
          </p>
          <button style={{
            padding: '14px 36px', background: '#2563EB', color: 'white',
            border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            fontSize: '15px',
          }}>
            Invite via Email →
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Student</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Grade</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Applications</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Profile Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700' }}>{s.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{s.grade}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{s.apps || 0}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>{s.profileScore || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
