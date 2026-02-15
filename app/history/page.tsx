import { getPastQuotes } from "@/lib/quotes";
import QuoteCard from "../components/QuoteCard";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
    const history = getPastQuotes(30); // Last 30 days

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-[#fdfbf7] p-6 pb-24">
            <h1 className="text-xl font-serif text-stone-600 mb-8 mt-4 tracking-widest">
                지난 명언
            </h1>
            <div className="w-full max-w-md">
                {history.map((item, index) => (
                    <QuoteCard key={index} quote={item.quote} date={item.date} />
                ))}
            </div>
        </main>
    );
}
