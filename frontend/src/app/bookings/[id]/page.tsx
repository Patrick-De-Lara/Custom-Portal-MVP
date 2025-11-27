'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiService from '@/services/api';
import styles from './booking-detail.module.css';

interface Booking {
  id: number;
  title: string;
  description?: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  address?: string;
  total?: number;
  attachments?: FileAttachment[];
  messages?: Message[];
}

interface FileAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  senderType: 'customer' | 'admin';
  createdAt: string;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = apiService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, router]);

  const loadBooking = async () => {
    try {
      const response = await apiService.getBookingById(Number(bookingId));
      if (response.success) {
        setBooking(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !bookingId) return;

    setSending(true);
    try {
      await apiService.sendMessage(Number(bookingId), messageContent);
      setMessageContent('');
      loadBooking(); // Reload to get new message
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
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
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Booking not found'}</div>
        <button onClick={() => router.push('/bookings')} className={styles.backBtn}>
          ← Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.push('/bookings')} className={styles.backBtn}>
        ← Back to Bookings
      </button>

      <div className={styles.bookingHeader}>
        <div>
          <h1 className={styles.title}>{booking.title}</h1>
          <p className={styles.subtitle}>Booking #{booking.id}</p>
        </div>
        <span
          className={styles.status}
          style={{ backgroundColor: getStatusColor(booking.status) }}
        >
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Details</h2>
            {booking.description && (
              <p className={styles.description}>{booking.description}</p>
            )}

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.label}>📅 Scheduled:</span>
                <span>{formatDate(booking.scheduledDate)}</span>
              </div>
              {booking.completedDate && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>✅ Completed:</span>
                  <span>{formatDate(booking.completedDate)}</span>
                </div>
              )}
              {booking.address && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>📍 Address:</span>
                  <span>{booking.address}</span>
                </div>
              )}
              {booking.total && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>💰 Total:</span>
                  <span className={styles.totalAmount}>
                    ${parseFloat(booking.total.toString()).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>
              📎 Attachments ({booking.attachments?.length || 0})
            </h2>
            {!booking.attachments || booking.attachments.length === 0 ? (
              <p className={styles.emptyText}>No attachments available</p>
            ) : (
              <div className={styles.filesList}>
                {booking.attachments.map((file) => (
                  <div key={file.id} className={styles.fileItem}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{file.fileName}</div>
                      <div className={styles.fileSize}>
                        {formatFileSize(file.fileSize)}
                      </div>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadBtn}
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>💬 Messages</h2>
            <div className={styles.messagesContainer}>
              {!booking.messages || booking.messages.length === 0 ? (
                <p className={styles.emptyText}>No messages yet</p>
              ) : (
                <div className={styles.messagesList}>
                  {booking.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        message.senderType === 'customer'
                          ? styles.customerMessage
                          : styles.adminMessage
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.messageSender}>
                          {message.senderType === 'customer' ? 'You' : 'Support'}
                        </span>
                        <span className={styles.messageTime}>
                          {new Date(message.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className={styles.messageContent}>{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className={styles.messageInput}
                rows={3}
                disabled={sending}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={sending || !messageContent.trim()}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
