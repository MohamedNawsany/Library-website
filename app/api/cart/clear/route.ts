import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// POST clear cart for a customer (called on logout)
export async function POST(req: Request) {
  try {
    const { CustomerID } = await req.json();
    if (!CustomerID) {
      return NextResponse.json(errorResponse("CustomerID is required", 400));
    }

    const pool = await connectDB();

    // Get cart ID
    const cartResult = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .query("SELECT CartID FROM Carts WHERE CustomerID = @CustomerID");

    if (cartResult.recordset.length > 0) {
      const cartID = cartResult.recordset[0].CartID;

      // Delete all cart items
      await pool.request()
        .input("CartID", sql.Int, cartID)
        .query("DELETE FROM CartItems WHERE CartID = @CartID");
    }

    return NextResponse.json(successResponse({ message: "Cart cleared successfully" }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

