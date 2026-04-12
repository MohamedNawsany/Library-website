'use client';

import { useEffect, useState } from 'react';
import BookCard, { BOOK_LISTING_GRID_CLASS } from './BookCard';

interface MoreInCategoryProps {
  categoryName: string;
  excludeIsbn: string;
}

export default function MoreInCategory({ categoryName, excludeIsbn }: MoreInCategoryProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ category: categoryName });
    fetch(`/api/books/search?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const others = result.data.filter((b: any) => b.ISBN !== excludeIsbn).slice(0, 4);
          setBooks(others);
        }
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [categoryName, excludeIsbn]);

  if (loading || books.length === 0) return null;

  return (
    <section className="mt-12 mb-8" aria-label={`More books in ${categoryName}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        More in {categoryName}
      </h2>
      <div className={BOOK_LISTING_GRID_CLASS}>
        {books.map((book: any) => (
          <BookCard key={book.ISBN} book={book} />
        ))}
      </div>
    </section>
  );
}
