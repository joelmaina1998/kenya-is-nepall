import Link from 'next/link';
export default function NotFound() {
  return <main className="paper flex min-h-screen items-center justify-center px-5"><div className="max-w-md"><div className="eyebrow text-[hsl(var(--primary))]">404 / field note missing</div><h1 className="display mt-4 text-5xl">This page is not on the map.</h1><Link className="ink-button mt-7" href="/">Return home</Link></div></main>;
}