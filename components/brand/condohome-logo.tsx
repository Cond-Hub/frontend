type CondoHomeLogoProps = {
  className?: string;
  compact?: boolean;
};

export function CondoHomeLogo({ className, compact = false }: CondoHomeLogoProps) {
  return (
    <div className={className}>
      <svg
        viewBox={compact ? '0 0 64 64' : '0 0 260 64'}
        role="img"
        aria-label="CondoHome"
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="condohome-shell" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#173154" />
            <stop offset="1" stopColor="#0A1528" />
          </linearGradient>
          <linearGradient id="condohome-accent" x1="18" y1="14" x2="49" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6FE7C8" />
            <stop offset="1" stopColor="#25D366" />
          </linearGradient>
        </defs>

        <g>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#condohome-shell)" />
          <path
            d="M18 22.5C18 19.4624 20.4624 17 23.5 17H40.5C43.5376 17 46 19.4624 46 22.5V41.5C46 44.5376 43.5376 47 40.5 47H23.5C20.4624 47 18 44.5376 18 41.5V22.5Z"
            fill="#122741"
            stroke="#2B4C74"
            strokeWidth="1.5"
          />
          <path
            d="M22 31.5L32 23L42 31.5V41C42 42.1046 41.1046 43 40 43H24C22.8954 43 22 42.1046 22 41V31.5Z"
            fill="url(#condohome-accent)"
          />
          <path d="M28 43V34.5C28 33.6716 28.6716 33 29.5 33H34.5C35.3284 33 36 33.6716 36 34.5V43H28Z" fill="#F3FFFB" />
          <rect x="24.5" y="20.5" width="5" height="5" rx="1.4" fill="#33577E" />
          <rect x="34.5" y="20.5" width="5" height="5" rx="1.4" fill="#33577E" />
          <rect x="24.5" y="44.5" width="5" height="5" rx="1.4" fill="#33577E" />
          <rect x="34.5" y="44.5" width="5" height="5" rx="1.4" fill="#33577E" />
        </g>

        {!compact ? (
          <g fill="currentColor">
            <text
              x="78"
              y="29"
              fontFamily="Space Grotesk, Avenir Next, Segoe UI, sans-serif"
              fontSize="24"
              fontWeight="700"
              letterSpacing="-0.04em"
            >
              CondoHome
            </text>
            <text
              x="78"
              y="48"
              fontFamily="Manrope, Avenir Next, Segoe UI, sans-serif"
              fontSize="12"
              fontWeight="600"
              letterSpacing="0.14em"
              opacity="0.72"
            >
              OPERACAO CONDOMINIAL CONECTADA
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
