import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import AddToCartButton from '../../components/AddToCartButton';
import Footer from '../../components/Footer';
import { getBookByIsbn } from '@/lib/getBookByIsbn';
import MoreInCategory from '../../components/MoreInCategory';

export default async function BookDetailPage({ params }: { params: Promise<{ isbn: string }> | { isbn: string } }) {
  const { isbn } = await Promise.resolve(params);
  const book = await getBookByIsbn(isbn);

  if (!book) return notFound();

  const inStock = book.QuantityInStock > 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:text-gray-700 transition">Home</Link></li>
              <li><span className="mx-1">/</span></li>
              <li><Link href="/books" className="hover:text-gray-700 transition">Books</Link></li>
              <li><span className="mx-1">/</span></li>
              <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">{book.Title}</li>
            </ol>
          </nav>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-[minmax(0,340px)_1fr] gap-0">
              {/* Cover + category */}
              <div className="relative bg-gray-100 flex flex-col items-center justify-center p-6 md:p-8 min-h-[320px]">
                {book.ImageURL ? (
                  <div className="relative w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={book.ImageURL}
                      alt={book.Title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 340px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[280px] aspect-[2/3] rounded-xl bg-[#E1D5FD] border-2 border-gray-300 flex items-center justify-center text-gray-500 font-medium text-center px-4">
                    No cover image
                  </div>
                )}
                {book.CategoryName && (
                  <span className="mt-4 inline-block bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                    {book.CategoryName}
                  </span>
                )}
              </div>

              {/* Details + price */}
              <div className="p-6 md:p-8 flex flex-col">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  {book.Title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {book.Authors?.map((a: { AuthorName: string }) => a.AuthorName).join(', ') || 'Unknown author'}
                </p>

                {/* Meta list */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6">
                  <div>
                    <dt className="text-gray-500 font-medium">ISBN</dt>
                    <dd className="text-gray-900 font-mono">{book.ISBN}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Publisher</dt>
                    <dd className="text-gray-900">{book.PublisherName}</dd>
                  </div>
                  {book.PublicationYear && (
                    <div>
                      <dt className="text-gray-500 font-medium">Publication year</dt>
                      <dd className="text-gray-900">{book.PublicationYear}</dd>
                    </div>
                  )}
                </dl>

                {/* Price & stock card */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap items-baseline gap-3 mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                      ${parseFloat(String(book.Price)).toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inStock ? `In stock (${book.QuantityInStock})` : 'Out of stock'}
                    </span>
                  </div>
                  {book.Threshold != null && (
                    <p className="text-xs text-gray-500 mb-4">
                      Low stock threshold: {book.Threshold}
                    </p>
                  )}

                  {inStock && (
                    <div className="max-w-xs">
                      <AddToCartButton
                        isbn={book.ISBN}
                        stock={book.QuantityInStock}
                        showQuantity={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* More in this category */}
          {book.CategoryName && (
            <MoreInCategory
              categoryName={book.CategoryName}
              excludeIsbn={book.ISBN}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
