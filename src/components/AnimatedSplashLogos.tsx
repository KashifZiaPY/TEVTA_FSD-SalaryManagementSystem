import React, { useState, useEffect } from 'react';
import { PunjabGovtEmblem, TevtaEmblem } from './Emblems';

export interface AnimatedSplashLogosProps {
  punjabLogo?: string | null;
  gvtiwLogo?: string | null; // Kept for backwards compatibility
  tevtaLogo?: string | null;
  darkMode?: boolean;
  statusMessage?: string;
  officeName?: string;
  instituteName?: string; // Kept for backwards compatibility
  isFullPage?: boolean;
  onSkip?: () => void;
  className?: string;
}

export const AnimatedSplashLogos: React.FC<AnimatedSplashLogosProps> = ({
  punjabLogo,
  gvtiwLogo,
  tevtaLogo,
  darkMode = true,
  statusMessage,
  officeName,
  instituteName,
  isFullPage = true,
  onSkip,
  className = '',
}) => {
  const [punjabFailed, setPunjabFailed] = useState(false);
  const [tevtaFailed, setTevtaFailed] = useState(false);

  // Default entity title for District Director Office
  const displayTitle = officeName || instituteName || 'District Director Office TEVTA Faisalabad & Chiniot';

  // Dynamic status messages sequence tailored to TEVTA District Director Office
  const [statusIndex, setStatusIndex] = useState(0);
  const defaultStatusList = [
    statusMessage || 'Initializing e-Salary Management System...',
    'Connecting to District Director Office TEVTA Faisalabad & Chiniot...',
    'Synchronizing Faisalabad & Chiniot Institutes...',
    'Auditing Daily Wages & Visiting Faculty Claims...',
    'Verifying Bank of Punjab (BOP) Disbursement Pipeline...',
    'e-Salary Management System developed by MKZ • Ready v1.0',
  ];

  useEffect(() => {
    if (statusMessage) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % defaultStatusList.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [statusMessage, defaultStatusList.length]);

  const currentStatusText = statusMessage || defaultStatusList[statusIndex];
  const pbLogoSrc = punjabLogo || gvtiwLogo || '/gop-logo.png';
  const tvLogoSrc = tevtaLogo || '/tevta-logo.png';

  const coreContent = (
    <div className={`relative flex flex-col items-center justify-center text-center font-sans ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. DUAL LOGO DISPLAY WITH HALOS AND CONNECTING SYNC ANIMATION */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex items-center justify-center my-4 select-none">
        
        {/* Ambient background soft glow */}
        <div className="absolute w-72 sm:w-96 h-36 bg-emerald-600/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* LEFT: Government of the Punjab Circular Logo with Emerald Green Halo */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 flex items-center justify-center">
            {/* Soft Breathing Ambient Glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-500/25 blur-xl splash-halo-pulse pointer-events-none" />

            {/* Slow Rotating Emerald Green Halo Ring */}
            <svg
              className="absolute -inset-2 sm:-inset-2.5 w-[calc(100%+16px)] sm:w-[calc(100%+20px)] h-[calc(100%+16px)] sm:h-[calc(100%+20px)] splash-rotate-cw pointer-events-none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="punjabHaloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#059669" stopOpacity="0.75" />
                  <stop offset="75%" stopColor="#34d399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#punjabHaloGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="175 95"
              />
            </svg>

            {/* Subtle Circular Frame */}
            <div
              className={`relative w-full h-full rounded-full p-2 sm:p-2.5 flex items-center justify-center overflow-hidden transition-all ${
                darkMode
                  ? 'bg-white border border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.25)]'
                  : 'bg-white border border-emerald-400/40 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              }`}
            >
              {!punjabFailed ? (
                <img
                  src={pbLogoSrc}
                  alt="Government of the Punjab Logo"
                  className="w-full h-full object-contain rounded-full"
                  onError={() => setPunjabFailed(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <PunjabGovtEmblem className="w-full h-full" />
              )}
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider mt-2.5 text-emerald-600 dark:text-emerald-400">
            GOVT. OF PUNJAB
          </span>
        </div>

        {/* CENTER: Dynamic Linking Sync Beam Line */}
        <div className="relative w-16 sm:w-28 md:w-36 h-3 mx-2 sm:mx-4 flex items-center justify-center overflow-visible">
          {/* Base hairline track */}
          <div
            className={`w-full h-0.5 rounded-full ${
              darkMode ? 'bg-slate-700/60' : 'bg-slate-300'
            }`}
          />
          {/* Moving reciprocating laser pulse */}
          <div className="absolute h-1 w-7 sm:w-10 rounded-full splash-sync-beam" />
        </div>

        {/* RIGHT: TEVTA Circular Logo with Blue Halo */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 flex items-center justify-center">
            {/* Soft Breathing Ambient Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-500/25 blur-xl splash-halo-pulse pointer-events-none" />

            {/* Slow Rotating Blue Halo Ring */}
            <svg
              className="absolute -inset-2 sm:-inset-2.5 w-[calc(100%+16px)] sm:w-[calc(100%+20px)] h-[calc(100%+16px)] sm:h-[calc(100%+20px)] splash-rotate-ccw pointer-events-none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="tevtaHaloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#tevtaHaloGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="175 95"
              />
            </svg>

            {/* Subtle Circular Frame */}
            <div
              className={`relative w-full h-full rounded-full p-2 sm:p-2.5 flex items-center justify-center overflow-hidden transition-all ${
                darkMode
                  ? 'bg-white border border-blue-500/30 shadow-[0_4px_24px_rgba(37,99,235,0.25)]'
                  : 'bg-white border border-blue-400/40 shadow-[0_4px_20px_rgba(37,99,235,0.15)]'
              }`}
            >
              {!tevtaFailed ? (
                <img
                  src={tvLogoSrc}
                  alt="TEVTA Punjab Logo"
                  className="w-full h-full object-contain rounded-full"
                  onError={() => setTevtaFailed(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <TevtaEmblem className="w-full h-full" />
              )}
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider mt-2.5 text-blue-600 dark:text-blue-400">
            TEVTA PUNJAB
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. ENTITY NAME & EXECUTIVE TITLES (FADE-IN)                   */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-5 max-w-xl px-4 flex flex-col items-center splash-fade-in">
        <h1
          className={`text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wide transition-colors text-center ${
            darkMode ? 'text-white drop-shadow-sm' : 'text-slate-900'
          }`}
        >
          {displayTitle}
        </h1>
        <p
          className={`text-[11px] sm:text-xs font-medium tracking-wide mt-1 transition-colors text-center ${
            darkMode ? 'text-blue-300/80' : 'text-blue-800'
          }`}
        >
          Technical Education & Vocational Training Authority (TEVTA), Govt. of the Punjab
        </p>

        <div className="mt-3 inline-block">
          <h2
            className={`text-xs sm:text-sm font-black tracking-widest uppercase px-3.5 py-1.5 rounded-lg transition-colors text-center ${
              darkMode
                ? 'bg-blue-950/60 text-blue-200 border border-blue-800/40 shadow-inner'
                : 'bg-blue-50 text-blue-900 border border-blue-200/80'
            }`}
          >
            e-SALARY MANAGEMENT SYSTEM v1.0
          </h2>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. RESTYLED PROFESSIONAL LOADING STATUS CONTAINER             */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2.5 shadow-md border transition-all ${
              darkMode
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-black/40'
                : 'bg-white border-slate-300/90 text-slate-700 shadow-slate-200/60'
            }`}
          >
            {/* Pulsing Status Dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            {/* Active Status Text */}
            <span className="text-xs font-mono font-medium tracking-wide whitespace-nowrap">
              {currentStatusText}
            </span>
          </div>

          {/* Hairline Shimmer Progress Line */}
          <div
            className={`w-48 sm:w-56 h-1 rounded-full overflow-hidden relative ${
              darkMode ? 'bg-slate-800/90' : 'bg-slate-200'
            }`}
          >
            <div className="absolute inset-y-0 w-24 rounded-full splash-shimmer-bar" />
          </div>

          {onSkip && (
            <button
              onClick={onSkip}
              className="mt-3 text-[11px] text-slate-400 hover:text-slate-200 underline decoration-dotted transition-colors cursor-pointer"
            >
              Skip to Workspace →
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. PROFESSIONAL CREDIT LINE TAGLINE                           */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`mt-7 pt-3.5 border-t w-full max-w-lg text-[11px] sm:text-xs font-mono tracking-wide select-none transition-colors text-center ${
            darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}
        >
          e-Salary Management System developed by <span className="font-bold text-amber-400">MKZ</span> for District Director Office TEVTA Faisalabad & Chiniot <span className="font-semibold text-blue-400">v1.0</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. EMBEDDED HIGH-PERFORMANCE CSS KEYFRAMES                    */}
      {/* ------------------------------------------------------------- */}
      <style>{`
        /* Smooth Slow Clockwise Halo Rotation (6.8s) */
        @keyframes splashRotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Smooth Slow Counter-Clockwise Halo Rotation (6.8s) */
        @keyframes splashRotateCCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        /* Calm Breathing Halo Glow (3.2s) */
        @keyframes splashHaloPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.75;
          }
        }
        /* Back-and-forth reciprocating sync beam between Govt of Punjab and TEVTA (2.6s) */
        @keyframes splashSyncBeam {
          0% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(90deg, #10b981, #38bdf8);
            opacity: 0.6;
          }
          50% {
            left: 100%;
            transform: translateX(-100%);
            background: linear-gradient(90deg, #38bdf8, #2563eb);
            opacity: 1;
          }
          100% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(90deg, #10b981, #38bdf8);
            opacity: 0.6;
          }
        }
        /* Gentle Shimmer Bar Progress (1.8s) */
        @keyframes splashShimmer {
          0% {
            left: -40%;
            background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          }
          100% {
            left: 120%;
            background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          }
        }
        /* Entrance Fade-In */
        @keyframes splashFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .splash-rotate-cw {
          animation: splashRotateCW 6.8s linear infinite;
          will-change: transform;
        }
        .splash-rotate-ccw {
          animation: splashRotateCCW 6.8s linear infinite;
          will-change: transform;
        }
        .splash-halo-pulse {
          animation: splashHaloPulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .splash-sync-beam {
          animation: splashSyncBeam 2.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: left, transform;
        }
        .splash-shimmer-bar {
          animation: splashShimmer 1.8s ease-in-out infinite;
          will-change: left;
        }
        .splash-fade-in {
          animation: splashFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );

  if (!isFullPage) {
    return coreContent;
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-200 select-none ${
        darkMode
          ? 'bg-[#020617] text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Subtle radial ambient background light */}
      <div
        className={`absolute inset-0 pointer-events-none -z-10 ${
          darkMode
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#020617] to-[#020617]'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-100'
        }`}
      />
      {coreContent}
    </div>
  );
};
