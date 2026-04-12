'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface OrderItem {
  ISBN: string;
  Title: string;
  Quantity: number;
  Price: number;
}

interface Order {
  SaleID: number;
  SaleDate: string;
  TotalPrice: number;
  Items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      router.push('/login');
      return;
    }
    fetchOrders(customerId);
  }, [router]);

  const fetchOrders = async (customerId: string) => {
    try {
      const res = await fetch(`/api/orders?customer=${customerId}`);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-center">Loading orders...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">You have no past orders.</p>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.SaleID} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.SaleID}</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Placed on {new Date(order.SaleDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(order.TotalPrice.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Items:</h3>
                  <div className="space-y-2">
                    {order.Items.map((item, index) => (
                      <div key={index} className="flex flex-col gap-1 py-2 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.Title}</p>
                          <p className="text-sm text-gray-600">ISBN: {item.ISBN}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-600">Qty: {item.Quantity}</p>
                          <p className="font-semibold">
                            ${(parseFloat(item.Price.toString()) * item.Quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
