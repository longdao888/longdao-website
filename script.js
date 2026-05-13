/* ===========================
   JavaScript - 交互功能
   =========================== */

// ========== 首页轮播 ==========
let currentSlide = 0;
let slideInterval = null;
const SLIDE_DURATION = 5000; // 5秒切换

function initCarousel() {
  const img = document.querySelector('.carousel-img');
  const carousel = document.getElementById('heroCarousel');

  if (img && carousel) {
    const setAspectRatio = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      carousel.style.paddingBottom = (ratio * 100) + '%';
      carousel.style.height = '0';
    };

    if (img.complete) {
      setAspectRatio();
    } else {
      img.addEventListener('load', setAspectRatio);
    }
  }

  // 启动自动播放
  startAutoPlay();

  // 鼠标悬停暂停
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
  }

  // 触摸滑动支持
  let touchStartX = 0;
  let touchEndX = 0;

  if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

function goToSlide(index) {
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.carousel-dot');
  const total = items.length;
  
  if (total === 0) return;
  
  // 移除当前激活状态
  items[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  
  // 设置新的当前幻灯片
  currentSlide = (index + total) % total;
  
  // 激活新幻灯片
  items[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function startAutoPlay() {
  if (slideInterval) return;
  slideInterval = setInterval(nextSlide, SLIDE_DURATION);
}

function stopAutoPlay() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

// ========== 移动端菜单 ==========
function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    navOverlay.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function handleNavClick(e) {
    e.preventDefault();
    const section = e.currentTarget.getAttribute('data-section');
    if (!section) return;
    const el = document.getElementById(section);
    if (!el) return;
    const headerHeight = document.getElementById('header').offsetHeight;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
    closeMenu();
  }

  if (navToggle) {
    navToggle.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); });
    navToggle.addEventListener('touchend', (e) => { e.preventDefault(); toggleMenu(); }, { passive: false });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
    navOverlay.addEventListener('touchend', (e) => { e.preventDefault(); closeMenu(); }, { passive: false });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
    link.addEventListener('touchend', handleNavClick, { passive: false });
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 导航滚动效果 ==========
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
const sections = ['home', 'about', 'products', 'contact'];
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  // Header 样式
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // 返回顶部按钮
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // 导航活动状态
  updateActiveNav();

  // 滚动动画
  animateOnScroll();
});

function updateActiveNav() {
  const scrollPos = window.scrollY + header.offsetHeight + 40;
  let current = 'home';

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.offsetTop <= scrollPos) {
      current = id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === current) {
      link.classList.add('active');
    }
  });
}

// ========== 移动端菜单 ==========
function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  const isOpen = menu.classList.toggle('open');
  overlay.classList.toggle('show');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// ========== 产品筛选 ==========
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
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
      card.style.animation = 'fadeInCard 0.4s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

// ========== 表单提交 ==========
function submitForm(e) {
  e.preventDefault();
  // 模拟提交
  const btn = e.target.querySelector('[type=submit]');
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

// 点击遮罩关闭弹窗
document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ========== 入场动画 ==========
function animateOnScroll() {
  const elements = document.querySelectorAll('.fade-in-up:not(.visible)');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

// 给需要动画的元素添加 class
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

// ========== 数字动画 ==========
function animateNumbers() {
  const stats = document.querySelectorAll('.stat-num');
  stats.forEach(stat => {
    const text = stat.textContent;
    const match = text.match(/(\d+)(\+?.*)/);
    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = match[2] || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      stat.textContent = Math.floor(current) + suffix;
      if (current >= target) {
        stat.textContent = target + suffix;
        clearInterval(timer);
      }
    }, 20);
  });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initCarousel();
  initMobileMenu();
  initTabs();

  // Hero 出场
  setTimeout(() => {
    document.querySelector('.hero-badge')?.classList.add('visible');
  }, 100);

  // 数字动画（进入视口时触发）
  let numbersAnimated = false;
  const heroStats = document.querySelector('.hero-stats');
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !numbersAnimated) {
      numbersAnimated = true;
      animateNumbers();
    }
  });
  if (heroStats) observer.observe(heroStats);

  // 添加 CSS 动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // 键盘 ESC 关闭弹窗
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
