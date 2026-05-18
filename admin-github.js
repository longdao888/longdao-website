/* ============================================================
   admin-github.js - GitHub API 集成 + 图库管理 + 图片选择器
   ============================================================ */

/* ===== GitHub Token 管理 ===== */
function loadToken() {
  return localStorage.getItem('longdao_gh_token') || '';
}

function saveToken() {
  const token = document.getElementById('settingToken').value.trim();
  if (!token) { showToast('请输入 Token', 'error'); return; }
  localStorage.setItem('longdao_gh_token', token);
  showToast('Token 已保存', 'success');
}

async function testToken() {
  const token = loadToken();
  if (!token) { showToast('请先保存 Token', 'error'); return; }
  try {
    const resp = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (resp.ok) {
      const data = await resp.json();
      showToast('连接成功！用户：' + data.login, 'success');
    } else {
      showToast('Token 无效（HTTP ' + resp.status + '）', 'error');
    }
  } catch (e) {
    showToast('连接失败：' + e.message, 'error');
  }
}

/* ===== GitHub API 工具函数 ===== */
const GH_API  = 'https://api.github.com';
const GH_REPO = 'longdao888/longdao-website';

async function githubUpload(path, base64Content, message, sha) {
  const token = loadToken();
  if (!token) throw new Error('未配置 GitHub Token');
  const payload = { message: message, content: base64Content, branch: 'main' };
  if (sha) payload.sha = sha;
  const resp = await fetch(GH_API + '/repos/' + GH_REPO + '/contents/' + path, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error('上传失败（' + resp.status + '）：' + (err.message || '未知错误'));
  }
  return resp.json();
}

async function githubDelete(path, message, sha) {
  const token = loadToken();
  if (!token) throw new Error('未配置 GitHub Token');
  const payload = { message: message, sha: sha, branch: 'main' };
  const resp = await fetch(GH_API + '/repos/' + GH_REPO + '/contents/' + path, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error('删除失败（' + resp.status + '）：' + (err.message || '未知错误'));
  }
  return resp.json();
}

async function githubList(path) {
  const token = loadToken();
  if (!token) throw new Error('未配置 GitHub Token');
  const resp = await fetch(GH_API + '/repos/' + GH_REPO + '/contents/' + path + '?ref=main', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!resp.ok) throw new Error('列出文件失败（' + resp.status + '）');
  return resp.json();
}

/* ===== 图片压缩（Canvas）===== */
function compressImage(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('压缩失败')); return; }
          resolve(blob);
        }, 'image/webp', 0.85);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/* ===== 图库管理 ===== */
let galleryImages = [];

async function renderGallery() {
  const grid   = document.getElementById('galleryGrid');
  const empty  = document.getElementById('galleryEmpty');
  const token  = loadToken();
  if (!token) {
    grid.innerHTML = '<p style="color:var(--text-3);padding:20px;text-align:center">请先在「系统设置 → GitHub 配置」中保存 Token</p>';
    empty.style.display = 'none';
    return;
  }
  try {
    const files = await githubList('images');
    galleryImages = files.filter(f => f.type === 'file');
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--danger);padding:20px;text-align:center">加载失败：' + escHtml(e.message) + '</p>';
    empty.style.display = 'none';
    return;
  }
  if (galleryImages.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = galleryImages.map(f => {
    const name   = escHtml(f.name);
    const url    = escHtml(f.download_url);
    const sha    = escHtml(f.sha);
    const sizeKB = (f.size / 1024).toFixed(1);
    return `<div class="gallery-item">
      <div class="gallery-thumb-wrap">
        <img src="${url}" alt="${name}" loading="lazy" />
      </div>
      <div class="gallery-item-info">
        <div class="gallery-item-name">${name}</div>
        <div class="gallery-item-meta">${sizeKB} KB</div>
      </div>
      <div class="gallery-item-actions">
        <button class="btn btn-outline btn-sm" onclick="copyImagePath('${name}')">复制路径</button>
        <button class="btn btn-danger btn-sm" onclick="deleteImage('${name}', '${sha}')">删除</button>
      </div>
    </div>`;
  }).join('');
}

window.triggerImageUpload = function() {
  document.getElementById('imageUploadInput').click();
};

window.handleImageUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('请选择图片文件', 'error'); return; }

  // 直接在 panel-gallery 中查找上传按钮（input 不在 .card 内，不能用 closest）
  const panel = document.getElementById('panel-gallery');
  const btn = panel ? panel.querySelector('.btn-primary') : null;
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = '上传中...'; btn.disabled = true; }

  try {
    showToast('正在压缩图片...', 'info');
    const blob = await compressImage(file, 1920);

    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    const path = 'images/' + name;

    showToast('正在上传到 GitHub...', 'info');
    let sha = null;
    try {
      const existing = await fetch(GH_API + '/repos/' + GH_REPO + '/contents/' + path + '?ref=main', {
        headers: { 'Authorization': 'Bearer ' + loadToken(), 'Accept': 'application/vnd.github.v3+json' }
      });
      if (existing.ok) { const d = await existing.json(); sha = d.sha; }
    } catch (e) {}

    await githubUpload(path, base64, 'upload: ' + name, sha);
    showToast('✅ 图片已上传：' + name, 'success');
    renderGallery();
  } catch (e) {
    showToast('上传失败：' + e.message, 'error');
  } finally {
    if (btn) { btn.textContent = origText; btn.disabled = false; }
    event.target.value = '';
  }
};

window.copyImagePath = function(filename) {
  const path = 'images/' + filename;
  navigator.clipboard.writeText(path).then(() => {
    showToast('已复制：' + path, 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = path;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制：' + path, 'success');
  });
};

window.deleteImage = async function(filename, sha) {
  if (!confirm('确定删除图片 ' + filename + '？')) return;
  try {
    await githubDelete('images/' + filename, 'delete: ' + filename, sha);
    showToast('图片已删除', 'success');
    renderGallery();
  } catch (e) {
    showToast('删除失败：' + e.message, 'error');
  }
};

/* ===== 图片选择器（供轮播图/产品管理等调用）===== */
let imagePickerCallback = null;

window.openImagePicker = async function(callback) {
  imagePickerCallback = callback;
  const modal = document.getElementById('imagePickerModal');
  const grid  = document.getElementById('imagePickerGrid');
  modal.classList.add('open');

  try {
    const files = await githubList('images');
    const images = files.filter(f => f.type === 'file');
    if (images.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-3);padding:20px;text-align:center">图库为空，请先上传图片</p>';
      return;
    }
    grid.innerHTML = images.map(f => {
      const name = escHtml(f.name);
      const url  = escHtml(f.download_url);
      return `<div class="image-picker-item" onclick="selectImage('${url}', '${name}')">
        <img class="image-picker-thumb" src="${url}" alt="${name}" loading="lazy" />
        <div class="image-picker-name">${name}</div>
      </div>`;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--danger);padding:20px">无法加载图库：' + escHtml(e.message) + '</p>';
  }
};

window.selectImage = function(url, name) {
  if (imagePickerCallback) imagePickerCallback(url, name);
  closeImagePicker();
  imagePickerCallback = null;
};

window.closeImagePicker = function() {
  document.getElementById('imagePickerModal').classList.remove('open');
};

/* ===== 增强轮播图：绑定图库选择按钮 ===== */
function setupBannerImagePicker() {
  const srcInput = document.getElementById('bannerSrc');
  if (!srcInput || srcInput._pickerBound) return;
  srcInput._pickerBound = true;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-outline btn-sm';
  btn.style.marginTop = '8px';
  btn.textContent = '📁 从图库选择';
  btn.onclick = function() {
    if (typeof openImagePicker === 'function') {
      openImagePicker(function(url, name) {
        document.getElementById('bannerSrc').value = 'images/' + name;
        let preview = document.getElementById('bannerPreview');
        if (!preview) {
          preview = document.createElement('img');
          preview.id = 'bannerPreview';
          preview.style.cssText = 'max-width:100%;margin-top:8px;border-radius:6px;';
          srcInput.parentNode.appendChild(preview);
        }
        preview.src = url;
      });
    }
  };
  srcInput.parentNode.appendChild(btn);
}

/* ===== DOM 加载完成后，覆盖内联脚本中的函数 ===== */
document.addEventListener('DOMContentLoaded', function() {
  /* ===== 覆盖 openBannerModal 以支持图库选择 ===== */
  const _origOpenBannerModal = window.openBannerModal;
  window.openBannerModal = function() {
    document.getElementById('bannerModal').classList.add('open');
    document.getElementById('bannerModalTitle').textContent = '添加轮播图';
    ['bannerSrc','bannerAlt','bannerLink'].forEach(function(id) { document.getElementById(id).value = ''; });
    const preview = document.getElementById('bannerPreview');
    if (preview) preview.remove();
    setupBannerImagePicker();
  };

  /* ===== 重载 switchPanel 以渲染图库 ===== */
  const _origSwitchPanel = window.switchPanel;
  window.switchPanel = function(name) {
    _origSwitchPanel(name);
    if (name === 'gallery') renderGallery();
  };

  /* ===== 更新 loadSettings 以加载 Token ===== */
  const _origLoadSettings = window.loadSettings;
  window.loadSettings = function() {
    _origLoadSettings();
    const token = loadToken();
    const tokenInput = document.getElementById('settingToken');
    if (tokenInput) tokenInput.value = token;
  };
});
