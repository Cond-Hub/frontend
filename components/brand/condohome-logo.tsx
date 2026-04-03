type CondoHomeLogoProps = {
  className?: string;
  compact?: boolean;
};

type MarkTheme = 'light' | 'dark';

function CondHubMark({ theme }: { theme: MarkTheme }) {
  const isDark = theme === 'dark';
  const shellFill = isDark ? '#08111f' : '#f8fafc';
  const shellStroke = isDark ? '#1e293b' : '#d7e2ee';
  const ringFill = isDark ? '#0f1c31' : '#e8f0f7';
  const ringStroke = isDark ? '#24364f' : '#c2d2e2';
  const bodyFill = isDark ? '#12b981' : '#0f766e';
  const bodyFillSecondary = isDark ? '#34d399' : '#14b8a6';
  const cutFill = isDark ? '#08111f' : '#f8fafc';
  const windowFill = isDark ? '#dffcf3' : '#0f172a';

  return (
    <svg viewBox="0 0 128 128" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="120" height="120" rx="30" fill={shellFill} stroke={shellStroke} strokeWidth="2.5" />
      <path
        d="M99 26H59C36.356 26 18 44.356 18 67s18.356 41 41 41h40"
        fill={ringFill}
        stroke={ringStroke}
        strokeWidth="3"
        transform="translate(0 -4)"
      />
      <path
        d="M88 30H60c-18.225 0-33 14.775-33 33s14.775 33 33 33h28c7.18 0 13-5.82 13-13V43c0-7.18-5.82-13-13-13Z"
        fill={bodyFill}
      />
      <path
        d="M88 30H60c-18.225 0-33 14.775-33 33s14.775 33 33 33h28c7.18 0 13-5.82 13-13V43c0-7.18-5.82-13-13-13Z"
        fill="url(#condhub-logo-body-gradient)"
        fillOpacity="0.94"
      />
      <path
        d="M85 40H60c-12.703 0-23 10.297-23 23s10.297 23 23 23h25c3.866 0 7-3.134 7-7V47c0-3.866-3.134-7-7-7Z"
        fill={cutFill}
      />
      <rect x="66" y="52" width="8" height="8" rx="2.2" fill={windowFill} />
      <rect x="78" y="52" width="8" height="8" rx="2.2" fill={windowFill} />
      <rect x="66" y="64" width="8" height="8" rx="2.2" fill={windowFill} />
      <rect x="78" y="64" width="8" height="8" rx="2.2" fill={windowFill} />
      <path
        d="M40 63c0-10.493 8.507-19 19-19h8.5v7.5H59c-6.351 0-11.5 5.149-11.5 11.5S52.649 74.5 59 74.5h8.5V82H59c-10.493 0-19-8.507-19-19Z"
        fill={bodyFillSecondary}
      />
      <defs>
        <linearGradient id="condhub-logo-body-gradient" x1="34" y1="34" x2="104" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor={bodyFillSecondary} />
          <stop offset="1" stopColor={bodyFill} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CondoHomeLogo({ className, compact = false }: CondoHomeLogoProps) {
  if (compact) {
    return (
      <div className={className} aria-label="CondHub" role="img">
        <div className="block h-full dark:hidden">
          <CondHubMark theme="light" />
        </div>
        <div className="hidden h-full dark:block">
          <CondHubMark theme="dark" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} aria-label="CondHub" role="img">
      <div className="h-full shrink-0">
        <div className="block h-full dark:hidden">
          <CondHubMark theme="light" />
        </div>
        <div className="hidden h-full dark:block">
          <CondHubMark theme="dark" />
        </div>
      </div>
      <div className="min-w-0 text-current">
        <p className="text-[1.1rem] font-semibold tracking-[-0.04em] sm:text-xl">CondHub</p>
        <p className="text-[0.62rem] font-semibold tracking-[0.14em] opacity-70 sm:text-xs">
          OPERACAO CONDOMINIAL CONECTADA
        </p>
      </div>
    </div>
  );
}
