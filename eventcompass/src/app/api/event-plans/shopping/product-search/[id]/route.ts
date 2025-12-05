import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { getJson } from "serpapi";

interface ProductSearchRequest {
  query: string;
  maxPrice?: number; // Maximum price based on budget
  eventContext?: {
    eventName?: string;
    eventType?: string;
    keywords?: string[];
  };
}

export async function POST(
    request: NextRequest,
) {
  try {
    const body: ProductSearchRequest = await request.json();
    const { query, maxPrice, eventContext } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Build enhanced query with event context
    let enhancedQuery = query;
    if (eventContext?.eventType) {
      enhancedQuery = `${query} for ${eventContext.eventType}`;
    }

    // Call SerpAPI
    const results = await getJson({
      engine: "google_shopping",
      q: enhancedQuery,
      api_key: process.env.SERPAPI_KEY,
      num: 10, // Get more results to filter
      gl: "us", // Country
    });

    if (!results.shopping_results || results.shopping_results.length === 0) {
      return NextResponse.json({
        products: [],
        message: "No products found",
      });
    }

    // Parse and filter results
    const products = results.shopping_results
      .map((result: any) => {
        // Extract price (handle different formats)
        let price = 0;
        if (result.extracted_price) {
          price = result.extracted_price;
        } else if (result.price) {
          // Parse price string like "$12.99" or "12.99"
          const priceStr = result.price.replace(/[^0-9.]/g, "");
          price = parseFloat(priceStr) || 0;
        }

        return {
          name: result.title || "Unknown Product",
          vendor: result.source || "Unknown Vendor",
          price: price,
          rating: result.rating || 0,
          reviews: result.reviews || 0,
          link: result.link || "",
          image: result.thumbnail || result.image || "",
          position: result.position || 999,
        };
      })
      // Filter by max price if provided
      .filter((product: any) => {
        if (!maxPrice) return true;
        return product.price > 0 && product.price <= maxPrice;
      })
      // Filter out products with no price or link
      .filter((product: any) => product.price > 0 && product.link)
      // Sort by rating and reviews
      .sort((a: any, b: any) => {
        // Prioritize products with ratings
        if (a.rating > 0 && b.rating === 0) return -1;
        if (a.rating === 0 && b.rating > 0) return 1;
        // Then by rating value
        if (a.rating !== b.rating) return b.rating - a.rating;
        // Then by number of reviews
        return b.reviews - a.reviews;
      })
      // Take top 6 results
      .slice(0, 6);

    return NextResponse.json({
      products,
      query: enhancedQuery,
      totalResults: results.shopping_results.length,
      filteredByPrice: !!maxPrice,
    });
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { 
        error: "Failed to search products",
        details: error.message 
      },
      { status: 500 }
    );
  }
}