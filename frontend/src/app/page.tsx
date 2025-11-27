'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page on load
    router.push('/login');
  }, [router]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Customer Portal</h1>
        <p className={styles.description}>
          Redirecting to login...
        </p>
      </div>
    </main>
  );
}
