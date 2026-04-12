'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import AdminGuard from '../../../../components/AdminGuard';

interface TopBook {
  ISBN: string;
  Title: string;
  TotalSold: number;
}

export default function TopSellingBooksPage() {
  const [books, setBooks] = useState<TopBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/reports/top-books');
      const result = await res.json();
      if (result.success) {
        setBooks(result.data || []);
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
        <h1 className="text-3xl font-bold mb-6">Top 10 Selling Books (Last 3 Months)</h1>
        
        {books.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No sales data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Copies Sold</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book, index) => (
                  <tr key={book.ISBN} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/books/${encodeURIComponent(String(book.ISBN).trim())}`} className="text-blue-600 hover:text-blue-800">
                        {book.Title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {book.ISBN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {book.TotalSold} copies
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

