import { cn } from '@/lib/utils';

export default function LogoIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path d="M2 4L12 22L22 4H16L12 11.2L8 4H2Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M2 4L12 22V11.2L8 4H2Z" fill="currentColor" />
      <path d="M12 22L22 4H16L12 11.2V22Z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
