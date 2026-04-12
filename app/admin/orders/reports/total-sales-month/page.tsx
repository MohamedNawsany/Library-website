'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../../components/Navbar';
import AdminGuard from '../../../../components/AdminGuard';

export default function TotalSalesMonthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/reports/total-sales-month');
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

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
        <h1 className="text-3xl font-bold mb-6">Total Sales - Previous Month</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Total Sales for Previous Month</p>
            <p className="text-5xl font-bold text-green-600">
              ${parseFloat(data?.TotalSales || 0).toFixed(2)}
            </p>
          </div>
        </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}

