import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const { Username, UserPassword } = await req.json();
    if (!Username || !UserPassword) {
      return NextResponse.json(errorResponse("Username and Password are required", 400));
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input("Username", sql.NVarChar, Username)
      .input("UserPassword", sql.NVarChar, UserPassword)
      .query(`
        SELECT CustomerID, Username, FirstName, LastName, Email, IsAdmin
        FROM Customers
        WHERE Username = @Username AND UserPassword = @UserPassword
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(errorResponse("Invalid credentials", 401));
    }

    const user = result.recordset[0];
    return NextResponse.json(successResponse({ 
      message: "Login successful", 
      user: {
        CustomerID: user.CustomerID,
        Username: user.Username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        IsAdmin: user.IsAdmin
      }
    }));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
