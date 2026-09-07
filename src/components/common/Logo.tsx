import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'footer' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const isLight = variant === 'light' || variant === 'footer';

  // Responsive dimensions for the logo SVG
  const width =
    size === 'sm' ? 140 : size === 'md' ? 180 : size === 'lg' ? 220 : 280;
  const height =
    size === 'sm' ? 44 : size === 'md' ? 56 : size === 'lg' ? 68 : 86;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? "Go to home page" : undefined}
      className={`inline-flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer outline-hidden focus:ring-2 focus:ring-emerald-500/50 rounded-lg p-1' : ''
      } ${className}`}
    >
      {/* Official 7 SEASONS By Mannarathayil Nursery Logo Artwork */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-auto max-h-full transition-transform duration-300 hover:scale-[1.02] filter drop-shadow-xs"
        aria-label="7 SEASONS by Mannarathayil Nursery Logo"
      >
        <defs>
          {/* Tropical Foliage Gradients */}
          <linearGradient id="monsteraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#042F1A" />
          </linearGradient>

          <linearGradient id="monsteraGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          <linearGradient id="brightLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>

          <linearGradient id="tealLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>

          <linearGradient id="pinkFlowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          <linearGradient id="yellowFlowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>

          <linearGradient id="wateringCanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="purpleFlowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>

          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#042F1A" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. LUSH TROPICAL BOTANICAL BED BACKGROUND */}
        <g id="botanical-foliage-cluster">
          {/* Cyan / Blue Leaves on left */}
          <path
            d="M 52 35 C 40 25, 25 35, 30 55 C 38 65, 55 58, 60 48 Z"
            fill="url(#tealLeafGrad)"
            opacity="0.95"
          />
          <path
            d="M 38 48 C 24 45, 18 60, 26 72 C 34 78, 48 70, 46 58 Z"
            fill="#0891B2"
          />

          {/* Red Pruning Shears on Far Left */}
          <g id="pruning-shears" transform="translate(16, 52) rotate(-22)">
            <rect x="0" y="6" width="22" height="6.5" rx="3" fill="#E11D48" />
            <rect x="0" y="16" width="22" height="6.5" rx="3" fill="#BE123C" />
            <circle cx="21" cy="14.5" r="3.5" fill="#CBD5E1" />
            <path d="M 21 12 L 36 6 C 37 8, 35 14, 25 15 Z" fill="#94A3B8" />
            <path d="M 21 16 L 36 21 C 37 19, 35 14, 25 14 Z" fill="#64748B" />
          </g>

          {/* Tropical Fern & Palm Fronds (Top & Center Left) */}
          <path
            d="M 75 18 C 88 12, 108 16, 115 32 C 105 38, 90 35, 75 28 Z"
            fill="url(#brightLeafGrad)"
          />
          <path
            d="M 98 12 C 112 8, 126 15, 130 28 C 120 32, 108 28, 98 20 Z"
            fill="url(#monsteraGrad2)"
          />
          <path
            d="M 125 14 C 140 10, 155 18, 158 32 C 146 34, 135 28, 125 20 Z"
            fill="url(#monsteraGrad1)"
          />

          {/* Pink Floral Buds & Hibiscus Blossom Left Top */}
          <g id="pink-flower-left" transform="translate(138, 16)">
            <ellipse cx="6" cy="10" rx="5" ry="8" fill="url(#pinkFlowerGrad)" transform="rotate(-30 6 10)" />
            <ellipse cx="14" cy="6" rx="5" ry="8" fill="url(#pinkFlowerGrad)" transform="rotate(10 14 6)" />
            <ellipse cx="22" cy="11" rx="5" ry="8" fill="url(#pinkFlowerGrad)" transform="rotate(45 22 11)" />
            <ellipse cx="18" cy="19" rx="5" ry="7" fill="url(#pinkFlowerGrad)" transform="rotate(90 18 19)" />
            <ellipse cx="9" cy="18" rx="5" ry="7" fill="url(#pinkFlowerGrad)" transform="rotate(-60 9 18)" />
            <circle cx="14" cy="13" r="3.5" fill="#FDE047" />
          </g>

          {/* Deep Forest Monstera Leaf Center */}
          <path
            d="M 160 22 C 185 8, 220 15, 235 40 C 225 60, 195 65, 170 52 Z"
            fill="url(#monsteraGrad1)"
          />
          {/* Monstera Cutouts */}
          <ellipse cx="185" cy="28" rx="3.5" ry="8" fill="#FAF9F6" opacity="0.15" transform="rotate(25 185 28)" />
          <ellipse cx="205" cy="35" rx="3" ry="7" fill="#FAF9F6" opacity="0.15" transform="rotate(45 205 35)" />

          {/* Pink / Magenta Tropical Leaves Center */}
          <path
            d="M 120 48 C 112 60, 125 78, 142 75 C 152 70, 150 55, 138 48 Z"
            fill="#E11D48"
          />
          <path
            d="M 168 45 C 160 62, 178 80, 192 72 C 196 60, 185 48, 172 45 Z"
            fill="#BE123C"
          />

          {/* Bright Lush Foliage Right Center */}
          <path
            d="M 215 18 C 235 12, 260 22, 268 42 C 255 52, 230 48, 218 32 Z"
            fill="url(#brightLeafGrad)"
          />
          <path
            d="M 248 16 C 265 14, 285 24, 290 40 C 275 48, 258 40, 248 26 Z"
            fill="url(#monsteraGrad2)"
          />

          {/* Gold Garden Watering Can Right */}
          <g id="watering-can" transform="translate(236, 12) rotate(6)">
            {/* Can Body */}
            <path
              d="M 12 18 L 30 18 C 33 22, 34 32, 28 36 L 14 36 C 8 32, 9 22, 12 18 Z"
              fill="url(#wateringCanGrad)"
            />
            {/* Spout */}
            <path d="M 10 24 L 2 16 L 0 20 L 8 28 Z" fill="#F59E0B" />
            <ellipse cx="1" cy="18" rx="2.5" ry="4" fill="#FDE68A" />
            {/* Handle */}
            <path
              d="M 29 20 C 37 20, 38 33, 27 34"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Little Daisy on Watering Can */}
            <circle cx="21" cy="27" r="2" fill="#FFFFFF" />
            <circle cx="21" cy="27" r="1" fill="#F59E0B" />
          </g>

          {/* Yellow Buttercup Flowers Center-Right Bottom */}
          <g id="yellow-buttercup-1" transform="translate(254, 48)">
            <circle cx="16" cy="16" r="7" fill="url(#yellowFlowerGrad)" />
            <circle cx="10" cy="12" r="6" fill="url(#yellowFlowerGrad)" />
            <circle cx="22" cy="12" r="6" fill="url(#yellowFlowerGrad)" />
            <circle cx="12" cy="20" r="6" fill="url(#yellowFlowerGrad)" />
            <circle cx="20" cy="20" r="6" fill="url(#yellowFlowerGrad)" />
            <circle cx="16" cy="16" r="3.5" fill="#B45309" />
          </g>
          <g id="yellow-buttercup-2" transform="translate(230, 52) scale(0.7)">
            <circle cx="16" cy="16" r="6" fill="url(#yellowFlowerGrad)" />
            <circle cx="10" cy="13" r="5" fill="url(#yellowFlowerGrad)" />
            <circle cx="21" cy="13" r="5" fill="url(#yellowFlowerGrad)" />
            <circle cx="13" cy="20" r="5" fill="url(#yellowFlowerGrad)" />
            <circle cx="19" cy="20" r="5" fill="url(#yellowFlowerGrad)" />
            <circle cx="16" cy="16" r="3" fill="#B45309" />
          </g>

          {/* Tropical Palm & Ferns Right End */}
          <path
            d="M 285 24 C 305 18, 330 26, 338 48 C 322 58, 300 52, 288 38 Z"
            fill="url(#monsteraGrad1)"
          />
          <path
            d="M 305 32 C 325 28, 342 38, 348 55 C 335 62, 318 56, 308 44 Z"
            fill="url(#brightLeafGrad)"
          />

          {/* Purple / Blue Forget-me-nots Far Right */}
          <g id="purple-flowers" transform="translate(306, 38)">
            <circle cx="12" cy="8" r="5" fill="url(#purpleFlowerGrad)" />
            <circle cx="7" cy="13" r="5" fill="url(#purpleFlowerGrad)" />
            <circle cx="17" cy="13" r="5" fill="url(#purpleFlowerGrad)" />
            <circle cx="12" cy="12" r="2.5" fill="#FDE047" />
          </g>

          {/* Coral / Pink Tropical Blossom Far Right Bottom */}
          <g id="pink-flower-right" transform="translate(320, 48)">
            <circle cx="10" cy="10" r="6" fill="url(#pinkFlowerGrad)" />
            <circle cx="6" cy="7" r="5" fill="url(#pinkFlowerGrad)" />
            <circle cx="14" cy="7" r="5" fill="url(#pinkFlowerGrad)" />
            <circle cx="7" cy="14" r="5" fill="url(#pinkFlowerGrad)" />
            <circle cx="13" cy="14" r="5" fill="url(#pinkFlowerGrad)" />
            <circle cx="10" cy="10" r="2.5" fill="#FDE047" />
          </g>

          {/* Lush Green Grass Spikes & Fern fronds below */}
          <path
            d="M 60 62 L 72 75 L 84 62 L 96 74 L 110 60 L 125 72 L 140 60 L 160 74 L 180 62 L 205 76 L 230 64 L 255 76 L 280 64 L 305 74 L 330 60 Z"
            fill="#15803D"
            opacity="0.8"
          />
        </g>

        {/* 2. PROMINENT WHITE BOLD WORDMARK "7SEASONS" OVERLAID */}
        <g id="wordmark-7seasons" filter="url(#logoShadow)">
          {/* Bold stylized text with high optical contrast */}
          <text
            x="195"
            y="64"
            textAnchor="middle"
            fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="46"
            letterSpacing="-0.5"
            fill="#FFFFFF"
            stroke="#064E3B"
            strokeWidth="1.2"
            strokeLinejoin="round"
            style={{ textTransform: 'uppercase' }}
          >
            7SEASONS
          </text>
        </g>

        {/* 3. SUBTITLE: "By Mannarathayil Nursery" */}
        {showSubtitle && (
          <g id="subtitle-mannarathayil" className="hidden md:inline">
            <text
              x="250"
              y="98"
              textAnchor="middle"
              fontFamily="'Outfit', 'Inter', -apple-system, sans-serif"
              fontWeight="800"
              fontSize="16"
              letterSpacing="0.4"
              fill={isLight ? '#E2FCEE' : '#14532D'}
            >
              By Mannarathayil Nursery
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
