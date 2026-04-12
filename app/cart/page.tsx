'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import CartItem from './CartItem';
import Footer from '../components/Footer';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      setError('Please login to view your cart');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    fetchCart(customerId);
  }, [router]);

  const fetchCart = async (customerId: string) => {
    try {
      const res = await fetch(`/api/cart?customer=${customerId}`);
      const result = await res.json();
      if (result.success) {
        setCartItems(result.data || []);
      } else {
        setError(result.error || 'Failed to load cart');
      }
    } catch (err: any) {
      setError('Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CustomerID: parseInt(customerId) }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Checkout successful! Your order has been placed.');
        router.push('/orders');
      } else {
        alert(result.error || 'Checkout failed');
      }
    } catch (err: any) {
      alert('Error during checkout');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.Price) * item.Quantity), 0);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-center">Loading cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow divide-y">
                {cartItems.map(item => (
                  <CartItem 
                    key={item.ISBN} 
                    item={item} 
                    onUpdate={() => {
                      const customerId = localStorage.getItem('customerId');
                      if (customerId) fetchCart(customerId);
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 lg:sticky lg:top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/cart/checkout')}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
