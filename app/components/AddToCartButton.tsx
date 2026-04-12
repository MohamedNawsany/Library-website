'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  isbn: string;
  stock: number;
  showQuantity?: boolean; // whether to show input field
  onUpdateStock?: (newStock: number) => void; // callback to update stock
  /** Card grid: full rounded block + shadow on hover wraps entire control */
  variant?: 'default' | 'card';
}

export default function AddToCartButton({
  isbn,
  stock,
  showQuantity = false,
  onUpdateStock,
  variant = 'default',
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAddToCart = async () => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      setMessage('Please login to add items to cart');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    if (quantity > stock) {
      setMessage(`Only ${stock} in stock`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CustomerID: parseInt(customerId),
          ISBN: isbn,
          Quantity: quantity
        }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage('Added to cart!');
        // decrease stock locally
        if (onUpdateStock) onUpdateStock(stock - quantity);
        setTimeout(() => router.push('/cart'), 500); // go directly to cart
      } else {
        setMessage(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      setMessage('Error adding to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCard = variant === 'card';
  const disabled = loading || stock <= 0;

  const button = (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className={
        isCard
          ? `w-full px-4 py-2.5 rounded-2xl font-semibold transition-colors ${
              disabled
                ? 'bg-transparent text-gray-500 cursor-not-allowed'
                : 'bg-transparent text-white hover:bg-green-700'
            }`
          : `w-full px-4 py-2.5 rounded-xl font-semibold transition-colors ${
              disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`
      }
    >
      {loading ? 'Adding...' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );

  return (
    <div className="space-y-2">
      {showQuantity && (
        <div className="flex items-center gap-4">
          <label className="font-semibold">Quantity:</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), stock))}
            className="w-20 px-3 py-2 border rounded text-center"
          />
        </div>
      )}

      {isCard ? (
        <div
          className={`w-full rounded-2xl border overflow-hidden transition-shadow duration-300 ${
            disabled
              ? 'border-gray-300 bg-gray-200'
              : 'border-green-600 bg-green-600 shadow-sm hover:shadow-lg hover:shadow-green-900/40'
          }`}
        >
          {button}
        </div>
      ) : (
        button
      )}

      {message && (
        <p className={`text-sm ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
