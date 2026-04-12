'use client';

import { useState } from 'react';
import Navbar from '../../../../components/Navbar';
import AdminGuard from '../../../../components/AdminGuard';

export default function BookOrderCountPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isbn, setIsbn] = useState('');

  const fetchData = async () => {
    if (!isbn.trim()) {
      alert('Please enter an ISBN');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/book-order-count?isbn=${encodeURIComponent(isbn)}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        alert(result.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold mb-6">Book Order Count</h1>
        
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter ISBN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g., 978-0-123456-78-9"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 sm:w-auto"
            >
              {loading ? 'Loading...' : 'Get Count'}
            </button>
          </form>
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Total number of times orders were placed for ISBN: <strong>{data.ISBN}</strong>
              </p>
              <p className="text-5xl font-bold text-blue-600">
                {data.TotalOrders}
              </p>
              <p className="text-gray-500 mt-2">orders</p>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

