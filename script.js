/* ===========================
   JavaScript - 龙到官网交互功能
   =========================== */

/* ---------- 全局状态 ---------- */
let currentSlide = 0;
let slideInterval = null;
const SLIDE_DURATION = 5000;
let menuOpen = false;

/* ========== 首页轮播 ========== */
function initCarousel() {
  const img = document.querySelector('.carousel-img');
  const carousel = document.getElementById('heroCarousel');

  if (img && carousel) {
    const setAspectRatio = () => {
      if (!img.naturalWidth) return;
      const ratio = img.naturalHeight / img.naturalWidth;
      carousel.style.paddingBottom = (ratio * 100) + '%';
      carousel.style.height = '0';
    };
    if (img.complete && img.naturalWidth > 0) {
      setAspectRatio();
    } else {
      img.addEventListener('load', setAspectRatio);
    }
  }

  startAutoPlay();

  const carouselEl = document.getElementById('heroCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('mouseenter', stopAutoPlay);
    carouselEl.addEventListener('mouseleave', startAutoPlay);
  }

  /* 触摸滑动 */
  let touchStartX = 0, touchEndX = 0;
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
    }, { passive: true });
  }
}

function goToSlide(index) {
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.carousel-dot');
  const total = items.length;
  if (total === 0) return;
  items[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + total) % total;
  items[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoPlay() {
  if (slideInterval) return;
  slideInterval = setInterval(nextSlide, SLIDE_DURATION);
}

function stopAutoPlay() {
  if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
}

/* ========== 平滑滚动（全局，供 HTML 调用）========== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerHeight = document.getElementById('header').offsetHeight;
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: 'smooth' });
  closeMenu();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========== 移动端菜单 ========== */
let navOriginalParent = null;   /* 记录 nav-menu 的原始父容器 */
let navOriginalNextSibling = null; /* 记录原始位置，用于放回 */

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  menuOpen = !menuOpen;
  menu.classList.toggle('open', menuOpen);
  overlay.classList.toggle('show', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';

  /* 移动端：打开时把菜单移到 body 末尾，脱离 header 的层叠上下文 */
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

  /* 把菜单放回 header 内原处，恢复桌面端 flex 布局 */
  if (navOriginalParent && menu.parentNode !== navOriginalParent) {
    navOriginalParent.insertBefore(menu, navOriginalNextSibling);
    navOriginalParent = null;
    navOriginalNextSibling = null;
  }
}

function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  /* 汉堡按钮 */
  if (navToggle) {
    navToggle.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); });
    navToggle.addEventListener('touchend', (e) => { e.preventDefault(); toggleMenu(); }, { passive: false });
  }

  /* 遮罩层点击关闭 */
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
    navOverlay.addEventListener('touchend', (e) => { e.preventDefault(); closeMenu(); }, { passive: false });
  }

  /* 导航链接点击 */
  navLinks.forEach(link => {
    const handler = (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) scrollToSection(section);
    };
    link.addEventListener('click', handler);
    link.addEventListener('touchend', (e) => { e.preventDefault(); handler(e); }, { passive: false });
  });

  /* 窗口 resize：从移动端切换到桌面端时，确保菜单回到 header 内 */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navOriginalParent) {
      closeMenu();
    }
  });
}

/* ========== 产品筛选 ========== */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      if (!category) return;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      filterProducts(category);
    });
  });
}

function filterProducts(category) {
  document.querySelectorAll('.product-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
      card.style.animation = 'fadeInCard 0.4s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ========== 表单提交 ========== */
function submitForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  btn.textContent = '提交中...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '提交留言';
    btn.disabled = false;
    e.target.reset();
    document.getElementById('successModal').classList.add('show');
  }, 1000);
}

function closeModal() {
  document.getElementById('successModal').classList.remove('show');
}

/* ========== 导航滚动效果 ========== */
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
const sectionIds = ['home', 'about', 'products', 'contact'];
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  /* Header 样式 */
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  /* 返回顶部按钮 */
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
  updateActiveNav();
  animateOnScroll();
});

function updateActiveNav() {
  const scrollPos = window.scrollY + header.offsetHeight + 40;
  let current = 'home';
  sectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= scrollPos) current = id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === current) link.classList.add('active');
  });
}

/* ========== 入场动画 ========== */
function animateOnScroll() {
  document.querySelectorAll('.fade-in-up:not(.visible)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

function initAnimations() {
  const targets = document.querySelectorAll(
    '.adv-item, .product-card, .about-grid, .contact-grid, .oem-section, .section-header'
  );
  targets.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });
  animateOnScroll();
}

/* ========== 数字动画 ========== */
function animateNumbers() {
  document.querySelectorAll('.stat-num').forEach(stat => {
    const match = stat.textContent.match(/(\d+)(\+?.*)/);
    if (!match) return;
    const target = parseInt(match[1]);
    const suffix = match[2] || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      stat.textContent = Math.floor(current) + suffix;
      if (current >= target) { stat.textContent = target + suffix; clearInterval(timer); }
    }, 20);
  });
}

/* ========== 初始化 ========== */
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initCarousel();
  initMobileMenu();
  initTabs();

  /* Hero 出场动画 */
  setTimeout(() => {
    document.querySelector('.hero-badge')?.classList.add('visible');
  }, 100);

  /* 数字动画（进入视口触发）*/
  let numbersAnimated = false;
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !numbersAnimated) {
        numbersAnimated = true;
        animateNumbers();
      }
    });
    observer.observe(heroStats);
  }

  /* 注入卡片动画 CSS */
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeInCard { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`;
  document.head.appendChild(style);

  /* 键盘 ESC 关闭弹窗 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* hero 内容区按钮（data-section）*/
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const section = el.getAttribute('data-section');
      if (section) scrollToSection(section);
    });
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      const section = el.getAttribute('data-section');
      if (section) scrollToSection(section);
    }, { passive: false });
  });

  /* 表单提交绑定 */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', submitForm);
  }

  /* 点击遮罩关闭弹窗 */
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeModal();
    });
  }
});
