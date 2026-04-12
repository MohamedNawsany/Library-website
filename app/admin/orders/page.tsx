'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminGuard from '../../components/AdminGuard';

interface PublisherOrder {
  OrderID: number;
  ISBN: string;
  BookTitle: string;
  PublisherName: string;
  QuantityOrdered: number;
  OrderDate: string;
  Status: string;
  UpdatedAt?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PublisherOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Confirmed'>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${filter}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setOrders(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderID: number) => {
    if (!confirm('Are you sure you want to confirm this order? This will add the books to stock.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderID: orderID }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Order confirmed successfully!');
        fetchOrders();
      } else {
        alert(result.error || 'Failed to confirm order');
      }
    } catch (error) {
      alert('Error confirming order');
    }
  };

  return (
    <AdminGuard>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <>
        <h1 className="text-3xl font-bold mb-6">Publisher Orders</h1>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`px-4 py-2 rounded ${filter === 'Pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('Confirmed')}
            className={`px-4 py-2 rounded ${filter === 'Confirmed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Confirmed
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.OrderID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.OrderID}</td>
                    <td className="px-6 py-4 text-sm">{order.BookTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.ISBN}</td>
                    <td className="px-6 py-4 text-sm">{order.PublisherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.QuantityOrdered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(order.OrderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.Status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.Status === 'Pending' && (
                        <button
                          onClick={() => handleConfirmOrder(order.OrderID)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {order.Status === 'Confirmed' && order.UpdatedAt && (
                        <span className="text-gray-500 text-xs">
                          Confirmed: {new Date(order.UpdatedAt).toLocaleDateString()}
                        </span>
                      )}
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

