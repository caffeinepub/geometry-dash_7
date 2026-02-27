import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { Gamepad2, Trophy, Users, Edit3, LogIn, LogOut, User } from 'lucide-react';

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const location = useLocation();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/levels', label: 'LEVELS', icon: <Gamepad2 size={12} /> },
    { to: '/editor', label: 'EDITOR', icon: <Edit3 size={12} /> },
    { to: '/community', label: 'COMMUNITY', icon: <Users size={12} /> },
    { to: '/leaderboard', label: 'SCORES', icon: <Trophy size={12} /> },
  ];

  return (
    <header className="bg-background border-b-4 border-neon-green shadow-[0_4px_0px_rgba(0,0,0,0.8),0_0_20px_rgba(57,255,20,0.15)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/assets/generated/logo.dim_512x128.png"
            alt="Pixel Dash"
            className="h-8 w-auto"
            style={{ imageRendering: 'pixelated' }}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-neon-green font-pixel text-[10px] hidden sm:block" style={{ textShadow: '0 0 10px rgba(57,255,20,0.8)' }}>
            PIXEL DASH
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1 px-2 py-1 text-[8px] font-pixel transition-all whitespace-nowrap border-2 ${
                  isActive
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-transparent text-muted-foreground hover:text-neon-green hover:border-neon-green/50'
                }`}
              >
                {link.icon}
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-1 text-[8px] font-pixel text-neon-cyan">
              <User size={10} />
              <span>{userProfile.username}</span>
            </div>
          )}
          <button
            onClick={handleAuth}
            disabled={isLoggingIn}
            className={`flex items-center gap-1 px-3 py-1 text-[8px] font-pixel border-2 transition-all ${
              isAuthenticated
                ? 'border-destructive text-destructive hover:bg-destructive hover:text-foreground'
                : 'border-neon-green text-neon-green hover:bg-neon-green hover:text-background'
            } disabled:opacity-50`}
          >
            {isLoggingIn ? (
              <span className="animate-pixel-pulse">...</span>
            ) : isAuthenticated ? (
              <><LogOut size={10} /><span className="hidden sm:inline">LOGOUT</span></>
            ) : (
              <><LogIn size={10} /><span className="hidden sm:inline">LOGIN</span></>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
