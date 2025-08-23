function createHangulCombiner(){
  // 표준 인덱스(초성 19, 중성 21) — CV 단계라 종성(T)=0 고정
  const LMAP = {'ㄱ':0,'ㄲ':1,'ㄴ':2,'ㄷ':3,'ㄸ':4,'ㄹ':5,'ㅁ':6,'ㅂ':7,'ㅃ':8,'ㅅ':9,'ㅆ':10,'ㅇ':11,'ㅈ':12,'ㅉ':13,'ㅊ':14,'ㅋ':15,'ㅌ':16,'ㅍ':17,'ㅎ':18};
  const VMAP = {'ㅏ':0,'ㅐ':1,'ㅑ':2,'ㅒ':3,'ㅓ':4,'ㅔ':5,'ㅕ':6,'ㅖ':7,'ㅗ':8,'ㅘ':9,'ㅙ':10,'ㅚ':11,'ㅛ':12,'ㅜ':13,'ㅝ':14,'ㅞ':15,'ㅟ':16,'ㅠ':17,'ㅡ':18,'ㅢ':19,'ㅣ':20};
  const base = 0xAC00, VCOUNT=21, TCOUNT=28, NCOUNT=VCOUNT*TCOUNT;

  function combine(c,v){
    const L = LMAP[c], V = VMAP[v];
    if(L==null || V==null) return null;
    const code = base + (L*NCOUNT) + (V*TCOUNT); // T=0
    return String.fromCharCode(code);
  }
  return { combine };
}