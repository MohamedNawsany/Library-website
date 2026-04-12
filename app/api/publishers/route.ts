import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Publishers");
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function POST(req: Request) {
  try {
    const { Name, Address, Phone } = await req.json();
    if (!Name) return NextResponse.json(errorResponse("Name is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("Name", sql.NVarChar, Name)
      .input("Address", sql.NVarChar, Address || null)
      .input("Phone", sql.NVarChar, Phone || null)
      .query("INSERT INTO Publishers (Name, Address, Phone) OUTPUT inserted.* VALUES (@Name, @Address, @Phone)");

    return NextResponse.json(successResponse(result.recordset[0], 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function PATCH(req: Request) {
  try {
    const { PublisherID, Name, Address, Phone } = await req.json();
    if (!PublisherID || !Name) return NextResponse.json(errorResponse("PublisherID and Name required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("PublisherID", sql.Int, PublisherID)
      .input("Name", sql.NVarChar, Name)
      .input("Address", sql.NVarChar, Address || null)
      .input("Phone", sql.NVarChar, Phone || null)
      .query("UPDATE Publishers SET Name=@Name, Address=@Address, Phone=@Phone OUTPUT inserted.* WHERE PublisherID=@PublisherID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Publisher not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function DELETE(req: Request) {
  try {
    const { PublisherID } = await req.json();
    if (!PublisherID) return NextResponse.json(errorResponse("PublisherID is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("PublisherID", sql.Int, PublisherID)
      .query("DELETE FROM Publishers OUTPUT deleted.* WHERE PublisherID=@PublisherID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Publisher not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
