import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const pool = await connectDB();
    const result = await pool.request()
      .input("CustomerID", sql.Int, parseInt(id))
      .query(`
        SELECT CustomerID, Username, FirstName, LastName, Email, Phone, ShippingAddress, IsAdmin, CreatedAt, UpdatedAt
        FROM Customers
        WHERE CustomerID = @CustomerID
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(errorResponse("Customer not found", 404));
    }

    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
