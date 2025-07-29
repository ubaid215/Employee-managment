import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

const UserAvatar = ({ className }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profilePicture) {
      // Check if it's a new upload (could be a File object or data URL)
      if (user.profilePicture instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarUrl(e.target.result);
          setLoading(false);
        };
        reader.readAsDataURL(user.profilePicture);
      } else {
        // Handle case where it's already a URL string
        // Add timestamp to prevent caching of old images
        setAvatarUrl(`${user.profilePicture}?${new Date().getTime()}`);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user?.profilePicture]); // Re-run when profilePicture changes

  const getInitials = () => {
    if (!user?.name) return '';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className={`${className} rounded-full bg-gray-200 animate-pulse`}></div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white ${className}`}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={user?.name || 'User'} 
          className="w-full h-full rounded-full object-cover"
          onError={() => setAvatarUrl(null)} // Fallback if image fails to load
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {getInitials() ? (
            <span className="font-medium text-sm">{getInitials()}</span>
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </div>
      )}
      
      {/* Online status indicator */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
    </div>
  );
};

export default UserAvatar;