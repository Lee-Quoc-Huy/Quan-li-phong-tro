import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'w-10 h-10',
  color = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
    >
      {/* Outer circular leaf branch */}
      <path
        d="M 45 155 C 20 120 25 70 58 42 C 85 20 125 18 152 35"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Leaf at top */}
      <path
        d="M 102 38 C 115 12 155 12 178 30 C 178 30 150 48 102 38 Z"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 125 32 C 145 28 165 29 175 30"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Top left outer accent arc */}
      <path
        d="M 52 56 C 42 70 38 88 38 106 C 38 130 46 150 56 162"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Bottom accent arc */}
      <path
        d="M 72 180 C 82 186 94 188 106 186"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Main House Roof */}
      <path
        d="M 48 116 L 108 66 L 168 116"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chimney */}
      <path
        d="M 144 96 V 70 H 158 V 108"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* House Body & Base Curve */}
      <path
        d="M 50 116 C 50 160 80 178 112 178 C 148 178 170 156 168 116"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch Door */}
      <path
        d="M 96 172 C 96 150 124 150 124 172"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* 4-Pane Window Grid */}
      {/* Top Left Pane */}
      <rect x="97" y="110" width="10" height="10" rx="1.5" fill={color} stroke="none" />
      {/* Top Right Pane */}
      <rect x="111" y="110" width="10" height="10" rx="1.5" fill={color} stroke="none" />
      {/* Bottom Left Pane */}
      <rect x="97" y="124" width="10" height="10" rx="1.5" fill={color} stroke="none" />
      {/* Bottom Right Pane */}
      <rect x="111" y="124" width="10" height="10" rx="1.5" fill={color} stroke="none" />
    </svg>
  );
};

export default AppLogo;
