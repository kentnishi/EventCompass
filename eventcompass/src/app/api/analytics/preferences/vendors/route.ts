import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabase";

export const dynamic = "force-dynamic";

// Add/extend as you see them in your data
const VENDOR_SYNONYMS: Record<string, string> = {
  "mochinut": "Mochinut",
  "mochi nut": "Mochinut",
  "sittoo": "Sittoo's",
  "sittoos": "Sittoo's",
  "sittoo's": "Sittoo's",
  "sittoo’s": "Sittoo's",
  "chipotle": "Chipotle",
  "raising cane": "Raising Cane’s",
  "raising canes": "Raising Cane’s",
  "cane's": "Raising Cane’s",
  "canes": "Raising Cane’s",
  "starbucks": "Starbucks",
  "dunkin": "Dunkin",
  "boba": "Boba Shop",
  "kung fu tea": "Kung Fu Tea",
  "kft": "Kung Fu Tea",
  "five guys": "Five Guys",
  "jimmy john": "Jimmy John’s",
  "jimmy johns": "Jimmy John’s",
  "panera": "Panera",
  "chick fil a": "Chick-fil-A",
  "chickfila": "Chick-fil-A",
  "chick-fil-a": "Chick-fil-A",
  "Canes": "Raising Cane’s",
  "mcdonalds": "McDonald’s",
  "mcdonald's": "McDonald’s",
  "panda express": "Panda Express",
  "shake shack": "Shake Shack",
  "giant eagle market district": "Market District",
  "jamaica jerk centa": "Jamaica Jerk Center",
  "jamaica jerk center": "Jamaica Jerk Center",
  "miega": "Miega",
  "yumvillage": "YumVillage",
  "yum village": "YumVillage",
  "proper pig smokehouse": "Proper Pig Smokehouse",
  "the proper pig": "Proper Pig Smokehouse",
  "ty fun thai bistro": "Ty Fun Thai Bistro",
  "ty fun": "Ty Fun Thai Bistro",
  "irie jamaican kitchen": "Irie Jamaican Kitchen",
  "ice and rice cafe": "Ice and Rice Cafe",     // this appears distinct from "Ice or Rice Cafe"
  "ice or rice cafe": "Ice or Rice Cafe",
  "te amo": "Te Amo",
  "teamo": "Te Amo",
  "te amo cafe": "Te Amo",
  "sandra adukes kitchen": "Sandra Aduke's Kitchen",
  "sandra aduke s kitchen": "Sandra Aduke's Kitchen",
  "zoma ethiopian restaurant": "Zoma Ethiopian Restaurant",
  "zoma": "Zoma Ethiopian Restaurant",
  "king tut egyptian restaurant": "King Tut Egyptian Restaurant",
  "king tut": "King Tut Egyptian Restaurant",
  "sabor miami cafe and gallery": "Sabor Miami Cafe and Gallery",
  "sabor miami": "Sabor Miami Cafe and Gallery",
  "boaz": "Boaz",
  "la plaza taqueria": "La Plaza Taqueria",
  "la plaza": "La Plaza Taqueria",        // if you want taqueria to be canonical
  "lunas": "Luna's",
  "luna s": "Luna's",
  "luna bakery": "Luna's",
  "luna bakery cafe": "Luna's",
  "falafel cafe": "Falafel Cafe",
  "la plaza supermarket": "La Plaza Supermarket",
  "superior pho": "Superior Pho",
  "ohio city burrito": "Ohio City Burrito",
  "urban kitchen": "Urban Kitchen",
  "bombay chaat": "Bombay Chaat",
  "crepes and crisps": "Crepes and Crisps",
  "brueggers": "Bruegger's",
  "bruegger s": "Bruegger's",
  "anatolia cafe": "Anatolia Cafe",
  "rumis": "Rumi's",
  "rumi s": "Rumi's",
  "coffee house": "Coffee House",
  "masons creamery": "Mason's Creamery",
  "mason s creamery": "Mason's Creamery",
  "stone oven bakery": "Stone Oven Bakery",
  "beyond": "Beyond",
  "the fruit stand": "The Fruit Stand",
  "fruit stand": "The Fruit Stand",
  "mr jamaican kitchen": "Mr Jamaican Kitchen",
  "taza lebanese grill": "Taza Lebanese Grill",
  "taza": "Taza Lebanese Grill",
  "one pot": "One Pot",
  "ferris shawarma": "Ferris Shawarma",
  "callaloo cafe": "Callaloo Cafe",
  "honest kitchen": "Honest Kitchen",
  "caribe bake shop": "Caribe Bake Shop",
  "thai thai": "Thai Thai",
  "corbos": "Corbo's",
  "corbo s": "Corbo's",
  "saffron patch": "Saffron Patch",
  "dos amigos locos": "Dos Amigos Locos",
  "alpha ramen": "Alpha Ramen",
  "momos kebab": "Momo's Kebab",
  "momo s kebab": "Momo's Kebab",
  "grumpys cafe": "Grumpy's Cafe",
  "grumpy s cafe": "Grumpy's Cafe",
  "hofbrauhaus": "Hofbrauhaus",
  "hofbrauhaus cleveland": "Hofbrauhaus",
  "jack frost donuts": "Jack Frost Donuts",
  "jack frost": "Jack Frost Donuts"
};

export async function GET() {
  try {
    // 1) latest survey
    const s = await supabase
      .from("survey")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (s.error || !s.data) return NextResponse.json([], { status: 200 });
    const surveyId = s.data.id;

    // 2) find the vendor free-text question by label
    const q = await supabase
      .from("survey_question")
      .select("id,text")
      .eq("survey_id", surveyId)
      .ilike(
        "text",
        "%Which Cleveland restaurants, cafés, or food spots would you love to see UPB bring to campus%"
      )
      .limit(1)
      .maybeSingle();

    if (q.error) throw q.error;
    if (!q.data)
      return NextResponse.json(
        { error: "Vendor free-text question not found in the latest survey." },
        { status: 200 }
      );

    // 3) pull answers (free-text)
    const a = await supabase
      .from("survey_answer")
      .select("response_id,value_text")
      .eq("question_id", q.data.id);

    if (a.error) throw a.error;

    const counts = new Map<string, number>();
    const seen = new Set<string>(); // dedupe per (response, vendor)

    for (const row of a.data ?? []) {
      const raw = (row.value_text || "").trim();
      if (!raw) continue;

      // Split on common delimiters so users can list multiple vendors
      const tokens = raw
        .split(/[,\n;/|]+/g)
        .map((s: string) => s.trim())
        .filter(Boolean);

      for (let t of tokens) {
        const label = normalizeVendor(t);
        if (!label) continue;
        const key = `${row.response_id}:${label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }

    // return Top N (default 25) sorted by frequency
    const out = Array.from(counts, ([label, cnt]) => ({ label, cnt }))
      .sort((a, b) => b.cnt - a.cnt)
      .slice(0, 25);

    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}

/** Normalize noisy free-text vendor names into clean labels. */
function normalizeVendor(input: string): string {
  let s = input
    .toLowerCase()
    .replace(/[“”"']/g, "")          // quotes
    .replace(/&/g, "and")            // & → and
    .replace(/\s+/g, " ")            // collapse spaces
    .trim();

  // strip emojis & most punctuation (keep letters, numbers, spaces)
  s = s.replace(/[^\p{L}\p{N}\s.-]/gu, "").trim();

  // if it matches a synonym key → map to canonical
  if (VENDOR_SYNONYMS[s]) return VENDOR_SYNONYMS[s];

  // try fuzzy-ish direct title-casing for names that aren't in the map
  // (e.g., “SITOOS”, “Sittoo’s” → “Sittoo S” becomes “Sittoo S”, you can extend above map)
  return titleCase(s);
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
