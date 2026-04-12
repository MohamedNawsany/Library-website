import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT TOP 10 
        b.ISBN, 
        b.Title, 
        SUM(si.Quantity) AS TotalSold
      FROM Books b
      JOIN SaleItems si ON b.ISBN = si.ISBN
      JOIN Sales s ON si.SaleID = s.SaleID
      WHERE s.SaleDate >= DATEADD(MONTH, -3, GETDATE())
      GROUP BY b.ISBN, b.Title
      ORDER BY TotalSold DESC
    `);
    
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
