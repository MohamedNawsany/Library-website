import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

// GET all customers
export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`SELECT CustomerID, Username, FirstName, LastName, Email, Phone, ShippingAddress, IsAdmin, CreatedAt, UpdatedAt FROM Customers`);
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// POST create customer
export async function POST(req: Request) {
  try {
    const { Username, UserPassword, FirstName, LastName, Email, Phone, ShippingAddress, IsAdmin } = await req.json();
    if (!Username || !UserPassword) return NextResponse.json(errorResponse("Username and Password required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("Username", sql.NVarChar, Username)
      .input("UserPassword", sql.NVarChar, UserPassword)
      .input("FirstName", sql.NVarChar, FirstName)
      .input("LastName", sql.NVarChar, LastName)
      .input("Email", sql.NVarChar, Email)
      .input("Phone", sql.NVarChar, Phone)
      .input("ShippingAddress", sql.NVarChar, ShippingAddress)
      .input("IsAdmin", sql.Bit, IsAdmin ?? 0)
      .query(`INSERT INTO Customers (Username, UserPassword, FirstName, LastName, Email, Phone, ShippingAddress, IsAdmin)
              OUTPUT inserted.* VALUES (@Username, @UserPassword, @FirstName, @LastName, @Email, @Phone, @ShippingAddress, @IsAdmin)`);

    return NextResponse.json(successResponse(result.recordset[0], 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// PATCH customer
export async function PATCH(req: Request) {
  try {
    const { CustomerID, Username, FirstName, LastName, Email, Phone, ShippingAddress, IsAdmin } = await req.json();
    if (!CustomerID) return NextResponse.json(errorResponse("CustomerID is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .input("Username", sql.NVarChar, Username)
      .input("FirstName", sql.NVarChar, FirstName)
      .input("LastName", sql.NVarChar, LastName)
      .input("Email", sql.NVarChar, Email)
      .input("Phone", sql.NVarChar, Phone)
      .input("ShippingAddress", sql.NVarChar, ShippingAddress)
      .input("IsAdmin", sql.Bit, IsAdmin)
      .query(`UPDATE Customers SET Username=@Username, FirstName=@FirstName, LastName=@LastName, Email=@Email, Phone=@Phone, ShippingAddress=@ShippingAddress, IsAdmin=@IsAdmin
              OUTPUT inserted.* WHERE CustomerID=@CustomerID`);

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Customer not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

// DELETE customer
export async function DELETE(req: Request) {
  try {
    const { CustomerID } = await req.json();
    if (!CustomerID) return NextResponse.json(errorResponse("CustomerID is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("CustomerID", sql.Int, CustomerID)
      .query("DELETE FROM Customers OUTPUT deleted.* WHERE CustomerID=@CustomerID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Customer not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
