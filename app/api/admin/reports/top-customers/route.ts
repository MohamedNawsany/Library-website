import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT TOP 5
        c.CustomerID,
        c.Username,
        c.FirstName,
        c.LastName,
        SUM(s.TotalPrice) AS TotalPurchase
      FROM Customers c
      JOIN Sales s ON c.CustomerID = s.CustomerID
      WHERE s.SaleDate >= DATEADD(MONTH, -3, GETDATE())
      GROUP BY c.CustomerID, c.Username, c.FirstName, c.LastName
      ORDER BY TotalPurchase DESC
    `);
    
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

