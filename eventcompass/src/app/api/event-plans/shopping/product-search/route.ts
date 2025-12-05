import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { getJson } from "serpapi";

interface ProductSearchRequest {
  query: string;
  maxPrice?: number; // Maximum price based on budget
  minPrice?: number;
}

async function searchAmazon(query: string, minPrice?: number, maxPrice?: number) {
  try {
    const params: any = {
      engine: "amazon",
      amazon_domain: "amazon.com",
      k: query,
      api_key: process.env.SERPAPI_KEY,
    };

    const results = await getJson(params);
    
    if (!results.organic_results) return [];

    return results.organic_results
      .map((result: any) => {
        // Parse Amazon price
        let price = 0;
        if (result.price?.value) {
          price = result.price.value;
        } else if (result.price) {
          const priceStr = String(result.price).replace(/[^0-9.]/g, "");
          price = parseFloat(priceStr) || 0;
        }

        // Parse rating (Amazon returns as "4.5 out of 5 stars")
        let rating = 0;
        if (result.rating) {
          const ratingMatch = String(result.rating).match(/[\d.]+/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[0]) || 0;
          }
        }

        // Parse reviews count
        let reviews = 0;
        if (result.reviews_count) {
          const reviewStr = String(result.reviews_count).replace(/[^0-9]/g, "");
          reviews = parseInt(reviewStr) || 0;
        } else if (result.reviews) {
          const reviewStr = String(result.reviews).replace(/[^0-9]/g, "");
          reviews = parseInt(reviewStr) || 0;
        }

        return {
          name: result.title || "Unknown Product",
          vendor: "Amazon",
          price: price,
          rating: rating,
          reviews: reviews,
          link: result.link || "",
          image: result.thumbnail || result.image || "",
          source: "Amazon",
          isPrime: result.is_prime || false, // Amazon Prime eligible
          delivery: result.delivery || null,
        };
      })
      .filter((p: any) => {
        if (p.price === 0 || !p.link) return false;
        if (minPrice && p.price < minPrice) return false;
        if (maxPrice && p.price > maxPrice) return false;
        return true;
      });
  } catch (error) {
    console.error("Amazon search error:", error);
    return [];
  }
}

async function searchGoogleShopping(query: string, minPrice?: number, maxPrice?: number) {
  try {
    const params: any = {
      engine: "google_shopping",
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num: 15,
      gl: "us",
      hl: "en",
    };

    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    const results = await getJson(params);
    
    if (!results.shopping_results) return [];

    return results.shopping_results
      .map((result: any) => {
        let price = 0;
        if (result.extracted_price) {
          price = result.extracted_price;
        } else if (result.price) {
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
          image: result.thumbnail || "",
          source: "Google Shopping",
          isPrime: false,
          delivery: result.delivery || null,
        };
      })
      .filter((p: any) => p.price > 0 && p.link);
  } catch (error) {
    console.error("Google Shopping search error:", error);
    return [];
  }
}

function deduplicateProducts(products: any[]) {
  const seen = new Map();
  
  for (const product of products) {
    // Create a key based on similar products
    const normalizedName = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
    const priceKey = Math.round(product.price * 2) / 2; // Group by $0.50 increments
    const key = `${normalizedName.substring(0, 40)}_${priceKey}`;
    
    if (!seen.has(key)) {
      seen.set(key, product);
    } else {
      // If duplicate, prefer Amazon, then the one with more reviews
      const existing = seen.get(key);
      if (product.source === "Amazon" && existing.source !== "Amazon") {
        seen.set(key, product);
      } else if (product.reviews > existing.reviews) {
        seen.set(key, product);
      }
    }
  }
  
  return Array.from(seen.values());
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, minPrice, maxPrice, } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Build enhanced query

    console.log("Starting search with query:", query);

    // STEP 1: Search Amazon first
    let products = await searchAmazon(query, minPrice, maxPrice);
    console.log(`Amazon results: ${products.length} products`);

    // STEP 2: If Amazon returns fewer than 4 results, supplement with Google Shopping
    if (products.length < 4) {
      console.log("Limited Amazon results, searching Google Shopping...");
      const googleProducts = await searchGoogleShopping(query, minPrice, maxPrice);
      console.log(`Google Shopping results: ${googleProducts.length} products`);
      
      products = [...products, ...googleProducts];
      products = deduplicateProducts(products);
    }

    // STEP 3: Sort by quality indicators
    products = products
      .sort((a, b) => {
        // Prioritize Amazon Prime
        if (a.isPrime && !b.isPrime) return -1;
        if (!a.isPrime && b.isPrime) return 1;
        
        // Then by rating
        if (a.rating > 0 && b.rating === 0) return -1;
        if (a.rating === 0 && b.rating > 0) return 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        
        // Then by reviews
        return b.reviews - a.reviews;
      })
      .slice(0, 6);

    return NextResponse.json({
      products,
      originalQuery: query,
      priceRange: { min: minPrice, max: maxPrice },
      searchStrategy: products.length >= 4 ? "Amazon only" : "Amazon + Google Shopping",
      sources: {
        amazon: products.filter(p => p.source === "Amazon").length,
        google: products.filter(p => p.source === "Google Shopping").length,
        total: products.length
      }
    });
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { error: "Failed to search products", details: error.message },
      { status: 500 }
    );
  }
}

