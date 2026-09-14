import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");
    const apiKey = process.env.REELDB_API_KEY;

    if (!query || query.trim().length < 2) {
        return NextResponse.json({
            Search: [],
            totalResults: "0",
            Response: "False",
        });
    }

    if (!apiKey) {
        return NextResponse.json(
            { error: "REELDB_API_KEY is not configured" },
            { status: 500 }
        );
    }

    const url = new URL("https://api.reeldb.io/omdb");

    url.searchParams.set("s", query.trim());
    url.searchParams.set("type", "movie");
    url.searchParams.set("apikey", apiKey);

    try {
        const response = await fetch(url.toString());

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: "ReelDB request failed",
                    details: data,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("ReelDB error:", error);

        return NextResponse.json(
            { error: "Failed to fetch movies" },
            { status: 500 }
        );
    }
}