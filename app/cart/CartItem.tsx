'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CartItem({ item, onUpdate }: { item: any; onUpdate?: () => void }) {
  const [quantity, setQuantity] = useState(item.Quantity);
  const [loading, setLoading] = useState(false);

  // Show threshold or stock messages
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
  const maxQuantity = item.QuantityInStock;
    // Prevent exceeding stock
    if (newQuantity > maxQuantity) {
      setMessage(`Maximum stock reached: ${item.QuantityInStock}`);
      return;
    }

    // Threshold warning
    if (item.Threshold && newQuantity >= item.Threshold) {
      setMessage(`Warning: You have reached the threshold quantity (${item.Threshold})`);
    } else {
      setMessage(null);
    }

    const customerId = localStorage.getItem('customerId');
    if (!customerId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CustomerID: parseInt(customerId),
          ISBN: item.ISBN,
          Quantity: newQuantity
        }),
      });

      const result = await res.json();
      if (result.success) {
        setQuantity(newQuantity);
        if (onUpdate) onUpdate();
      } else if (result.message) {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setMessage('Failed to update quantity.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/cart?customer=${customerId}&isbn=${item.ISBN}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success && onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setMessage('Failed to remove item.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = parseFloat(item.Price) * quantity;

  return (
    <div className="p-4 flex flex-col gap-3 hover:bg-gray-50">
      <div className="flex-1">
        <Link href={`/books/${encodeURIComponent(String(item.ISBN).trim())}`} className="font-semibold text-lg hover:text-blue-600">
          {item.Title}
        </Link>
        <p className="text-gray-600 text-sm">ISBN: {item.ISBN}</p>
        <p className="text-gray-700 mt-1">${parseFloat(item.Price).toFixed(2)} each</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Qty:</label>
          <input
            type="number"
            min="1"
            max={item.QuantityInStock}
            value={quantity}
            onChange={(e) => {
              const newQty = Math.max(1, parseInt(e.target.value) || 1);
              setQuantity(newQty);
            }}
            onBlur={(e) => {
              const newQty = Math.max(1, parseInt(e.target.value) || 1);
              if (newQty !== item.Quantity) handleUpdateQuantity(newQty);
            }}
            disabled={loading}
            className="w-20 px-2 py-1 border rounded text-center disabled:bg-gray-100"
          />
        </div>

        <div className="text-right min-w-[100px] sm:ml-auto">
          <p className="font-semibold text-lg">${subtotal.toFixed(2)}</p>
        </div>

        <button
          onClick={handleRemove}
          disabled={loading}
          className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
          title="Remove from cart"
        >
          ✕
        </button>
      </div>

      {message && (
        <p className={`text-sm mt-1 ${quantity > item.QuantityInStock ? 'text-red-700' : 'text-orange-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
