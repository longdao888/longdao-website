/* ============================================================
   site-data-loader.js - 动态加载 site-data.json 并更新页面内容
   ============================================================ */

const SITE_DATA_URL = 'site-data.json';
let siteData = null;

/* 加载 site-data.json */
async function loadSiteData() {
  try {
    const resp = await fetch(SITE_DATA_URL + '?t=' + Date.now());
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    siteData = await resp.json();
    console.log('[SiteData] 加载成功，版本：' + siteData.version);
    return siteData;
  } catch (e) {
    console.warn('[SiteData] 加载失败，使用默认值：', e.message);
    return null;
  }
}

/* 更新轮播图 */
function updateBanners(data) {
  const carousel = document.getElementById('heroCarousel');
  const indicators = document.getElementById('carouselIndicators');
  if (!carousel || !data || !data.banners || data.banners.length === 0) return;

  carousel.innerHTML = data.banners.map((b, i) => `
    <div class="carousel-item${i === 0 ? ' active' : ''}">
      <img class="carousel-img"
           src="${b.src}"
           alt="${b.alt || '轮播图' + (i+1)}"
           width="1920"
           height="749"
           ${i === 0 ? 'fetchpriority="high"' : ''}
           decoding="async">
      ${b.title ? `<div class="carousel-caption">
        <h2>${b.title}</h2>
        ${b.subtitle ? '<p>' + b.subtitle + '</p>' : ''}
      </div>` : ''}
    </div>
  `).join('');

  if (indicators) {
    indicators.innerHTML = data.banners.map((_, i) => 
      `<button class="carousel-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"></button>`
    ).join('');
  }

  // 重新初始化轮播
  if (window.initCarousel) window.initCarousel();
}

/* 更新首页内容 */
function updateHomepage(data) {
  if (!data || !data.homepage) return;
  const hp = data.homepage;

  // Hero 区域
  if (hp.hero) {
    const badge = document.querySelector('.hero-badge');
    const title = document.querySelector('.hero-title');
    const desc = document.querySelector('.hero-desc');
    const stats = document.querySelector('.hero-stats');

    if (badge && hp.hero.badge) badge.textContent = hp.hero.badge;
    if (title && hp.hero.title) title.innerHTML = hp.hero.title;
    if (desc && hp.hero.desc) desc.innerHTML = hp.hero.desc;

    if (stats && hp.hero.stats) {
      stats.innerHTML = hp.hero.stats.map((s, i) => `
        <div class="stat-item">
          <span class="stat-num">${s.num}</span>
          <span class="stat-label">${s.label}</span>
        </div>
        ${i < hp.hero.stats.length - 1 ? '<div class="stat-divider"></div>' : ''}
      `).join('');
    }
  }

  // 优势区域
  if (hp.advantages) {
    const advantagesGrid = document.querySelector('.advantages-grid');
    if (advantagesGrid) {
      const iconMap = { check: '✓', display: '🖥', plus: '⚡', home: '🏠' };
      advantagesGrid.innerHTML = hp.advantages.map(a => `
        <div class="advantage-card">
          <div class="advantage-icon">${iconMap[a.icon] || '★'}</div>
          <h3>${a.title}</h3>
          <p>${a.desc}</p>
        </div>
      `).join('');
    }
  }

  // 关于我们
  if (hp.about) {
    const aboutTitle = document.querySelector('.about-content h2');
    const aboutText1 = document.querySelector('.about-content p');
    if (aboutTitle && hp.about.title) aboutTitle.textContent = hp.about.title;
    if (aboutText1 && hp.about.text1) {
      aboutText1.textContent = hp.about.text1;
      // 添加第二段
      if (hp.about.text2) {
        let p2 = aboutText1.nextElementSibling;
        if (!p2 || p2.tagName !== 'P') {
          p2 = document.createElement('p');
          aboutText1.parentNode.insertBefore(p2, aboutText1.nextSibling);
        }
        p2.textContent = hp.about.text2;
      }
    }
  }

  // OEM/ODM
  if (hp.oem) {
    const oemTitle = document.querySelector('.oem-content h2');
    const oemDesc = document.querySelector('.oem-content > p');
    if (oemTitle && hp.oem.title) oemTitle.textContent = hp.oem.title;
    if (oemDesc && hp.oem.desc) oemDesc.textContent = hp.oem.desc;
  }
}

/* 更新产品列表 */
function updateProducts(data) {
  if (!data || !data.products) return;
  const productGrid = document.querySelector('.products-grid');
  if (!productGrid) return;

  productGrid.innerHTML = data.products.map(p => `
    <div class="product-card">
      <div class="product-img">
        <img src="${p.image || 'images/product-placeholder.png'}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-specs">
          ${(p.specs || []).slice(0, 2).map(s => `<span class="spec-tag">${s}</span>`).join('')}
        </div>
        <a href="${p.detailUrl || '#'}" class="btn btn-primary" style="margin-top:16px">查看详情 →</a>
      </div>
    </div>
  `).join('');
}

/* 初始化：页面加载时执行 */
async function initSiteData() {
  const data = await loadSiteData();
  if (!data) return;

  updateBanners(data);
  updateHomepage(data);
  updateProducts(data);
}

/* 自动初始化 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteData);
} else {
  initSiteData();
}
