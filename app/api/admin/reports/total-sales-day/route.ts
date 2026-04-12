import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date'); // expects format YYYY-MM-DD

    if (!date) {
      return NextResponse.json(errorResponse('Date is required', 400));
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input("Date", sql.Date, date)
      .query(`
        SELECT SUM(TotalPrice) AS TotalSales
        FROM Sales
        WHERE CAST(SaleDate AS DATE) = @Date
      `);
    
    return NextResponse.json(successResponse({
      TotalSales: result.recordset[0]?.TotalSales || 0,
      Date: date
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
