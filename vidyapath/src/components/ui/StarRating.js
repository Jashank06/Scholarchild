'use client';

export default function StarRating({ rating, size = 20, interactive = false, onChange = () => {} }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onClick={() => interactive && onChange(i)}
          style={{
            fontSize: `${size}px`,
            color: i <= Math.round(rating) ? '#FBBF24' : '#D1D5DB',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.2s ease',
            transform: interactive && i === Math.round(rating) ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}