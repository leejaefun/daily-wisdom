"use client";

import { useState, useEffect } from "react";
import { getDailyQuote, Quote } from "@/lib/quotes";
import QuoteDisplay from "./components/QuoteDisplay";

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  // Prevent hydration mismatch by rendering nothing or a placeholder initially
  if (!quote) return <div className="min-h-screen bg-[#fdfbf7]" />;

  return <QuoteDisplay quote={quote} />;
}
