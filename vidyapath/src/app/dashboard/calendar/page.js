'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' },
  h1: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  sub: { fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '4px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)' },
  calCard: { padding: 'var(--space-6)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' },
  monthHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' },
  monthTitle: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: '700' },
  navBtn: { width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 'var(--text-sm)' },
  dayNames: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: 'var(--space-2)' },
  dayName: { textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: 'var(--space-2)' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
  day: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' },
  eventDot: { width: '5px', height: '5px', borderRadius: '50%', position: 'absolute', bottom: '4px' },
  eventsCard: { padding: 'var(--space-6)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' },
  eventTitle: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-4)' },
  eventList: { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' },
  eventItem: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--surface-800)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' },
  eventColorDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-primary)' },
  eventDate: { fontSize: '11px', color: 'var(--text-muted)' },
  eventType: { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026 for demo consistency

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [oppsRes, appsRes] = await Promise.all([
          api.getOpportunities({ limit: 100 }),
          api.getApplications()
        ]);

        const newEvents = [];
        const opps = oppsRes.data || [];
        const apps = appsRes.data || [];

        opps.forEach(opp => {
          if (opp.dates?.applicationDeadline) {
            newEvents.push({
              date: new Date(opp.dates.applicationDeadline),
              title: `${opp.title} Deadline`,
              type: 'deadline',
              color: 'var(--error)'
            });
          }
          if (opp.dates?.examDate) {
            newEvents.push({
              date: new Date(opp.dates.examDate),
              title: `${opp.title} Exam`,
              type: 'exam',
              color: 'var(--primary-500)'
            });
          }
          if (opp.dates?.resultDate) {
            newEvents.push({
              date: new Date(opp.dates.resultDate),
              title: `${opp.title} Result`,
              type: 'result',
              color: 'var(--success)'
            });
          }
        });

        // Filter events for the current month
        setEvents(newEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const daysInMonth = 31;
  const startDay = 5; // May 2026 starts on Friday
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getEventsForDay = (day) => {
    return events.filter(e => e.date.getDate() === day && e.date.getMonth() === 4); // May
  };

  const upcomingEvents = [...events]
    .sort((a, b) => a.date - b.date)
    .filter(e => e.date >= new Date(2026, 4, 1))
    .slice(0, 8);

  return (
    <div style={s.page}>
      <div><h1 style={s.h1}>📅 Calendar</h1><p style={s.sub}>Track all your deadlines, exams, and result dates</p></div>

      <div style={s.layout}>
        <div style={s.calCard}>
          <div style={s.monthHeader}>
            <button style={s.navBtn}>←</button>
            <span style={s.monthTitle}>May 2026</span>
            <button style={s.navBtn}>→</button>
          </div>
          <div style={s.dayNames}>
            {dayNames.map(d => <div key={d} style={s.dayName}>{d}</div>)}
          </div>
          <div style={s.daysGrid}>
            {Array.from({ length: startDay }, (_, i) => <div key={`e${i}`} style={s.day}></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 1 && currentDate.getMonth() === 4;
              return (
                <div key={day} style={{
                  ...s.day,
                  background: isToday ? 'var(--gradient-primary)' : dayEvents.length > 0 ? 'var(--surface-800)' : 'transparent',
                  color: isToday ? 'white' : 'var(--text-secondary)',
                  fontWeight: dayEvents.length > 0 ? '700' : '400',
                }}>
                  {day}
                  {dayEvents.map((ev, idx) => (
                    <span key={idx} style={{ ...s.eventDot, background: ev.color, bottom: 4 + (idx * 4) }}></span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div style={s.eventsCard}>
          <h3 style={s.eventTitle}>📌 Upcoming Events</h3>
          <div style={s.eventList}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading events...</div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming events found.</div>
            ) : (
              upcomingEvents.map((e, i) => (
                <div key={i} style={s.eventItem}>
                  <span style={{ ...s.eventColorDot, background: e.color }}></span>
                  <div style={s.eventInfo}>
                    <div style={s.eventName}>{e.title}</div>
                    <div style={s.eventDate}>{e.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <span style={{
                    ...s.eventType,
                    background: e.type === 'deadline' ? 'var(--error-light)' : e.type === 'exam' ? 'var(--info-light)' : 'var(--success-light)',
                    color: e.type === 'deadline' ? 'var(--error)' : e.type === 'exam' ? 'var(--info)' : 'var(--success)',
                  }}>
                    {e.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
