import holoConfig from '@/holo.json';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-sm text-muted-foreground">
      Copyright © {holoConfig.name} {currentYear}
    </div>
  );
}
