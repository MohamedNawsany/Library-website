import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    
    // Get total books
    const booksResult = await pool.request().query("SELECT COUNT(*) AS Total FROM Books");
    const totalBooks = booksResult.recordset[0]?.Total || 0;

    // Get total customers
    const customersResult = await pool.request().query("SELECT COUNT(*) AS Total FROM Customers");
    const totalCustomers = customersResult.recordset[0]?.Total || 0;

    // Get total sales (sum of all sales)
    const salesResult = await pool.request().query(`
      SELECT ISNULL(SUM(TotalPrice), 0) AS TotalSales
      FROM Sales
    `);
    const totalSales = salesResult.recordset[0]?.TotalSales || 0;

    // Get pending orders
    const ordersResult = await pool.request().query(`
      SELECT COUNT(*) AS Total
      FROM StockOrders
      WHERE Status = 'Pending'
    `);
    const pendingOrders = ordersResult.recordset[0]?.Total || 0;

    return NextResponse.json(successResponse({
      totalBooks,
      totalCustomers,
      totalSales,
      pendingOrders
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

