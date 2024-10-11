import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Landing Page</h1>
      <nav>
        <ul>
          <li><Link href="/tasks/new">Task Baru</Link></li>
          <li><Link href="/tasks/testnet">Testnet</Link></li>
          <li><Link href="/tasks/daily">Daily</Link></li>
        </ul>
        <div hidden>
          <Link href="/login">Login</Link>
        </div>
      </nav>
    </div>
  );
}
