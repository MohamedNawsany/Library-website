import { NextResponse } from "next/server";
import { connectDB, sql } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM Categories");
    return NextResponse.json(successResponse(result.recordset));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function POST(req: Request) {
  try {
    const { Name } = await req.json();
    if (!Name) return NextResponse.json(errorResponse("Name is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("Name", sql.NVarChar, Name)
      .query("INSERT INTO Categories (Name) OUTPUT inserted.* VALUES (@Name)");

    return NextResponse.json(successResponse(result.recordset[0], 201));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function PATCH(req: Request) {
  try {
    const { CategoryID, Name } = await req.json();
    if (!CategoryID || !Name) return NextResponse.json(errorResponse("CategoryID and Name required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("CategoryID", sql.Int, CategoryID)
      .input("Name", sql.NVarChar, Name)
      .query("UPDATE Categories SET Name=@Name OUTPUT inserted.* WHERE CategoryID=@CategoryID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Category not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

export async function DELETE(req: Request) {
  try {
    const { CategoryID } = await req.json();
    if (!CategoryID) return NextResponse.json(errorResponse("CategoryID is required", 400));

    const pool = await connectDB();
    const result = await pool.request()
      .input("CategoryID", sql.Int, CategoryID)
      .query("DELETE FROM Categories OUTPUT deleted.* WHERE CategoryID=@CategoryID");

    if (result.recordset.length === 0) return NextResponse.json(errorResponse("Category not found", 404));
    return NextResponse.json(successResponse(result.recordset[0]));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}
