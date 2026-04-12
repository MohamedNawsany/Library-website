'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customerId = localStorage.getItem('customerId');
      const storedUsername = localStorage.getItem('username');
      const storedIsAdmin = localStorage.getItem('isAdmin');

      setIsLoggedIn(!!customerId);
      setUsername(storedUsername || '');
      setIsAdmin(storedIsAdmin === 'true');
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const customerId = localStorage.getItem('customerId');

    if (customerId) {
      try {
        await fetch('/api/cart/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CustomerID: parseInt(customerId) }),
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }

    localStorage.removeItem('customerId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');

    setIsLoggedIn(false);
    setUsername('');
    setIsAdmin(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const submitSearch = () => {
    const value = search.trim();
    if (!value) return;
    router.push(`/books?search=${encodeURIComponent(value)}`);
    setSearch('');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitSearch();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const searchInputClass =
    'h-9 shrink-0 rounded-full border border-[#1C1009]/50 bg-white/90 px-3 pr-10 text-sm leading-none shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#1C1009] sm:px-4 w-[min(100%,240px)] sm:w-[320px] lg:w-[380px]';

  const navLinkClass =
    'whitespace-nowrap rounded-md px-2 py-1.5 transition-colors hover:bg-black/5 hover:text-gray-700';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 bg-[#FD9EE0]/95 text-[#1C1009] shadow-md backdrop-blur-sm">
      <div className="w-full px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4">
        {/* One row: logo | search | nav (desktop) | menu (mobile) */}
        <div className="flex w-full items-center gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={closeMenu}
            className="inline-flex shrink-0 items-center justify-start"
          >
            {/* Height-driven + w-auto: box matches the bitmap, no huge empty strip from fill+wide parent */}
            <Image
              src="/Ozyraa.jpg"
              alt="Book Haven"
              width={900}
              height={200}
              priority
              className="h-12 w-auto max-w-[min(78vw,300px)] object-contain object-left sm:h-16 lg:h-20"
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 260px, 360px"
            />
          </Link>

          <div className="flex min-w-0 flex-1 justify-center px-1">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C1009]/55" />
              <button
                type="button"
                onClick={submitSearch}
                aria-label="Search books"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full hover:bg-black/5"
              />
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className={searchInputClass}
                aria-label="Search books"
              />
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 text-sm lg:flex xl:gap-3 xl:text-base">
            <Link href="/books" className={navLinkClass}>
              Books
            </Link>
            <Link href="/cart" className={navLinkClass}>
              Cart
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/orders" className={navLinkClass}>
                  Orders
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={navLinkClass}>
                    Admin
                  </Link>
                )}
                <Link href="/profile" className={navLinkClass}>
                  Profile
                </Link>
              </>
            )}
            {!isLoggedIn ? (
              <>
                <Link href="/login" className={navLinkClass}>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-blue-600 px-3 py-2 text-white shadow-sm transition hover:bg-blue-700 xl:px-4"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <span className="max-w-[100px] truncate text-sm xl:max-w-none">Hello, {username}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md bg-red-600 px-3 py-2 text-white shadow-sm transition hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1C1009]/40 bg-white/30 transition hover:bg-white/45 sm:h-11 sm:w-11 lg:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 rounded-xl border border-[#1C1009]/20 bg-white/35 p-2 shadow-sm lg:hidden">
            <div className="flex flex-col gap-1 text-base">
              <Link
                href="/books"
                className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                onClick={closeMenu}
              >
                Books
              </Link>
              <Link
                href="/cart"
                className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                onClick={closeMenu}
              >
                Cart
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/orders"
                    className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                    onClick={closeMenu}
                  >
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                      onClick={closeMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                </>
              )}
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2.5 transition hover:bg-black/5"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="mx-3 mt-1 rounded bg-blue-600 py-2.5 text-center text-white shadow-sm transition hover:bg-blue-700"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="mt-2 space-y-2 border-t border-[#1C1009]/15 px-3 pt-3">
                  <p className="text-sm text-[#1C1009]/80">Hello, {username}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded bg-red-600 py-2.5 text-white shadow-sm transition hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
