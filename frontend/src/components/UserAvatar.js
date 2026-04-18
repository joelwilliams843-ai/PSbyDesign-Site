import { useState } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

function getToken() {
  try { return localStorage.getItem('clarity_token'); } catch { return null; }
}

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const sizeClass = sizes[size] || sizes.md;
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const isAdmin = user?.role === 'admin';
  const bgColor = isAdmin ? 'bg-[#0B7A6F]' : 'bg-[#0F2B3C]';

  const hasPhoto = user?.profile_photo_url && !imgError;

  // Build the full image URL with auth token
  const photoUrl = hasPhoto
    ? `${API}${user.profile_photo_url}?t=${Date.now()}`
    : null;

  const token = getToken();

  if (hasPhoto && photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user?.name || 'Profile'}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
        onError={() => setImgError(true)}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        // Use fetch with auth header via a blob URL approach
        ref={(el) => {
          if (el && token && !el.dataset.loaded) {
            el.dataset.loaded = 'true';
            fetch(photoUrl, { headers: { Authorization: `Bearer ${token}` } })
              .then(r => { if (r.ok) return r.blob(); throw new Error('fail'); })
              .then(blob => { el.src = URL.createObjectURL(blob); })
              .catch(() => setImgError(true));
          }
        }}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full ${bgColor} flex items-center justify-center text-white font-semibold shrink-0 ${className}`}>
      {initial}
    </div>
  );
}
