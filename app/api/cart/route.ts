import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// GET cart for customer
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerID = url.searchParams.get("customer");
    if (!customerID) return NextResponse.json(errorResponse("CustomerID required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("CustomerID", sql.Int, parseInt(customerID))
      .query(`
   SELECT ci.ISBN, b.Title, b.Price, ci.Quantity, b.QuantityInStock, b.Threshold
FROM CartItems ci
JOIN Carts c ON c.CartID = ci.CartID
JOIN Books b ON b.ISBN = ci.ISBN
WHERE c.CustomerID = @CustomerID
      `);

    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// POST add item to cart & update stock
export async function POST(req: Request) {
  try {
    const { CustomerID, ISBN, Quantity } = await req.json();
    if (!CustomerID || !ISBN || Quantity < 1) 
      return NextResponse.json(errorResponse("Missing or invalid fields", 400));

    const pool = await connectDB();

    // 1️⃣ Check book stock
    const bookResult = await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .query("SELECT QuantityInStock FROM Books WHERE ISBN=@ISBN");

    if (bookResult.recordset.length === 0) 
      return NextResponse.json(errorResponse("Book not found", 404));

    const currentStock = bookResult.recordset[0].QuantityInStock;
    if (currentStock < Quantity) 
      return NextResponse.json(errorResponse("Not enough stock", 400));

    // 2️⃣ Ensure cart exists
    const cartResult = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .query("SELECT CartID FROM Carts WHERE CustomerID=@CustomerID");

    let cartID: number;
    if (cartResult.recordset.length === 0) {
      const newCart = await pool.request()
        .input("CustomerID", sql.Int, CustomerID)
        .query("INSERT INTO Carts (CustomerID) OUTPUT inserted.CartID VALUES (@CustomerID)");
      cartID = newCart.recordset[0].CartID;
    } else {
      cartID = cartResult.recordset[0].CartID;
    }

    // 3️⃣ Add or update cart item
    await pool.request()
      .input("CartID", sql.Int, cartID)
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Quantity", sql.Int, Quantity)
      .query(`
        MERGE CartItems AS t
        USING (SELECT @CartID AS CartID, @ISBN AS ISBN) AS s
        ON t.CartID = s.CartID AND t.ISBN = s.ISBN
        WHEN MATCHED THEN UPDATE SET Quantity = t.Quantity + @Quantity
        WHEN NOT MATCHED THEN INSERT (CartID, ISBN, Quantity) VALUES (@CartID, @ISBN, @Quantity);
      `);

    // 4️⃣ Update book stock
    await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Quantity", sql.Int, Quantity)
      .query(`
        UPDATE Books 
        SET QuantityInStock = QuantityInStock - @Quantity, 
            UpdatedAt = SYSDATETIME() 
        WHERE ISBN = @ISBN
      `);

    return NextResponse.json(successResponse({ message: "Added to cart" }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// PATCH update cart item quantity & adjust stock
export async function PATCH(req: Request) {
  try {
    const { CustomerID, ISBN, Quantity } = await req.json();
    if (!CustomerID || !ISBN || Quantity < 1)
      return NextResponse.json(errorResponse("Invalid data", 400));

    const pool = await connectDB();

    // Get cart ID
    const cartResult = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .query("SELECT CartID FROM Carts WHERE CustomerID=@CustomerID");

    if (!cartResult.recordset.length) 
      return NextResponse.json(errorResponse("Cart not found", 404));

    const cartID = cartResult.recordset[0].CartID;

    // Get current quantity in cart
    const cartItem = await pool.request()
      .input("CartID", sql.Int, cartID)
      .input("ISBN", sql.NVarChar, ISBN)
      .query("SELECT Quantity FROM CartItems WHERE CartID=@CartID AND ISBN=@ISBN");

    if (!cartItem.recordset.length) 
      return NextResponse.json(errorResponse("Item not in cart", 404));

    const currentQty = cartItem.recordset[0].Quantity;

    // Adjust stock difference
    const diff = Quantity - currentQty;

    // Check stock availability
    const bookResult = await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .query("SELECT QuantityInStock FROM Books WHERE ISBN=@ISBN");

    if (bookResult.recordset[0].QuantityInStock < diff)
      return NextResponse.json(errorResponse("Not enough stock", 400));

    // Update cart quantity
    await pool.request()
      .input("CartID", sql.Int, cartID)
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Quantity", sql.Int, Quantity)
      .query("UPDATE CartItems SET Quantity=@Quantity WHERE CartID=@CartID AND ISBN=@ISBN");

    // Update book stock
    await pool.request()
      .input("ISBN", sql.NVarChar, ISBN)
      .input("Diff", sql.Int, diff)
      .query("UPDATE Books SET QuantityInStock = QuantityInStock - @Diff, UpdatedAt=SYSDATETIME() WHERE ISBN=@ISBN");

    return NextResponse.json(successResponse({ message: "Cart updated" }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// DELETE remove item from cart & restore stock
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const customerID = url.searchParams.get("customer");
    const isbn = url.searchParams.get("isbn");

    if (!customerID || !isbn)
      return NextResponse.json(errorResponse("CustomerID and ISBN are required", 400));

    const pool = await connectDB();

    // Get cart ID
    const cartResult = await pool.request()
      .input("CustomerID", sql.Int, parseInt(customerID))
      .query("SELECT CartID FROM Carts WHERE CustomerID=@CustomerID");

    if (!cartResult.recordset.length) 
      return NextResponse.json(errorResponse("Cart not found", 404));

    const cartID = cartResult.recordset[0].CartID;

    // Get current quantity to restore stock
    const cartItem = await pool.request()
      .input("CartID", sql.Int, cartID)
      .input("ISBN", sql.NVarChar, isbn)
      .query("SELECT Quantity FROM CartItems WHERE CartID=@CartID AND ISBN=@ISBN");

    if (!cartItem.recordset.length) 
      return NextResponse.json(errorResponse("Item not found in cart", 404));

    const qty = cartItem.recordset[0].Quantity;

    // Remove item from cart
    await pool.request()
      .input("CartID", sql.Int, cartID)
      .input("ISBN", sql.NVarChar, isbn)
      .query("DELETE FROM CartItems WHERE CartID=@CartID AND ISBN=@ISBN");

    // Restore stock
    await pool.request()
      .input("ISBN", sql.NVarChar, isbn)
      .input("Quantity", sql.Int, qty)
      .query("UPDATE Books SET QuantityInStock = QuantityInStock + @Quantity, UpdatedAt=SYSDATETIME() WHERE ISBN=@ISBN");

    return NextResponse.json(successResponse({ message: "Item removed from cart" }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
