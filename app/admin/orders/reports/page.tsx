'use client';

import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import AdminGuard from '../../../components/AdminGuard';

export default function ReportsPage() {
  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/orders/reports/total-sales-month"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📅 Total Sales - Previous Month</h2>
            <p className="text-gray-600">View total sales for the previous month</p>
          </Link>

          <Link
            href="/admin/orders/reports/total-sales-day"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📆 Total Sales - Specific Day</h2>
            <p className="text-gray-600">View total sales for a specific date</p>
          </Link>

          <Link
            href="/admin/orders/reports/top-customers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">👥 Top 5 Customers</h2>
            <p className="text-gray-600">View top customers by purchase amount (Last 3 Months)</p>
          </Link>

          <Link
            href="/admin/orders/reports/top-selling-books"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📚 Top 10 Selling Books</h2>
            <p className="text-gray-600">View top selling books by copies sold (Last 3 Months)</p>
          </Link>

          <Link
            href="/admin/orders/reports/book-order-count"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">📦 Book Order Count</h2>
            <p className="text-gray-600">View how many times a book has been ordered from publishers</p>
          </Link>
        </div>
      </div>
    </AdminGuard>
  );
}

