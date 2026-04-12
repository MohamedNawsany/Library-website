'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AdminGuard from '../components/AdminGuard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCustomers: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const result = await res.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.totalBooks}</div>
            <div className="text-gray-600 mt-2">Total Books</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">{stats.totalCustomers}</div>
            <div className="text-gray-600 mt-2">Total Customers</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalSales}</div>
            <div className="text-gray-600 mt-2">Total Sales</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <div className="text-gray-600 mt-2">Pending Orders</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/books"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📚 Manage Books</h2>
            <p className="text-gray-600">Add, edit, and manage books in the store</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📦 Manage Orders</h2>
            <p className="text-gray-600">View and confirm orders from publishers</p>
          </Link>

          <Link
            href="/admin/customers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">👥 Manage Customers</h2>
            <p className="text-gray-600">View and manage customer accounts</p>
          </Link>

          <Link
            href="/admin/authors"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">✍️ Manage Authors</h2>
            <p className="text-gray-600">Add and manage book authors</p>
          </Link>

          <Link
            href="/admin/publishers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">🏢 Manage Publishers</h2>
            <p className="text-gray-600">Add and manage publishers</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📂 Manage Categories</h2>
            <p className="text-gray-600">Add and manage book categories</p>
          </Link>

          <Link
            href="/admin/orders/reports"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📊 Reports</h2>
            <p className="text-gray-600">View sales reports and analytics</p>
          </Link>
        </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}

