/* ============================================================
   product-detail-loader.js - 产品详情页动态加载（非破坏式）
   仅同步文本字段（标题 / 面包屑 / 标签 / 系列 / 摘要），
   不覆盖已含 SVG 的 highlights / specs / scenes，以保护页面视觉设计。
   ============================================================ */

const PDETAIL_DATA_URL = 'site-data.json';
let pdDetailData = null;

/* 获取当前产品类型 */
function getProductType() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('type')) return params.get('type');

  const path = window.location.pathname;
  if (path.includes('mini')) return 'mini';
  if (path.includes('display')) return 'display';
  if (path.includes('desktop')) return 'desktop';
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
    console.warn('[ProductDetail] 数据加载失败，使用页面默认内容：', e.message);
    return null;
  }
}

/* 非破坏式同步：仅更新文本节点，不重渲染含 SVG 的区块 */
function updateProductDetail(data, type) {
  if (!data || !data.productDetails || !data.productDetails[type]) return;
  const pd = data.productDetails[type];

  // 页面标题
  const titleEl = document.querySelector('title');
  if (titleEl && pd.title) {
    titleEl.textContent = pd.title + ' - 广州龙到网络科技有限公司';
  }

  // 面包屑
  const bcCur = document.querySelector('.bc-cur');
  if (bcCur && pd.title) bcCur.textContent = pd.title;

  // 产品头部文本（不触碰含 SVG 的 highlights 区块）
  const tagEl = document.querySelector('.product-tag');
  const seriesEl = document.querySelector('.pd-series');
  const titleH1 = document.querySelector('.pd-title');
  const summaryEl = document.querySelector('.pd-summary');

  if (tagEl && pd.tag) tagEl.textContent = pd.tag;
  if (seriesEl && pd.series) seriesEl.textContent = pd.series;
  if (titleH1 && pd.title) titleH1.textContent = pd.title;
  if (summaryEl && pd.summary) summaryEl.textContent = pd.summary;
}

/* 初始化 */
async function initProductDetail() {
  const type = getProductType();
  const data = await loadProductDetailData();
  if (data) {
    updateProductDetail(data, type);
    console.log('[ProductDetail] 已同步 ' + type + ' 的文本数据');
  }
}

/* 自动初始化 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductDetail);
} else {
  initProductDetail();
}
