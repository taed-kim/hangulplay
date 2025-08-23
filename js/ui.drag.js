// js/ui.drag.js
(function($){
  $.fn.makeDraggableCard = function(options){
    const opt = Object.assign({type:'c', char:'ㄱ'}, options);
    return this.each(function(){
      const $el = $(this).addClass('card').attr({'data-type':opt.type,'data-char':opt.char});
      this.style.touchAction = 'none';
      let drag = null;

      $el.on('pointerdown', (e)=>{
        this.setPointerCapture(e.pointerId);
        const r = this.getBoundingClientRect();
        drag = {dx:e.clientX - r.left, dy:e.clientY - r.top};
        $(this).css('transition','none');
      });
      $el.on('pointermove', (e)=>{
        if(!drag) return;
        const x = e.clientX - drag.dx, y = e.clientY - drag.dy;
        $(this).css('transform',`translate3d(${x}px,${y}px,0)`);
        highlightDrop(e.clientX,e.clientY, opt.type);
      });
      $el.on('pointerup pointercancel', (e)=>{
        if(!drag) return;
        const hit = getHitDrop(e.clientX,e.clientY, opt.type);
        drag = null;
        if(hit){ onDropTo(hit, opt.char, opt.type); }
        $(this).css({transform:'', transition:'transform .18s ease'});
        $('.drop').removeClass('is-hover');
      });
    });
  };
})(jQuery);

// 헬퍼(간단한 히트테스트)
function getHitDrop(x,y,type){
  let target=null;
  $('.drop').each(function(){
    const ok = $(this).data('accept')===type;
    if(!ok) return;
    const r=this.getBoundingClientRect();
    if(x>=r.left && x<=r.right && y>=r.top && y<=r.bottom){ target=this; }
  });
  return target;
}
function highlightDrop(x,y,type){
  $('.drop').removeClass('is-hover');
  const t = getHitDrop(x,y,type); if(t) $(t).addClass('is-hover');
}
