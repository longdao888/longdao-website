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
