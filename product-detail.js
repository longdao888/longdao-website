/* ===========================
   产品详情页 JS
   product-detail.js
   交互逻辑 + 非破坏式数据同步
   =========================== */

/* ---------- Header 滚动效果 ---------- */
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
  animateOnScroll();
});

/* ---------- 入场动画 ---------- */
function animateOnScroll() {
  document.querySelectorAll('.fade-in-up:not(.visible)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

function initAnimations() {
  const targets = document.querySelectorAll(
    '.pd-hero, .pd-section, .scene-card, .related-card, .oem-step-item, .spec-table-wrap'
  );
  targets.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
  });
  animateOnScroll();
}

/* ---------- 移动端菜单 ---------- */
let menuOpen = false;
let navOriginalParent = null;
let navOriginalNextSibling = null;

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  menuOpen = !menuOpen;
  menu.classList.toggle('open', menuOpen);
  overlay.classList.toggle('show', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  if (menuOpen && window.innerWidth <= 768) {
    if (!navOriginalParent) {
      navOriginalParent = menu.parentNode;
      navOriginalNextSibling = menu.nextSibling;
    }
    document.body.appendChild(menu);
  }
}

function closeMenu() {
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  menuOpen = false;
  menu.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  if (navOriginalParent && menu.parentNode !== navOriginalParent) {
    navOriginalParent.insertBefore(menu, navOriginalNextSibling);
    navOriginalParent = null;
    navOriginalNextSibling = null;
  }
}

function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');

  if (navToggle) {
    navToggle.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); });
    navToggle.addEventListener('touchend', (e) => { e.preventDefault(); toggleMenu(); }, { passive: false });
  }
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
    navOverlay.addEventListener('touchend', (e) => { e.preventDefault(); closeMenu(); }, { passive: false });
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navOriginalParent) closeMenu();
  });
}

/* ============================================================
   非破坏式数据同步
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
function syncProductDetail(data, type) {
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

async function initProductDetail() {
  const type = getProductType();
  const data = await loadProductDetailData();
  if (data) {
    syncProductDetail(data, type);
    console.log('[ProductDetail] 已同步 ' + type + ' 的文本数据');
  }
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initMobileMenu();
  initProductDetail();

  /* 注入卡片动画 CSS */
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeInCard { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`;
  document.head.appendChild(style);
});
