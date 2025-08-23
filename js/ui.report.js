// js/ui.report.js
// ------------------------------------------------------------
// HangulPlay - Report (부모 탭) 전용 스크립트
// jQuery 이후에 로드할 것. window.Store(listTries/getPref) 존재 가정
// ------------------------------------------------------------
(function (window, $) {
  'use strict';

  // 공개 API
  window.initReportUI = initReportUI;
  window.exportPDF = exportPDF;

  // UI에서 사용하는 기본 자/모음 목록 (CV 히트맵용)
  const C_LIST = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const V_LIST = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];

  // --------------------------
  // 1) 초기 바인딩
  // --------------------------
  function initReportUI() {
    // 부모 탭 눌렀을 때 UX: PIN 입력란 초기화
    $('#btn-parent').on('click', () => $('#parent-pin').val(''));

    // 부모 모드 잠금 해제
    $('#btn-parent-unlock').off('click').on('click', async () => {
      try {
        const inputPin = $('#parent-pin').val();
        const savedPin = (await (window.Store?.getPref?.('parent-pin'))) || '0000';
        if (inputPin !== savedPin) {
          alert('PIN이 올바르지 않습니다.');
          return;
        }
        $('#report-panel').prop('hidden', false);
        $('#parent-lock').hide();
        await renderReport();
      } catch (e) {
        console.error(e);
        alert('리포트를 여는 중 문제가 발생했습니다.');
      }
    });

    // PDF 내보내기
    $('#btn-export-pdf').off('click').on('click', exportPDF);
  }

  // --------------------------
  // 2) 리포트 렌더
  // --------------------------
  async function renderReport() {
    const tries = (await window.Store?.listTries?.()) || [];

    const stat = buildSnapshot(tries);
    // KPI
    $('#kpi-time').text(Math.round(stat.totalTimeMin));
    $('#kpi-rate').text(Math.round(stat.successRate * 100) + '%');
    $('#kpi-tries').text(stat.last7dTotal);

    // 히트맵
    drawHeatmap('chart-heatmap', stat.heatmap);

    // 약점 TOP5
    const $list = $('#weak-list').empty();
    if (!stat.topWeakCombos.length) {
      $list.html('<div>약점 항목이 아직 없어요. 🎉</div>');
    } else {
      stat.topWeakCombos.forEach((x) => {
        $list.append(
          `<div>${x.cv} — 실패율 ${Math.round(x.failRate * 100)}% (${x.tries}회)</div>`
        );
      });
    }
  }

  // --------------------------
  // 3) 스냅샷 집계
  // --------------------------
  function buildSnapshot(tries) {
    const byCV = Object.create(null);
    let okCnt = 0;

    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const since7d = now - sevenDays;
    let last7dTotal = 0;

    for (const t of tries) {
      const key = `${t.c || ''}${t.v || ''}`;
      byCV[key] ??= { tries: 0, ok: 0 };
      byCV[key].tries++;
      if (t.ok) okCnt++;
      if (t.ok) byCV[key].ok++;
      if ((t.ts || 0) >= since7d) last7dTotal++;
    }

    // 히트맵 데이터 구성
    const heatmap = {};
    C_LIST.forEach((c) => {
      heatmap[c] = {};
      V_LIST.forEach((v) => {
        heatmap[c][v] = byCV[`${c}${v}`] || { tries: 0, ok: 0 };
      });
    });

    // 약점 TOP5 (3회 이상 시도된 조합 중 실패율 높은 순)
    const topWeakCombos = Object.entries(byCV)
      .map(([cv, d]) => ({ cv, tries: d.tries, failRate: 1 - (d.ok / (d.tries || 1)) }))
      .filter((x) => x.tries >= 3)
      .sort((a, b) => (b.failRate - a.failRate) || (b.tries - a.tries))
      .slice(0, 5);

    // 간단 시간 추정: 시도당 3초 가정
    const totalTimeMin = (tries.length * 3) / 60;
    const successRate = tries.length ? okCnt / tries.length : 0;

    return { heatmap, topWeakCombos, totalTimeMin, successRate, last7dTotal };
  }

  // --------------------------
  // 4) 히트맵 캔버스 드로잉
  // --------------------------
  function drawHeatmap(canvasId, data) {
    const cvs = document.getElementById(canvasId);
    if (!cvs || !cvs.getContext) return;

    const ctx = cvs.getContext('2d');
    const C = C_LIST, V = V_LIST;

    const paddingLeft = 60, paddingTop = 40;
    const gapX = 4, gapY = 4;
    const cellW = Math.floor((cvs.width - (paddingLeft + 20)) / V.length);
    const cellH = Math.floor((cvs.height - (paddingTop + 20)) / C.length);

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 헤더
    V.forEach((v, i) => ctx.fillText(v, paddingLeft + i * cellW + cellW / 2, 20));
    C.forEach((c, i) => ctx.fillText(c, 30, paddingTop + i * cellH + cellH / 2));

    // 셀
    V.forEach((v, x) => {
      C.forEach((c, y) => {
        const d = (data[c] && data[c][v]) || { tries: 0, ok: 0 };
        const rate = d.tries ? (d.ok / d.tries) : 0;          // 성공률(0~1)
        const shade = Math.max(0, Math.min(255, Math.round(255 - rate * 155)));
        const rx = paddingLeft + x * cellW;
        const ry = paddingTop + y * cellH;

        ctx.fillStyle = `rgb(${shade},${shade},255)`;         // 성공률 높을수록 더 진한 파랑
        ctx.fillRect(rx, ry, cellW - gapX, cellH - gapY);

        ctx.fillStyle = '#222';
        ctx.fillText(d.tries ? Math.round(rate * 100) + '%' : '-', rx + (cellW - gapX) / 2, ry + (cellH - gapY) / 2);
      });
    });
  }

  // --------------------------
  // 5) PDF 내보내기 (프린트→PDF 저장)
  // --------------------------
  function exportPDF() {
    try {
      const time = document.getElementById('kpi-time')?.textContent || '0';
      const rate = document.getElementById('kpi-rate')?.textContent || '0%';
      const tries = document.getElementById('kpi-tries')?.textContent || '0';
      const heatCanvas = document.getElementById('chart-heatmap');
      const heatImg = heatCanvas ? heatCanvas.toDataURL('image/png') : null;

      const w = window.open('', 'print', 'width=900,height=700');
      const html = `
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <title>HangulPlay Report</title>
  <style>
    body{font-family:system-ui,"Noto Sans KR",sans-serif;margin:24px;color:#222}
    h1{margin:0 0 8px}
    .kpi{display:flex;gap:16px;margin:8px 0 16px}
    .kpi div{padding:8px 12px;border:1px solid #ddd;border-radius:10px}
    .sec{margin-top:18px}
    img{max-width:100%;height:auto;border:1px solid #eee;border-radius:10px}
    .weak{margin-top:10px}
  </style>
</head>
<body>
  <h1>HangulPlay 요약 리포트</h1>
  <div class="kpi">
    <div>총 학습시간 <b>${time}</b>분</div>
    <div>성공률 <b>${rate}</b></div>
    <div>최근7일 시도 <b>${tries}</b></div>
  </div>
  <div class="sec">
    <h2>조합 히트맵</h2>
    ${heatImg ? `<img src="${heatImg}" alt="Heatmap"/>` : '<p>(히트맵 없음)</p>'}
  </div>
  <div class="sec">
    <p>생성일: ${new Date().toLocaleString()}</p>
  </div>
  <script>window.onload = function(){ window.print(); window.close(); };</script>
</body>
</html>`;
      w.document.open(); w.document.write(html); w.document.close();
    } catch (e) {
      console.error(e);
      alert('PDF 내보내기 중 오류가 발생했습니다: ' + (e && e.message ? e.message : e));
    }
  }
})(window, jQuery);
