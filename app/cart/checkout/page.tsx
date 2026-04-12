'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface CartItem {
  ISBN: string;
  Title: string;
  Price: number;
  Quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const router = useRouter();

  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      router.push('/login');
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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.Price.toString()) * item.Quantity), 0);
  };

  const validateCard = (cardNumber: string, expiryDate: string, cvv: string): boolean => {
    // Basic validation - card number should be 13-19 digits
    const cardNumRegex = /^\d{13,19}$/;
    if (!cardNumRegex.test(cardNumber.replace(/\s/g, ''))) {
      return false;
    }

    // Expiry date should be MM/YY format and not expired
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) {
      return false;
    }

    // CVV should be 3-4 digits
    const cvvRegex = /^\d{3,4}$/;
    if (!cvvRegex.test(cvv)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      router.push('/login');
      return;
    }

    // Validate credit card
    if (!validateCard(formData.cardNumber, formData.expiryDate, formData.cvv)) {
      setError('Invalid credit card information. Please check your card number, expiry date, and CVV.');
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CustomerID: parseInt(customerId) }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Order placed successfully! Your order ID is: ' + result.data.SaleID);
        router.push('/orders');
      } else {
        setError(result.error || 'Checkout failed. Please try again.');
      }
    } catch (err: any) {
      setError('Error during checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-center">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Books
            </button>
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
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item.ISBN} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.Title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.Quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.Price.toString()) * item.Quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiry(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {processing ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
