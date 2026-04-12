import { connectDB, sql } from '@/lib/db';

/** Row shape returned for book detail (matches DB + joins). */
export type BookWithAuthors = {
  ISBN: string;
  Title: string;
  Price: string | number;
  QuantityInStock: number;
  PublisherName: string;
  CategoryName?: string | null;
  PublicationYear?: number | null;
  Threshold?: number | null;
  ImageURL?: string | null;
  Authors?: { AuthorID?: number; AuthorName: string }[];
};

function safeDecodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Single source of truth for book-by-ISBN (used by API route and book detail page). */
export async function getBookByIsbn(isbn: string): Promise<BookWithAuthors | null> {
  const trimmed = safeDecodeSegment(isbn).trim();
  if (!trimmed) return null;

  const pool = await connectDB();

  const bookResult = await pool
    .request()
    .input('isbn', sql.NVarChar, trimmed)
    .query(`
        SELECT b.*,
               p.Name AS PublisherName,
               c.Name AS CategoryName
        FROM Books b
        JOIN Publishers p ON b.PublisherID = p.PublisherID
        JOIN Categories c ON b.CategoryID = c.CategoryID
        WHERE b.ISBN = @isbn
      `);

  if (bookResult.recordset.length === 0) {
    return null;
  }

  const book = bookResult.recordset[0] as BookWithAuthors;

  const authorsResult = await pool
    .request()
    .input('ISBN', sql.NVarChar, trimmed)
    .query(`
        SELECT a.AuthorID, a.AuthorName
        FROM Authors a
        JOIN BookAuthors ba ON a.AuthorID = ba.AuthorID
        WHERE ba.ISBN = @ISBN
      `);

  book.Authors = authorsResult.recordset;

  return book;
}
