import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT SUM(TotalPrice) AS TotalSales
      FROM Sales
      WHERE SaleDate >= DATEADD(MONTH, -1, GETDATE()) 
        AND SaleDate < GETDATE()
    `);
    
    return NextResponse.json(successResponse({
      TotalSales: result.recordset[0]?.TotalSales || 0,
      Period: 'Previous Month'
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
