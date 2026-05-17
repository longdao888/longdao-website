/* ===========================
   产品详情页 JS
   product-detail.js
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

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initMobileMenu();

  /* 注入卡片动画 CSS */
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeInCard { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`;
  document.head.appendChild(style);
});
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
