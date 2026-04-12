import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// GET all publisher orders
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // 'Pending' or 'Confirmed'

    const pool = await connectDB();
    let query = `
      SELECT 
        o.OrderID,
        o.ISBN,
        o.QuantityOrdered,
        o.OrderDate,
        o.Status,
        o.UpdatedAt,
        b.Title AS BookTitle,
        p.Name AS PublisherName
      FROM StockOrders o
      JOIN Books b ON o.ISBN = b.ISBN
      JOIN Publishers p ON b.PublisherID = p.PublisherID
    `;

    const request = pool.request();
    if (status) {
      query += ` WHERE o.Status = @Status`;
      request.input("Status", sql.NVarChar, status);
    }

    query += ` ORDER BY o.OrderDate DESC`;

    const result = await request.query(query);
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// POST confirm an order
export async function POST(req: Request) {
  try {
    const { OrderID } = await req.json();
    if (!OrderID) {
      return NextResponse.json(errorResponse("OrderID is required", 400));
    }

    const pool = await connectDB();

    // Get order details
    const orderResult = await pool.request()
      .input("OrderID", sql.Int, OrderID)
      .query(`
        SELECT o.*, b.ISBN
        FROM StockOrders o
        JOIN Books b ON o.ISBN = b.ISBN
        WHERE o.OrderID = @OrderID AND o.Status = 'Pending'
      `);

    if (orderResult.recordset.length === 0) {
      return NextResponse.json(errorResponse("Order not found or already confirmed", 404));
    }

    const order = orderResult.recordset[0];

    // Update order status - the trigger trg_ConfirmStockOrder will automatically add the quantity to stock
    await pool.request()
      .input("OrderID", sql.Int, OrderID)
      .query(`UPDATE StockOrders SET Status = 'Confirmed', UpdatedAt = SYSDATETIME() WHERE OrderID = @OrderID`);

    return NextResponse.json(successResponse({ message: "Order confirmed successfully" }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

