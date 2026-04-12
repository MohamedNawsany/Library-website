import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// GET all books
export async function GET() {
  try {
    const pool = await connectDB();
    const booksResult = await pool.request().query(`
      SELECT b.*, p.Name AS PublisherName, c.Name AS CategoryName
      FROM Books b
      JOIN Publishers p ON b.PublisherID = p.PublisherID
      JOIN Categories c ON b.CategoryID = c.CategoryID
    `);

    const books = booksResult.recordset;
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

// GET by ISBN
export async function GET_BY_ISBN(req: Request, { params }: { params: { isbn: string } }) {
  try {
    const pool = await connectDB();
    const { isbn } = params;

    const bookResult = await pool.request()
      .input("isbn", sql.NVarChar, isbn)
      .query(`
        SELECT b.*, p.Name AS PublisherName, c.Name AS CategoryName
        FROM Books b
        JOIN Publishers p ON b.PublisherID = p.PublisherID
        JOIN Categories c ON b.CategoryID = c.CategoryID
        WHERE b.ISBN = @isbn
      `);

    if (bookResult.recordset.length === 0) return NextResponse.json(errorResponse("Book not found", 404));

    const book = bookResult.recordset[0];
    const authorsResult = await pool.request()
      .input("ISBN", sql.NVarChar, isbn)
      .query(`
        SELECT a.AuthorID, a.AuthorName
        FROM Authors a
        JOIN BookAuthors ba ON a.AuthorID = ba.AuthorID
        WHERE ba.ISBN = @ISBN
      `);
    book.Authors = authorsResult.recordset;

    return NextResponse.json(successResponse(book));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// POST new book
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ISBN, Title, PublicationYear, Price, CategoryID, Threshold, QuantityInStock, PublisherID, AuthorIDs , ImageURL } = body;
    if (!ISBN || !Title || !CategoryID || !PublisherID) return NextResponse.json(errorResponse("Missing required fields", 400));

    const pool = await connectDB();
    await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Title", sql.NVarChar, Title)
      .input("PublicationYear", sql.Int, PublicationYear)
      .input("Price", sql.Decimal(10,2), Price)
      .input("CategoryID", sql.Int, CategoryID)
      .input("Threshold", sql.Int, Threshold)
      .input("QuantityInStock", sql.Int, QuantityInStock)
      .input("PublisherID", sql.Int, PublisherID)
      .input("ImageURL", sql.NVarChar, ImageURL|| null)
      .query(`
        INSERT INTO Books (ISBN, Title, PublicationYear, Price, CategoryID, Threshold, QuantityInStock, PublisherID, ImageURL)
        VALUES (@ISBN, @Title, @PublicationYear, @Price, @CategoryID, @Threshold, @QuantityInStock, @PublisherID, @ImageURL)
      `);

    // BookAuthors
    if (Array.isArray(AuthorIDs) && AuthorIDs.length > 0) {
      for (const AuthorID of AuthorIDs) {
        await pool.request()
          .input("ISBN", sql.NVarChar, ISBN)
          .input("AuthorID", sql.Int, AuthorID)
          .query("INSERT INTO BookAuthors (ISBN, AuthorID) VALUES (@ISBN, @AuthorID)");
      }
    }

    return NextResponse.json(successResponse({ message: "Book added successfully" }, 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// PATCH book
// PATCH book
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      ISBN,
      Title,
      PublicationYear,
      Price,
      CategoryID,
      Threshold,
      QuantityInStock,
      PublisherID,
      AuthorIDs,
      ImageURL
    } = body;

    if (!ISBN) {
      return NextResponse.json(errorResponse("ISBN is required", 400));
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Title", sql.NVarChar, Title)
      .input("PublicationYear", sql.Int, PublicationYear)
      .input("Price", sql.Decimal(10, 2), Price)
      .input("CategoryID", sql.Int, CategoryID)
      .input("Threshold", sql.Int, Threshold)
      .input("QuantityInStock", sql.Int, QuantityInStock)
      .input("PublisherID", sql.Int, PublisherID)
      .input("ImageURL", sql.NVarChar, ImageURL ?? null)
      .query(`
        UPDATE Books
        SET Title=@Title,
            PublicationYear=@PublicationYear,
            Price=@Price,
            CategoryID=@CategoryID,
            Threshold=@Threshold,
            QuantityInStock=@QuantityInStock,
            PublisherID=@PublisherID,
            ImageURL=@ImageURL
        WHERE ISBN=@ISBN
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(errorResponse("Book not found", 404));
    }

    // Update authors
    if (Array.isArray(AuthorIDs)) {
      await pool.request()
        .input("ISBN", sql.NVarChar, ISBN)
        .query("DELETE FROM BookAuthors WHERE ISBN=@ISBN");

      for (const AuthorID of AuthorIDs) {
        await pool.request()
          .input("ISBN", sql.NVarChar, ISBN)
          .input("AuthorID", sql.Int, AuthorID)
          .query("INSERT INTO BookAuthors (ISBN, AuthorID) VALUES (@ISBN, @AuthorID)");
      }
    }

    return NextResponse.json(
      successResponse({ message: "Book updated successfully" })
    );
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}


// DELETE book
export async function DELETE(req: Request) {
  try {
    const { ISBN } = await req.json();
    if (!ISBN) return NextResponse.json(errorResponse("ISBN is required", 400));

    const pool = await connectDB();
    await pool.request().input("ISBN", sql.NVarChar, ISBN).query("DELETE FROM BookAuthors WHERE ISBN=@ISBN");
    const result = await pool.request().input("ISBN", sql.NVarChar, ISBN).query("DELETE FROM Books OUTPUT deleted.* WHERE ISBN=@ISBN");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Book not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

