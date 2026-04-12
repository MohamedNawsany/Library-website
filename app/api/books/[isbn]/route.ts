import { NextResponse } from "next/server";
import { getBookByIsbn } from "@/lib/getBookByIsbn";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ isbn: string }> | { isbn: string } }
) {
  try {
    const { isbn } = await Promise.resolve(params);
    const book = await getBookByIsbn(isbn);

    if (!book) {
      return NextResponse.json(errorResponse("Book not found", 404));
    }

    return NextResponse.json(successResponse(book));
  } catch (err: any) {
    return NextResponse.json(errorResponse(err.message));
  }
}

