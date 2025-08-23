function createSound(){
  let ready=false;
  function warmup(){
    // 사용자 제스처 이후 1회 실행 권장
    const u = new SpeechSynthesisUtterance(' ');
    u.lang='ko-KR'; u.volume=0; speechSynthesis.speak(u);
    ready=true;
  }
  function speak(text){
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang='ko-KR'; u.rate=0.85; u.pitch=1.0;
      speechSynthesis.speak(u);
    } catch(e){}
  }
  return { warmup, speak };
}
