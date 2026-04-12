'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../../components/Navbar';
import AdminGuard from '../../../../components/AdminGuard';

interface TopCustomer {
  CustomerID: number;
  Username: string;
  FirstName: string;
  LastName: string;
  TotalPurchase: number;
}

export default function TopCustomersPage() {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/reports/top-customers');
      const result = await res.json();
      if (result.success) {
        setCustomers(result.data || []);
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
        <h1 className="text-3xl font-bold mb-6">Top 5 Customers (Last 3 Months)</h1>
        
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No customer data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Purchase</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => (
                  <tr key={customer.CustomerID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {customer.FirstName} {customer.LastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.Username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${parseFloat(customer.TotalPurchase.toString()).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}

