'use client';
import { useState, useEffect } from 'react';
import { Ticket } from '@/types/types';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import Cookies from 'js-cookie';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const token = Cookies.get('authToken');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        setError('خطا در دریافت تیکت‌ها');
      }
    } catch (err) {
      setError('خطا در دریافت تیکت‌ها');
    }
  };

  const handleRespond = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResponse(ticket.response || '');
    setIsModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      setError('لطفاً متن پاسخ را وارد کنید');
      return;
    }
    try {
      const res = await fetch(`/api/tickets/${selectedTicket?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response, status: 'responded' }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setResponse('');
        setSelectedTicket(null);
        fetchTickets();
      } else {
        setError('خطا در ارسال پاسخ');
      }
    } catch (err) {
      setError('خطا در ارسال پاسخ');
    }
  };

  const handleChangeStatus = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchTickets();
      } else {
        setError('خطا در تغییر وضعیت تیکت');
      }
    } catch (err) {
      setError('خطا در تغییر وضعیت تیکت');
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    bgcolor: 'white',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    p: 4,
    borderRadius: '12px',
    direction: 'rtl',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 yekannew">
      <h2 className="text-2xl font-bold mb-6">مدیریت تیکت‌ها</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <p>هیچ تیکتی ثبت نشده است!</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                <span
                  className={`px-2 py-1 rounded ${
                    ticket.status === 'open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : ticket.status === 'closed'
                      ? 'bg-red-100 text-red-800'
                      : ticket.status === 'responded'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ticket.status === 'open'
                    ? 'باز'
                    : ticket.status === 'closed'
                    ? 'بسته'
                    : ticket.status === 'responded'
                    ? 'پاسخ داده شده'
                    : 'در انتظار'}
                </span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{ticket.message}</p>
              {ticket.response && (
                <p className="mt-2 text-green-600 dark:text-green-400">
                  <strong>پاسخ:</strong> {ticket.response}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                تاریخ: {new Date(ticket.created_at).toLocaleDateString('fa-IR')}
              </p>
              <div className="mt-4 flex gap-x-2 space-x-reverse">
                <button
                  onClick={() => handleRespond(ticket)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  پاسخ
                </button>
                {ticket.status !== 'closed' && (
                  <button
                    onClick={() => handleChangeStatus(ticket.id, 'closed')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    بستن
                  </button>
                )}
                {ticket.status !== 'open' && (
                  <button
                    onClick={() => handleChangeStatus(ticket.id, 'open')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    باز کردن
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="ticket-response-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            sx={{ fontFamily: 'yekannew' }}
            id="ticket-response-modal"
            variant="h6"
            component="h2"
            className="mb-4"
          >
            پاسخ به تیکت #{selectedTicket?.id}
          </Typography>
          <TextField
            label="پاسخ"
            multiline
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            fullWidth
            sx={{ mb: 2, direction: 'rtl' }}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
              sx={{ fontFamily: 'yekannew' }}
            >
              لغو
            </Button>
            <Button
              onClick={handleSubmitResponse}
              variant="contained"
              sx={{ fontFamily: 'yekannew' }}
            >
              ارسال پاسخ
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}