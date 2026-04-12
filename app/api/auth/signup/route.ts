import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const { Username, UserPassword, FirstName, LastName, Email, Phone, ShippingAddress } = await req.json();

    if (!Username || !UserPassword || !FirstName || !LastName || !Email || !ShippingAddress) {
      return NextResponse.json(errorResponse("Missing required fields", 400));
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input("Username", sql.NVarChar, Username)
      .input("UserPassword", sql.NVarChar, UserPassword)
      .input("FirstName", sql.NVarChar, FirstName)
      .input("LastName", sql.NVarChar, LastName)
      .input("Email", sql.NVarChar, Email)
      .input("Phone", sql.NVarChar, Phone || null)
      .input("ShippingAddress", sql.NVarChar, ShippingAddress)
      .query(`
        INSERT INTO Customers (Username, UserPassword, FirstName, LastName, Email, Phone, ShippingAddress)
        OUTPUT inserted.CustomerID, inserted.Username, inserted.FirstName, inserted.LastName, inserted.Email
        VALUES (@Username, @UserPassword, @FirstName, @LastName, @Email, @Phone, @ShippingAddress)
      `);

    return NextResponse.json(successResponse({ 
      message: "User created successfully", 
      user: result.recordset[0] 
    }, 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
