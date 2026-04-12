import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Authors");
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function POST(req: Request) {
  try {
    const { AuthorName } = await req.json();
    if (!AuthorName) return NextResponse.json(errorResponse("AuthorName is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("AuthorName", sql.NVarChar, AuthorName)
      .query("INSERT INTO Authors (AuthorName) OUTPUT inserted.* VALUES (@AuthorName)");

    return NextResponse.json(successResponse(result.recordset[0], 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function PATCH(req: Request) {
  try {
    const { AuthorID, AuthorName } = await req.json();
    if (!AuthorID || !AuthorName) return NextResponse.json(errorResponse("AuthorID and AuthorName are required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("AuthorID", sql.Int, AuthorID)
      .input("AuthorName", sql.NVarChar, AuthorName)
      .query("UPDATE Authors SET AuthorName=@AuthorName OUTPUT inserted.* WHERE AuthorID=@AuthorID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Author not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function DELETE(req: Request) {
  try {
    const { AuthorID } = await req.json();
    if (!AuthorID) return NextResponse.json(errorResponse("AuthorID is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("AuthorID", sql.Int, AuthorID)
      .query("DELETE FROM Authors OUTPUT deleted.* WHERE AuthorID=@AuthorID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Author not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
