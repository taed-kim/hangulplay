// js/app.bootstrap.js
$(async function(){
  // 탭 전환
  $('.tab-btn').on('click', function(){
    $('.tab-btn').removeClass('is-active'); $(this).addClass('is-active');
    const tab = $(this).data('tab');
    $('.view').removeClass('is-active'); $(`#view-${tab}`).addClass('is-active');
  });

  // 핵심 모듈 준비
  window.Store = await createStore();       // IndexedDB
  window.Combiner = createHangulCombiner(); // 한글 조합
  window.Sound = createSound();             // TTS

  initGameUI();   // 카드/드롭존 렌더, 드래그 장착
  initReportUI(); // 부모 잠금, 차트 준비

  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('/sw.js'); } catch(e){}
  }

  // js/app.bootstrap.js 맨 끝
    if (location.hostname === 'localhost' || location.search.includes('devtest')) {
    (function testCombiner(){
        const c = createHangulCombiner();
        console.assert(c.combine('ㄱ','ㅏ')==='가','ㄱ+ㅏ=가 실패');
        console.assert(c.combine('ㄴ','ㅣ')==='니','ㄴ+ㅣ=니 실패');
        console.log('combiner OK');
    })();
    }

});
