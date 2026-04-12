'use client';

import { useState } from 'react';
import Navbar from '../../../../components/Navbar';
import AdminGuard from '../../../../components/AdminGuard';

export default function TotalSalesDayPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/total-sales-day?date=${date}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <h1 className="text-3xl font-bold mb-6">Total Sales - Specific Day</h1>
        
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 sm:w-auto"
            >
              {loading ? 'Loading...' : 'Get Report'}
            </button>
          </form>
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Total Sales for {new Date(data.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-5xl font-bold text-green-600">
                ${parseFloat(data.TotalSales || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

