'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Categories from './components/Categories';
import BookSection from './components/BookSection';
import BookCard, { BOOK_LISTING_GRID_CLASS } from './components/BookCard';

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.data || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="flex min-h-[90vh] items-start sm:min-h-[90vh] lg:min-h-[90vh]"
        style={{
          backgroundImage: "url('/hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto w-full max-w-7xl  sm:pt-28 md:pt-36 ">
          <div className="max-w-2xl rounded-br-[25px] rounded-tl-[40px] rounded-tr-[10px] bg-[#a7bdff]/50  shadow-lg sm:p-8">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 sm:text-4xl md:text-5xl">
              Welcome to Book Haven
            </h1>
            <p className="mb-6 text-base text-gray-600 sm:mb-8 sm:text-lg md:text-xl">
              Discover and order your favorite books from our exclusive collection. Browse thousands of
              titles from various genres and authors.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="/books"
                className="rounded-lg bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 sm:px-8 sm:text-lg"
              >
                Browse Books
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-green-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition-colors hover:bg-green-700 sm:px-8 sm:text-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="rounded-3xl bg-[#f5ffa9] p-6 text-center shadow-2xl transition-transform duration-300 hover:scale-105 sm:p-8">
              <div className="mb-4 text-5xl animate-bounce sm:mb-6 sm:text-6xl">📚</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">Wide Selection</h3>
              <p className="text-sm text-gray-600 md:text-base">
                Browse through our extensive collection of books from various genres and authors.
              </p>
            </div>

            <div className="rounded-3xl bg-[#a4d0ff] p-6 text-center shadow-2xl transition-transform duration-300 hover:scale-105 sm:p-8">
              <div className="mb-4 text-5xl animate-bounce sm:mb-6 sm:text-6xl">🛒</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">Easy Shopping</h3>
              <p className="text-sm text-gray-600 md:text-base">
                Add books to your cart and checkout with ease. Fast and secure ordering process.
              </p>
            </div>

            <div className="rounded-3xl bg-[#66ff7a] p-6 text-center shadow-2xl transition-transform duration-300 hover:scale-105 sm:p-8">
              <div className="mb-4 text-5xl animate-bounce sm:mb-6 sm:text-6xl">🚀</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">Quick Delivery</h3>
              <p className="text-sm text-gray-600 md:text-base">
                Get your books delivered quickly. Track your orders and manage your account easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE ALL BOOKS — same shell + grid as BookSection (e.g. Shop Art Books) */}
      <section className="w-full bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 py-8 sm:py-12 px-4 sm:px-6">
        <h2 className="mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">Explore All Books</h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <div className={BOOK_LISTING_GRID_CLASS}>
            {books.map((book) => (
              <BookCard key={book.ISBN} book={book} />
            ))}
          </div>
        )}
      </section>

      <div className="h-8 sm:h-12" aria-hidden />
      <BookSection title="Shop Art Books" type="category" value="Art" />
      <div className="h-8 sm:h-12" aria-hidden />
      <Categories />
      <div className="h-8 sm:h-12" aria-hidden />
      <BookSection title="Shop Science Books" type="category" value="Science" />
      <div className="h-8 sm:h-12" aria-hidden />
      <BookSection title="Shop by Publisher: Penguin" type="publisher" value="Penguin" />

      <Footer />
    </>
  );
}
