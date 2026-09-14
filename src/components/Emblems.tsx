import React, { useState } from 'react';

export const PunjabGovtEmblem: React.FC<{ className?: string; src?: string }> = ({
  className = 'w-10 h-10',
  src,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const logoSource = src || '/gop-logo.png';

  if (!imgFailed && logoSource) {
    return (
      <img
        src={logoSource}
        alt="Government of the Punjab Emblem"
        className={`${className} object-contain`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circular emerald green ring */}
      <circle cx="50" cy="50" r="46" fill="#022C22" stroke="#10B981" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="40" fill="#064E3B" stroke="#34D399" strokeWidth="1.2" strokeDasharray="3 2" />
      {/* Crescent & Star */}
      <circle cx="48" cy="38" r="13" fill="#34D399" />
      <circle cx="51" cy="36" r="11" fill="#064E3B" />
      <polygon points="56,29 57.5,33.5 62,33.5 58.5,36 60,40.5 56,38 52,40.5 53.5,36 50,33.5 54.5,33.5" fill="#FBBF24" />
      {/* Five River Waves / Water lines (Punjab = land of 5 rivers) */}
      <path d="M30 55 Q40 50 50 55 T70 55" stroke="#6EE7B7" strokeWidth="2" fill="none" />
      <path d="M32 60 Q41 56 50 60 T68 60" stroke="#6EE7B7" strokeWidth="1.8" fill="none" />
      <path d="M35 65 Q42 62 50 65 T65 65" stroke="#6EE7B7" strokeWidth="1.5" fill="none" />
      {/* Wheat Ears / Laurel Wreath */}
      <path d="M22 45 Q20 62 34 74" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M78 45 Q80 62 66 74" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Scroll Banner */}
      <rect x="18" y="76" width="64" height="13" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1" />
      <text x="50" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.8">
        GOVT. OF PUNJAB
      </text>
    </svg>
  );
};

// Aliased for seamless compatibility across existing components
export const InstituteEmblem = PunjabGovtEmblem;

export const TevtaEmblem: React.FC<{ className?: string; src?: string }> = ({
  className = 'w-10 h-10',
  src,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const logoSource = src || '/tevta-logo.png';

  if (!imgFailed && logoSource) {
    return (
      <img
        src={logoSource}
        alt="TEVTA Punjab Emblem"
        className={`${className} object-contain`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield container */}
      <rect x="6" y="6" width="88" height="88" rx="14" fill="#064E3B" stroke="#10B981" strokeWidth="3" />
      <rect x="10" y="10" width="80" height="80" rx="10" fill="#022C22" stroke="#34D399" strokeWidth="1" />
      {/* Crescent & Star */}
      <circle cx="44" cy="38" r="14" fill="#10B981" />
      <circle cx="48" cy="36" r="12" fill="#022C22" />
      <polygon points="54,28 56,33 61,33 57,36 59,41 54,38 50,41 51,36 48,33 53,33" fill="#FBBF24" />
      {/* TEVTA letters */}
      <text x="50" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.5">
        TEVTA
      </text>
      {/* Government of the Punjab banner */}
      <rect x="16" y="74" width="68" height="12" rx="3" fill="#047857" />
      <text x="50" y="83" textAnchor="middle" fill="#E6FFFA" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
        PUNJAB GOVT.
      </text>
    </svg>
  );
};
