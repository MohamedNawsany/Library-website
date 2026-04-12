'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

/** Same grid as Shop Art Books — use for every book listing on the site. */
export const BOOK_LISTING_GRID_CLASS =
  'grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';

export default function BookCard({ book }: any) {
  const [stock, setStock] = useState(book.QuantityInStock);

  return (
    <div className="group relative flex h-full min-h-[540px] flex-col bg-[#E1D5FD] rounded-3xl overflow-hidden border-2 border-gray-400 transition-all duration-300 hover:shadow-lg">
      <Link
        href={`/books/${encodeURIComponent(String(book.ISBN).trim())}`}
        className="absolute inset-0 z-0 rounded-3xl"
        aria-label={`View ${book.Title}`}
      />

      {/* IMAGE AREA — clicks pass through to the link */}
      <div className="relative z-10 w-full h-[300px] pointer-events-none">
        {book.ImageURL ? (
          <Image
            src={book.ImageURL}
            alt={book.Title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No Image
          </div>
        )}

        {book.CategoryName && (
          <span className="absolute top-6 left-6 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            {book.CategoryName}
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-4">
        {/* Clicks pass through to the product link */}
        <div className="pointer-events-none flex min-h-0 flex-1 flex-col">
          <p className="text-sm text-gray-600 truncate">
            {book.Authors?.map((a: any) => a.AuthorName).join(', ') || 'Unknown Author'}
          </p>

          <h3 className="font-semibold text-gray-800 truncate">{book.Title}</h3>

          <p className="text-lg font-bold text-gray-900 mt-1">
            ${parseFloat(book.Price).toFixed(2)}
          </p>

          <p
            className={`text-xs mt-1 ${
              stock > 0 ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>
        </div>

        <div className="relative z-20 mt-auto pt-2 pointer-events-auto">
          <AddToCartButton
            isbn={book.ISBN}
            stock={stock}
            showQuantity={false}
            onUpdateStock={setStock}
            variant="card"
          />
        </div>
      </div>
    </div>
  );
}
