function initGameUI(){
  const C = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const V = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ']; // UI는 기본셋
  const $c = $('#consonant-area'), $v = $('#vowel-area');
  C.forEach(ch => $('<div/>').text(ch).makeDraggableCard({type:'c',char:ch}).appendTo($c));
  V.forEach(ch => $('<div/>').text(ch).makeDraggableCard({type:'v',char:ch}).appendTo($v));

  let picked = { c:null, v:null };
  window.onDropTo = function(dom, ch, type){
    if(type==='c'){ picked.c = ch; $(dom).text(ch); }
    else{ picked.v = ch; $(dom).text(ch); }
    tryCombine();
  };
  function tryCombine(){
    if(!picked.c || !picked.v) return;
    const syll = Combiner.combine(picked.c, picked.v);
    if(!syll) return;
    $('#result-display').text(syll).addClass('pop');
    setTimeout(()=>$('#result-display').removeClass('pop'),160);
    Sound.speak(syll);
    // 로그 저장
    Store.logTry({ts:Date.now(), c:picked.c, v:picked.v, ok:true, durMs:0});
    // 점수/레벨 등 추가 처리
    picked = {c:null,v:null};
    $('.drop').text('?');
  }

  // 음성 프리워밍(사용자 제스처 후)
  $('#btn-speak').one('click', ()=>Sound.warmup());
}
