import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isbn = url.searchParams.get("isbn");
    const title = url.searchParams.get("title");
    const category = url.searchParams.get("category");
    const author = url.searchParams.get("author");
    const publisher = url.searchParams.get("publisher");

    const pool = await connectDB();
    let query = `
      SELECT DISTINCT b.*, p.Name AS PublisherName, c.Name AS CategoryName
      FROM Books b
      JOIN Publishers p ON b.PublisherID = p.PublisherID
      JOIN Categories c ON b.CategoryID = c.CategoryID
      WHERE 1=1
    `;

    const request = pool.request();

    if (isbn) {
      query += ` AND b.ISBN LIKE @ISBN`;
      request.input("ISBN", sql.NVarChar, `%${isbn}%`);
    }

    if (title) {
      query += ` AND b.Title LIKE @Title`;
      request.input("Title", sql.NVarChar, `%${title}%`);
    }

    if (category) {
      query += ` AND c.Name = @Category`;
      request.input("Category", sql.NVarChar, category);
    }

    if (publisher) {
      query += ` AND p.Name LIKE @Publisher`;
      request.input("Publisher", sql.NVarChar, `%${publisher}%`);
    }

    if (author) {
      query += `
        AND b.ISBN IN (
          SELECT ba.ISBN
          FROM BookAuthors ba
          JOIN Authors a ON ba.AuthorID = a.AuthorID
          WHERE a.AuthorName LIKE @Author
        )
      `;
      request.input("Author", sql.NVarChar, `%${author}%`);
    }

    const booksResult = await request.query(query);
    const books = booksResult.recordset;

    // Get authors for each book
    for (const book of books) {
      const authorsResult = await pool.request()
        .input("ISBN", sql.NVarChar, book.ISBN)
        .query(`
          SELECT a.AuthorID, a.AuthorName
          FROM Authors a
          JOIN BookAuthors ba ON a.AuthorID = ba.AuthorID
          WHERE ba.ISBN = @ISBN
        `);
      book.Authors = authorsResult.recordset;
    }

    return NextResponse.json(successResponse(books));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

