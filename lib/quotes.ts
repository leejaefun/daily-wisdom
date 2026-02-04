export interface Quote {
    text: string;
    author: string;
}

export const quotes: Quote[] = [
    { text: "인생은 폭풍우가 지나가기를 기다리는 것이 아니라, 빗속에서 춤추는 법을 배우는 것이다.", author: "비비안 그린" },
    { text: "나를 죽이지 못하는 고통은 나를 더 강하게 만든다.", author: "프리드리히 니체" },
    { text: "너 자신의 무지를 절대 과소평가하지 마라.", author: "알베르트 아인슈타인" },
    { text: "가장 위대한 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데 있다.", author: "공자" },
    { text: "남을 아는 자는 지혜롭고, 자기를 아는 자는 명철하다.", author: "노자" },
    { text: "어디를 가든지 마음을 다해 가라.", author: "공자" },
    { text: "자신을 사랑하는 법을 아는 것이 가장 위대한 사랑이다.", author: "마이클 휘트니" },
    { text: "행복은 이미 만들어진 것이 아니다. 당신의 행동에서 비롯된다.", author: "달라이 라마" },
    { text: "어두움을 저주하는 것보다는 촛불 하나를 켜는 것이 낫다.", author: "공자" },
    { text: "우리가 하는 일은 바다에 붓는 물 한 방울에 불과하지만, 그 한 방울이 없다면 바다는 그만큼 줄어들 것이다.", author: "마더 테레사" },
    { text: "변화는 필연적이다. 성장은 선택이다.", author: "존 맥스웰" },
    { text: "상처받은 치유자만이 진정으로 치유할 수 있다.", author: "칼 융" },
    { text: "너의 시야는 너의 마음을 들여다볼 때만 맑아질 것이다. 밖을 보는 자는 꿈을 꾸고, 안을 보는 자는 깨어난다.", author: "칼 융" },
    { text: "인생은 자전거를 타는 것과 같다. 균형을 잡으려면 계속 움직여야 한다.", author: "알베르트 아인슈타인" },
    { text: "중요한 것은 멈추지 않고 질문하는 것이다.", author: "알베르트 아인슈타인" },
    { text: "내일의 꽃은 오늘의 씨앗 속에 있다.", author: "속담" },
    { text: "조용한 마음이 묻는다. 걱정해서 해결될 일인가? 아니라면 왜 걱정하는가.", author: "티베트 속담" },
    { text: "진정한 발견은 새로운 땅을 찾는 것이 아니라 새로운 눈을 갖는 것이다.", author: "마르셀 프루스트" },
    { text: "너무 소심하고 까다롭게 자신의 행동을 고민하지 말라. 인생은 실험이다.", author: "랄프 왈도 에머슨" },
    { text: "그대가 오랫동안 심연을 들여다보면 심연 또한 그대를 들여다본다.", author: "프리드리히 니체" },
];

export function getDailyQuote(): Quote {
    // 현재 날짜를 기준으로 인덱스 생성 (UTC 기준)
    // 클라이언트 사이드에서도 동일한 결과를 보여주기 위해 날짜 문자열 사용
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 간단한 해시 함수: 날짜 문자열의 각 문자의 코드값을 더함
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 음수 처리 및 배열 길이로 모듈러 연산
    const index = Math.abs(hash) % quotes.length;

    return quotes[index];
}
