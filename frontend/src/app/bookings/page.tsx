'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/api';
import styles from './bookings.module.css';

interface Booking {
  id: number;
  title: string;
  description?: string;
  status: string;
  scheduledDate?: string;
  address?: string;
  total?: number;
  servicem8_job_uuid?: string; // Add this to identify ServiceM8 bookings
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const customerData = localStorage.getItem('customer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    }

    loadBookings();
  }, [router]);

  const loadBookings = async () => {
    try {
      const response = await apiService.getBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#f59e0b',
      scheduled: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Bookings</h1>
          {customer && <p className={styles.subtitle}>Welcome, {customer.name}</p>}
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <p>No bookings found</p>
          <p className={styles.emptySubtext}>Your bookings will appear here</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={styles.bookingCard}
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              <div className={styles.bookingHeader}>
                <h3 className={styles.bookingTitle}>
                  {booking.title}
                  {booking.servicem8_job_uuid && (
                    <span className={styles.servicem8Badge} title="Synced from ServiceM8">
                      ✓ ServiceM8
                    </span>
                  )}
                </h3>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              {booking.description && (
                <p className={styles.description}>{booking.description}</p>
              )}

              <div className={styles.bookingDetails}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>📅 Date:</span>
                  <span>{formatDate(booking.scheduledDate)}</span>
                </div>

                {booking.address && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>📍 Location:</span>
                    <span>{booking.address}</span>
                  </div>
                )}

                {booking.total && (
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>💰 Total:</span>
                    <span>${parseFloat(booking.total.toString()).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className={styles.viewMore}>View Details →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
