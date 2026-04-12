import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// GET orders for a customer
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerID = url.searchParams.get("customer");
    
    if (!customerID) {
      return NextResponse.json(errorResponse("CustomerID is required", 400));
    }

    const pool = await connectDB();
    
    // Get all sales for the customer
    const salesResult = await pool.request()
      .input("CustomerID", sql.Int, parseInt(customerID))
      .query(`
        SELECT s.SaleID, s.SaleDate, s.TotalPrice
        FROM Sales s
        WHERE s.CustomerID = @CustomerID
        ORDER BY s.SaleDate DESC
      `);

    const sales = salesResult.recordset;

    // Get items for each sale
    for (const sale of sales) {
      const itemsResult = await pool.request()
        .input("SaleID", sql.Int, sale.SaleID)
        .query(`
          SELECT si.ISBN, si.Quantity, si.Price, b.Title
          FROM SaleItems si
          JOIN Books b ON si.ISBN = b.ISBN
          WHERE si.SaleID = @SaleID
        `);
      sale.Items = itemsResult.recordset;
    }

    return NextResponse.json(successResponse(sales));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

