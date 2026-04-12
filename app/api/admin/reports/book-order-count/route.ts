import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isbn = url.searchParams.get('isbn');

    if (!isbn) {
      return NextResponse.json(errorResponse('ISBN is required', 400));
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input("ISBN", sql.NVarChar, isbn)
      .query(`
        SELECT COUNT(*) AS TotalOrders
        FROM StockOrders
        WHERE ISBN = @ISBN
      `);
    
    return NextResponse.json(successResponse({
      TotalOrders: result.recordset[0]?.TotalOrders || 0,
      ISBN: isbn
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
