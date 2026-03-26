import Image from 'next/image';

type CondoHomeBrandImageProps = {
  className?: string;
  variant?: 'logo' | 'mark';
};

export function CondoHomeBrandImage({ className, variant = 'logo' }: CondoHomeBrandImageProps) {
  const src = variant === 'mark' ? '/brand/condohome-mark.png' : '/brand/condohome-logo.png';
  const alt = variant === 'mark' ? 'CondoHome mark' : 'CondoHome logo';
  const width = variant === 'mark' ? 512 : 1200;
  const height = variant === 'mark' ? 512 : 360;

  return <Image src={src} alt={alt} width={width} height={height} className={className} priority />;
}
