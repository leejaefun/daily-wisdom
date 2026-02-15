import { getDailyQuote } from "@/lib/quotes";
import QuoteDisplay from "./components/QuoteDisplay";

// 서버 컴포넌트: 여기서 데이터를 가져옵니다.
export const dynamic = "force-dynamic";

export default function Home() {
  const quote = getDailyQuote();

  // 클라이언트 컴포넌트에 데이터(결과)만 넘겨줍니다. 
  // 전체 quotes 배열은 브라우저로 전송되지 않습니다.
  return <QuoteDisplay quote={quote} />;
}
