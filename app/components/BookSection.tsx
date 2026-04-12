'use client';

import { useEffect, useState } from 'react';
import BookCard, { BOOK_LISTING_GRID_CLASS } from './BookCard';

type SectionType = 'category' | 'author' | 'publisher';

interface BookSectionProps {
  title: string;
  type?: SectionType;
  value?: string;
  limit?: number;
  fullWidthGrid?: boolean; // optional prop to enable full-width grid
}

export default function BookSection({
  title,
  type,
  value,
  limit = 8,
  fullWidthGrid = true, // default to true for full-width
}: BookSectionProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [type, value]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = '/api/books';

      if (type && value) {
        const params = new URLSearchParams({ [type]: value });
        url = `/api/books/search?${params.toString()}`;
      }

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        setBooks(result.data.slice(0, limit));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 py-8 sm:py-12 px-4 sm:px-6">
      <h2 className="mb-6 sm:mb-8 text-center text-2xl font-bold sm:text-3xl">{title}</h2>

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : fullWidthGrid ? (
        <div className={BOOK_LISTING_GRID_CLASS}>
          {books.map((book) => (
            <BookCard key={book.ISBN} book={book} />
          ))}
        </div>
      ) : (
        <p>No books available.</p>
      )}
    </section>
  );
}
