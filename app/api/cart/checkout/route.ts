import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const { CustomerID } = await req.json();
    if (!CustomerID) {
      return NextResponse.json(errorResponse("CustomerID is required", 400));
    }

    const pool = await connectDB();

    // Get cart items
    const cart = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .query(`
        SELECT c.CartID, ci.ISBN, ci.Quantity, b.Price
        FROM CartItems ci
        JOIN Carts c ON c.CartID = ci.CartID
        JOIN Books b ON b.ISBN = ci.ISBN
        WHERE c.CustomerID = @CustomerID
      `);

    if (cart.recordset.length === 0) {
      return NextResponse.json(errorResponse("Cart is empty", 400));
    }

    const cartID = cart.recordset[0].CartID;

    // Calculate total price
    let total = 0;
    cart.recordset.forEach((i: any) => {
      total += Number(i.Price) * Number(i.Quantity);
    });

    // Create Sale
    const sale = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .input("TotalPrice", sql.Decimal(10, 2), total)
      .query("INSERT INTO Sales (CustomerID, TotalPrice) OUTPUT inserted.SaleID VALUES (@CustomerID, @TotalPrice)");

    const saleID = sale.recordset[0].SaleID;

    // Insert sale items + update stock
    for (const item of cart.recordset) {
      await pool.request()
        .input("SaleID", sql.Int, saleID)
        .input("ISBN", sql.NVarChar, item.ISBN)
        .input("Quantity", sql.Int, item.Quantity)
        .input("Price", sql.Decimal(10, 2), item.Price)
        .query("INSERT INTO SaleItems (SaleID, ISBN, Quantity, Price) VALUES (@SaleID, @ISBN, @Quantity, @Price)");

      await pool.request()
        .input("Quantity", sql.Int, item.Quantity)
        .input("ISBN", sql.NVarChar, item.ISBN)
        .query("UPDATE Books SET QuantityInStock = QuantityInStock - @Quantity WHERE ISBN = @ISBN");
    }

    // Clear cart
    await pool.request()
      .input("CartID", sql.Int, cartID)
      .query("DELETE FROM CartItems WHERE CartID = @CartID");

    return NextResponse.json(successResponse({ 
      message: "Checkout completed successfully", 
      SaleID: saleID 
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

