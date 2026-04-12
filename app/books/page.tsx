'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import BookCard, { BOOK_LISTING_GRID_CLASS } from '../components/BookCard';
import Footer from '../components/Footer';

function BooksPageContent() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParamsState, setSearchParamsState] = useState({
    isbn: '',
    title: '',
    category: '',
    author: '',
    publisher: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCategories();

    const categoryFromUrl = searchParams?.get('category') ?? '';
    const searchFromUrl = searchParams?.get('search') ?? '';

    const updatedFilters = {
      isbn: '',
      title: searchFromUrl,
      category: categoryFromUrl,
      author: '',
      publisher: ''
    };

    setSearchParamsState(updatedFilters);
    fetchBooks(updatedFilters);
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const result = await res.json();
      if (result.success) setCategories(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async (filters?: typeof searchParamsState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const url = params.toString() ? `/api/books/search?${params.toString()}` : '/api/books';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) setBooks(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSearchParamsState(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchParamsState);
  };

  const handleReset = () => {
    setSearchParamsState({ isbn: '', title: '', category: '', author: '', publisher: '' });
    fetchBooks();
  };

  return (
    <>
      <Navbar />
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">Browse Books</h1>

          {/* Search Form */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-md sm:mb-8 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Search Books</h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input type="text" value={searchParamsState.isbn} onChange={(e)=>handleChange('isbn',e.target.value)}
                placeholder="Search by ISBN" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={searchParamsState.title} onChange={(e)=>handleChange('title',e.target.value)}
                placeholder="Search by title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={searchParamsState.category} onChange={(e)=>handleChange('category',e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                {categories.map((cat: any) => (<option key={cat.CategoryID} value={cat.Name}>{cat.Name}</option>))}
              </select>
            </div>
            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" value={searchParamsState.author} onChange={(e)=>handleChange('author',e.target.value)}
                placeholder="Search by author" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* Publisher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input type="text" value={searchParamsState.publisher} onChange={(e)=>handleChange('publisher',e.target.value)}
                placeholder="Search by publisher" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Search</button>
                <button type="button" onClick={handleReset} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Reset</button>
              </div>
            </form>
          </div>
        </div>

        {/* Books Grid — full-width container */}
        {loading ? (
          <div className="mx-auto max-w-7xl text-center py-12"><p className="text-gray-600 text-lg">Loading books...</p></div>
        ) : books.length === 0 ? (
          <div className="mx-auto max-w-7xl text-center py-12"><p className="text-gray-600 text-lg">No books found.</p></div>
        ) : (
          <section className="w-full bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 py-8 sm:py-12">
            <div className="w-full px-4 sm:px-6">
              <div className={BOOK_LISTING_GRID_CLASS}>
                {books.map((book: any) => (
                  <BookCard key={book.ISBN} book={book} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-600">Loading…</div>
          <Footer />
        </>
      }
    >
      <BooksPageContent />
    </Suspense>
  );
}
