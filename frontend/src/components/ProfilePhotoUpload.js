import { useState, useRef } from 'react';
import { api } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import { Camera, Loader2, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePhotoUpload({ user, onUploaded, targetUserId = null }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError('');
    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = targetUserId
        ? `${API}/profile/photo/${targetUserId}`
        : `${API}/profile/photo`;
      await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      if (onUploaded) onUploaded();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUser = preview
    ? { ...user, profile_photo_url: null }
    : user;

  return (
    <div className="flex items-center gap-4" data-testid="profile-photo-upload">
      <div className="relative group">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <UserAvatar user={displayUser} size="xl" />
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
          data-testid="photo-upload-trigger"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : success ? (
              <Check size={18} className="text-white" />
            ) : (
              <Camera size={18} className="text-white" />
            )}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          data-testid="photo-file-input"
        />
      </div>
      <div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-sm text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors"
          data-testid="change-photo-btn"
        >
          {uploading ? 'Uploading...' : user?.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
        </button>
        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
        {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
      </div>
    </div>
  );
}
