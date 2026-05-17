/* ============================================================
   product-detail-loader.js - 产品详情页动态加载
   ============================================================ */

const PDETAIL_DATA_URL = 'site-data.json';
let pdDetailData = null;

/* 获取当前产品类型 */
function getProductType() {
  // 从 URL 参数获取，如 ?type=aio
  const params = new URLSearchParams(window.location.search);
  if (params.has('type')) return params.get('type');

  // 从文件名推断
  const path = window.location.pathname;
  if (path.includes('aio')) return 'aio';
  if (path.includes('mini')) return 'mini';
  if (path.includes('display')) return 'display';
  if (path.includes('desktop') || path.includes('desktop')) return 'desktop';

  // 默认
  return 'aio';
}

/* 加载 site-data.json */
async function loadProductDetailData() {
  try {
    const resp = await fetch(PDETAIL_DATA_URL + '?t=' + Date.now());
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    pdDetailData = await resp.json();
    return pdDetailData;
  } catch (e) {
    console.warn('[ProductDetail] 加载失败，使用默认值：', e.message);
    return null;
  }
}

/* 更新产品详情页 */
function updateProductDetail(data, type) {
  if (!data || !data.productDetails || !data.productDetails[type]) return;
  const pd = data.productDetails[type];

  // 更新标题
  const titleEl = document.querySelector('title');
  if (titleEl && pd.title) {
    titleEl.textContent = pd.title + ' - 广州龙到网络科技有限公司';
  }

  // 更新面包屑
  const bcCur = document.querySelector('.bc-cur');
  if (bcCur && pd.title) bcCur.textContent = pd.title;

  // 更新产品头部信息
  const tagEl = document.querySelector('.product-tag');
  const seriesEl = document.querySelector('.pd-series');
  const titleH1 = document.querySelector('.pd-title');
  const summaryEl = document.querySelector('.pd-summary');

  if (tagEl && pd.tag) tagEl.textContent = pd.tag;
  if (seriesEl && pd.series) seriesEl.textContent = pd.series;
  if (titleH1 && pd.title) titleH1.textContent = pd.title;
  if (summaryEl && pd.summary) summaryEl.textContent = pd.summary;

  // 更新高亮信息
  if (pd.highlights) {
    const hlContainer = document.querySelector('.pd-highlights');
    if (hlContainer) {
      hlContainer.innerHTML = pd.highlights.map(h => `
        <div class="pd-hl">
          <span class="hl-icon">${h.icon}</span>
          <div><strong>${h.title}</strong><span>${h.subtitle}</span></div>
        </div>
      `).join('');
    }
  }

  // 更新规格参数表
  if (pd.specs) {
    const specTable = document.querySelector('.spec-table');
    if (specTable) {
      const thead = specTable.querySelector('thead tr');
      const tbody = specTable.querySelector('tbody');
      if (thead && pd.specs.headers) {
        thead.innerHTML = pd.specs.headers.map(h => `<th>${h}</th>`).join('');
      }
      if (tbody && pd.specs.rows) {
        tbody.innerHTML = pd.specs.rows.map(row => 
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
      }
    }
  }

  // 更新应用场景
  if (pd.scenes) {
    const sceneGrid = document.querySelector('.scene-grid');
    if (sceneGrid) {
      sceneGrid.innerHTML = pd.scenes.map(s => `
        <div class="scene-card">
          <div class="scene-icon">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
      `).join('');
    }
  }

  // 更新 OEM 信息
  if (pd.oem && pd.oem.items) {
    const oemList = document.querySelector('.oem-list');
    if (oemList) {
      oemList.innerHTML = pd.oem.items.map(item => 
        `<li>${item}</li>`
      ).join('');
    }
  }
}

/* 初始化 */
async function initProductDetail() {
  const type = getProductType();
  const data = await loadProductDetailData();
  if (data) {
    updateProductDetail(data, type);
    console.log('[ProductDetail] 已加载 ' + type + ' 的详情数据');
  }
}

/* 自动初始化 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetail);
} else {
  initProductDetail();
}
