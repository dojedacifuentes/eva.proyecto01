import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from '@/content/site';

export const metadata: Metadata = { title: notFound.title, robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow mono">{notFound.eyebrow}</p>
        <h1 className="h2">{notFound.title}</h1>
        <p className="lede">{notFound.text}</p>
        <p className="aside">{notFound.aside}</p>
        <p style={{ marginTop: '2.5rem' }}>
          <Link href="/" className="btn btn--solid">
            {notFound.action}
          </Link>
        </p>
      </div>
    </section>
  );
}
