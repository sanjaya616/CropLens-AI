import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

/**
 * Renders a private assessment leaf image by fetching it with the Bearer authorization header.
 * Eliminates query string tokens to prevent leakage in browser history, proxy logs, and referrers.
 */
export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackIcon,
}) => {
  const { token } = useAuth();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (!src || !token) {
      setLoading(false);
      setHasError(true);
      return;
    }

    setLoading(true);
    setHasError(false);

    // Clean any legacy query token that might be passed
    const cleanUrl = src.split('?')[0];

    fetch(cleanUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load image (${res.status})`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[AuthenticatedImage] Error loading private image:', err.message);
        setHasError(true);
        setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src, token]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 animate-pulse text-stone-400">
        <Sprout className="w-8 h-8 opacity-40" />
      </div>
    );
  }

  if (hasError || !objectUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
        {fallbackIcon || <Sprout className="w-10 h-10 opacity-50" />}
      </div>
    );
  }

  return <img src={objectUrl} alt={alt} className={className} />;
};
