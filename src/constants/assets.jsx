import React from 'react';

export const TankAsset = ({ color }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`} style={{ pointerEvents: 'none' }}>
    <rect x="15" y="10" width="15" height="80" rx="4" fill="#222" />
    <rect x="70" y="10" width="15" height="80" rx="4" fill="#222" />
    <path d="M15 20 H30 M15 30 H30 M15 40 H30 M15 50 H30 M15 60 H30 M15 70 H30" stroke="#444" strokeWidth="2" />
    <path d="M70 20 H85 M70 30 H85 M70 40 H85 M70 50 H85 M70 60 H85 M70 70 H85" stroke="#444" strokeWidth="2" />
    <rect x="25" y="20" width="50" height="60" rx="8" fill="currentColor" />
    <rect x="30" y="25" width="40" height="50" rx="4" fill="rgba(0,0,0,0.2)" />
    <circle cx="50" cy="55" r="18" fill={color === 'red' ? '#7f1d1d' : '#1e3a8a'} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
    <rect x="44" y="0" width="12" height="55" rx="2" fill={color === 'red' ? '#7f1d1d' : '#1e3a8a'} />
    <rect x="44" y="0" width="12" height="10" rx="1" fill="#111" /> 
  </svg>
);

export const ShipAsset = ({ color }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`} style={{ pointerEvents: 'none' }}>
    <path d="M50 5 L80 25 L80 85 C80 95 50 100 50 100 C50 100 20 95 20 85 L20 25 Z" fill="currentColor" />
    <rect x="45" y="25" width="10" height="60" fill="rgba(0,0,0,0.3)" />
    <circle cx="50" cy="55" r="15" fill="rgba(255,255,255,0.3)" />
    <rect x="42" y="35" width="16" height="20" fill="#333" />
    <rect x="46" y="10" width="8" height="35" fill="#333" />
  </svg>
);

export const ProjectileAsset = () => (
  <svg viewBox="0 0 20 20" className="w-full h-full">
    <circle cx="10" cy="10" r="8" fill="black" />
    <circle cx="8" cy="8" r="3" fill="white" opacity="0.5"/>
  </svg>
);

// Helper to get asset by type
export const getUnitAsset = (unitType, color) => {
  if (unitType === 'tank') {
    return <TankAsset color={color} />;
  }
  return <ShipAsset color={color} />;
};
