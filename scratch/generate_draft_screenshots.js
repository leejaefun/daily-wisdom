const puppeteer = require('puppeteer');
const fs = require('fs');

const createHTML = (optionType) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap');
    body { font-family: 'Nanum Myeongjo', serif; background-color: #f7f5f0; }
  </style>
</head>
<body class="w-[375px] h-[812px] relative overflow-hidden bg-[#f7f5f0] text-stone-800 flex flex-col justify-between p-0 m-0">

  <!-- TOP HEADER (Only for Option C or logo for A/B) -->
  ${optionType === 'C' ? `
  <header class="pt-12 px-6 flex items-center justify-between z-10">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-md bg-stone-300/40 flex items-center justify-center text-xs font-serif">O</div>
      <span class="text-xs text-stone-500 tracking-widest font-serif uppercase">Daily Wisdom</span>
    </div>
    <div class="flex items-center gap-4 text-stone-400">
      <!-- History Icon -->
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <!-- Favorites Icon -->
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <!-- Settings Icon -->
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    </div>
  </header>
  ` : `
  <header class="pt-14 flex flex-col items-center gap-1.5 z-10">
    <div class="w-8 h-8 rounded-lg bg-stone-200/80 flex items-center justify-center text-sm font-serif">O</div>
    <span class="text-[10px] text-stone-400 tracking-[0.2em] uppercase font-serif">Daily Wisdom</span>
  </header>
  `}

  <!-- CENTER QUOTE CARD -->
  <main class="flex-1 flex flex-col items-center justify-center px-6 text-center z-10">
    <div class="w-full max-w-sm bg-[#fdfbf7] p-7 rounded-2xl shadow-sm border border-stone-200/40">
      <p class="text-stone-700 text-lg leading-relaxed whitespace-pre-line font-serif">
        단순하게 살아라. 현대인은 쓸데없는 절차와 일 때문에 얼마나 복잡한 삶을 살아가는가?
      </p>
      <p class="text-xs text-stone-500 tracking-widest mt-5">
        — 이드리스 샤흐
      </p>
      <div class="mt-8 flex flex-col items-center gap-4">
        <p class="text-stone-400 text-xs font-light tracking-wider">
          이 문장은 오늘 당신에게 어떤 말을 건네고 있나요?
        </p>
        <div class="flex items-center gap-3 text-stone-400">
          <div class="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-xs">♡</div>
          <div class="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-xs">➦</div>
        </div>
      </div>
    </div>
  </main>

  <!-- BOTTOM NAVIGATION DRAFTS -->
  ${optionType === 'A' ? `
  <!-- OPTION A: Floating Pill Bar -->
  <footer class="pb-8 px-6 flex justify-center z-20">
    <div class="bg-[#fdfbf7]/90 backdrop-blur-md border border-stone-300/60 shadow-lg px-6 py-2.5 rounded-full flex items-center gap-6 text-xs text-stone-400">
      <span class="text-stone-800 font-semibold border-b border-stone-800 pb-0.5">오늘의 명언</span>
      <span>지난 명언</span>
      <span>보관함</span>
      <span>설정</span>
    </div>
  </footer>
  ` : ''}

  ${optionType === 'B' ? `
  <!-- OPTION B: iOS Compact Icon + Label Tab Bar -->
  <footer class="bg-[#fdfbf7]/95 border-t border-stone-200/60 pb-7 pt-2 px-4 flex items-center justify-around z-20">
    <div class="flex flex-col items-center text-stone-800 gap-0.5">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      <span class="text-[10px] tracking-wider uppercase font-semibold">오늘</span>
    </div>
    <div class="flex flex-col items-center text-stone-400 gap-0.5">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span class="text-[10px] tracking-wider uppercase">지난 명언</span>
    </div>
    <div class="flex flex-col items-center text-stone-400 gap-0.5">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
      <span class="text-[10px] tracking-wider uppercase">보관함</span>
    </div>
    <div class="flex flex-col items-center text-stone-400 gap-0.5">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
      <span class="text-[10px] tracking-wider uppercase">설정</span>
    </div>
  </footer>
  ` : ''}

  ${optionType === 'C' ? `
  <!-- OPTION C: Pure Empty Bottom -->
  <footer class="pb-8 text-center z-20">
    <!-- Clean pure space, no bottom navbar -->
  </footer>
  ` : ''}

  <!-- Home Indicator bar emulation -->
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-800/40 rounded-full z-30 pointer-events-none"></div>
</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const opt of ['A', 'B', 'C']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await page.setContent(createHTML(opt), { waitUntil: 'networkidle0' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
    const path = `/Users/robin/.gemini/antigravity/brain/ed3e3e05-78e4-4a3d-a976-95ab3a3b8f2a/draft_option_${opt}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`Saved Option ${opt} to ${path}`);
  }

  await browser.close();
})();
