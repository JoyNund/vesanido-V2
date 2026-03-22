import React from 'react';

interface AvatarProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ seed, size = 'md', className = '' }) => {
  // Using DiceBear Identicon for that "generated/anonymous" digital look
  const src = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=262626&rowColor=ff0055`;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`rounded-sm overflow-hidden bg-vesanico-panel border border-vesanico-muted/30 ${sizeClasses[size]} ${className}`}>
      <img src={src} alt="avatar" className="w-full h-full object-cover opacity-80" />
    </div>
  );
};

export default Avatar;