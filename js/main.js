/* ===================================================
   IE Interior & Eksterior — main.js
   =================================================== */

'use strict';

// ─── Dynamic year calculation (replaces PHP) ──────────────────────────────────
const TAHUN_BERDIRI = 2010;
(function () {
  const el = document.getElementById('statTahunPengalaman');
  if (el) el.dataset.target = new Date().getFullYear() - TAHUN_BERDIRI;
})();

// ─── Navbar scroll behavior ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const burger = document.getElementById('burger');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});

// Mobile burger menu
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Active nav link tracking
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = navLinks.querySelector(`a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

// ─── Stats counter animation ─────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const statsEl = document.querySelector('.stats');
if (statsEl) statsObserver.observe(statsEl);

// ─── AOS (simple in-house) ───────────────────────────────────────────────────
const aosObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      aosObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

// ─── Programmatic scroll animation targets ────────────────────────────────────
// Applies data-aos to elements that don't already have it, then re-observes them
function applyScrollAnimations() {
  // Single-direction targets
  const singles = [
    { sel: '.section-header',  aos: 'fade-up' },
    { sel: '.kontak-info',     aos: 'fade-right' },
    { sel: '.kontak-form-wrap', aos: 'fade-left' },
    { sel: '.footer-brand',    aos: 'fade-up' },
    { sel: '.galeri-cta',      aos: 'fade-up' },
  ];
  singles.forEach(({ sel, aos }) => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.dataset.aos) el.setAttribute('data-aos', aos);
    });
  });

  // Staggered grid items
  ['.stat-item', '.testi-card', '.footer-links'].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.dataset.aos) {
        el.setAttribute('data-aos', 'fade-up');
        if (i > 0) el.setAttribute('data-delay', String(i * 100));
      }
    });
  });

  // Observe all newly tagged elements
  document.querySelectorAll('[data-aos]:not(.aos-animate)').forEach(el => aosObserver.observe(el));
}
applyScrollAnimations();

// ─── Image progressive blur-up ────────────────────────────────────────────────
// Starts blurred/transparent, snaps to sharp once the browser finishes loading
function imgBlurUp(img) {
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('img-loaded');
  } else {
    img.addEventListener('load',  () => img.classList.add('img-loaded'), { once: true });
    img.addEventListener('error', () => img.classList.add('img-loaded'), { once: true });
  }
}

// ─── AJAX Gallery Data ────────────────────────────────────────────────────────
let galleryData = null;

async function fetchGalleryData() {
  if (galleryData) return galleryData;
  try {
    const res = await fetch('data/gallery.json');
    if (!res.ok) throw new Error('Network error');
    galleryData = await res.json();
    return galleryData;
  } catch (err) {
    console.error('Gallery fetch error:', err);
    return null;
  }
}

// ─── Gallery Modal ────────────────────────────────────────────────────────────
const galleryModal  = document.getElementById('galleryModal');
const modalTitle    = document.getElementById('modalTitle');
const modalClose    = document.getElementById('modalClose');
const galleryLoader = document.getElementById('galleryLoader');
const galleryGrid   = document.getElementById('galleryGrid');
const galleryEmpty  = document.getElementById('galleryEmpty');

let modalImages = [];
let lightboxIndex = 0;

async function openGalleryModal(category, title) {
  modalTitle.textContent = title;
  galleryGrid.innerHTML  = '';
  galleryEmpty.style.display  = 'none';
  galleryLoader.style.display = 'flex';
  galleryModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const data = await fetchGalleryData();

  galleryLoader.style.display = 'none';

  if (!data || !data.categories[category] || !data.categories[category].items.length) {
    galleryEmpty.style.display = 'flex';
    return;
  }

  const items = data.categories[category].items;
  modalImages = items;

  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <img src="${item.thumb}" alt="${item.caption}" loading="lazy" />
      <div class="gallery-item-overlay">
        <span class="gallery-item-caption">${item.caption}</span>
      </div>
    `;
    imgBlurUp(el.querySelector('img'));
    el.addEventListener('click', () => openLightbox(idx, modalImages));
    galleryGrid.appendChild(el);
  });
}

function closeGalleryModal() {
  galleryModal.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeGalleryModal);
galleryModal.addEventListener('click', e => {
  if (e.target === galleryModal) closeGalleryModal();
});

// Attach open buttons (Layanan cards)
document.querySelectorAll('.btn-gallery').forEach(btn => {
  btn.addEventListener('click', () => {
    openGalleryModal(btn.dataset.category, btn.dataset.title);
  });
});

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');

let currentImages = [];

function openLightbox(index, images) {
  currentImages  = images;
  lightboxIndex  = index;
  showLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = galleryModal.classList.contains('active') ? 'hidden' : '';
}

function showLightboxImage() {
  const item = currentImages[lightboxIndex];
  lightboxImg.src         = item.src;
  lightboxImg.alt         = item.caption;
  lightboxCaption.textContent = item.caption;
  lightboxPrev.style.display = lightboxIndex === 0 ? 'none' : 'flex';
  lightboxNext.style.display = lightboxIndex === currentImages.length - 1 ? 'none' : 'flex';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lightboxPrev.addEventListener('click', () => {
  if (lightboxIndex > 0) { lightboxIndex--; showLightboxImage(); }
});

lightboxNext.addEventListener('click', () => {
  if (lightboxIndex < currentImages.length - 1) { lightboxIndex++; showLightboxImage(); }
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowLeft')  lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
  if (e.key === 'Escape')     closeLightbox();
});

// ─── Main Gallery Section (Masonry) ──────────────────────────────────────────
const masonryGrid  = document.getElementById('masonryGrid');
const filterBtns   = document.querySelectorAll('.filter-btn');
let allItems       = [];
let currentFilter  = 'all';

async function loadMasonryGallery() {
  const data = await fetchGalleryData();
  if (!data) {
    masonryGrid.innerHTML = '<p style="text-align:center;color:#6b6b6b;padding:40px">Galeri tidak tersedia.</p>';
    return;
  }

  allItems = [];
  Object.values(data.categories).forEach(cat => {
    cat.items.forEach(item => allItems.push(item));
  });

  renderMasonry(allItems);
}

function renderMasonry(items) {
  masonryGrid.innerHTML = '';
  if (!items.length) {
    masonryGrid.innerHTML = '<p style="text-align:center;color:#6b6b6b;padding:40px">Tidak ada item ditemukan.</p>';
    return;
  }

  const data_cats = {
    renovasi: 'Bangun & Renovasi',
    interior: 'Interior & Mebel',
    inspeksi: 'Inspeksi Rumah',
    produk:   'Produk'
  };

  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'masonry-item';
    el.dataset.category = item.category;
    el.innerHTML = `
      <img src="${item.thumb}" alt="${item.caption}" loading="lazy" />
      <div class="masonry-item-overlay">
        <span class="item-tag">${data_cats[item.category] || item.category}</span>
        <span>${item.caption}</span>
      </div>
    `;
    imgBlurUp(el.querySelector('img'));
    el.addEventListener('click', () => openLightbox(idx, items));
    masonryGrid.appendChild(el);
  });
}

// Filter tabs
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;

    const filtered = currentFilter === 'all'
      ? allItems
      : allItems.filter(item => item.category === currentFilter);

    renderMasonry(filtered);
  });
});

// ─── Lazy-load masonry only when gallery section nears viewport ───────────────
const galeriSection = document.getElementById('galeri');
const galeriLoadObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMasonryGallery();
      galeriLoadObserver.unobserve(galeriSection);
    }
  });
}, { rootMargin: '300px 0px' }); // start 300px before visible
if (galeriSection) galeriLoadObserver.observe(galeriSection);

// Prefetch gallery.json when user reaches layanan → modal opens instantly
const layananSection = document.getElementById('layanan');
const prefetchObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchGalleryData();
      prefetchObserver.unobserve(layananSection);
    }
  });
}, { rootMargin: '400px 0px' });
if (layananSection) prefetchObserver.observe(layananSection);

// ─── Contact Form → WhatsApp ──────────────────────────────────────────────────
const kontakForm  = document.getElementById('kontakForm');
const submitBtn   = document.getElementById('submitBtn');

function validateForm() {
  let valid = true;

  const nama  = document.getElementById('nama');
  const hp    = document.getElementById('hp');
  const pesan = document.getElementById('pesan');

  const namaErr  = document.getElementById('namaError');
  const hpErr    = document.getElementById('hpError');
  const pesanErr = document.getElementById('pesanError');

  // Reset errors
  [namaErr, hpErr, pesanErr].forEach(el => el.textContent = '');
  [nama, hp, pesan].forEach(el => el.classList.remove('error'));

  if (!nama.value.trim()) {
    namaErr.textContent = 'Nama tidak boleh kosong.';
    nama.classList.add('error');
    valid = false;
  }

  const hpVal = hp.value.trim().replace(/\s/g, '');
  if (!hpVal) {
    hpErr.textContent = 'Nomor WhatsApp tidak boleh kosong.';
    hp.classList.add('error');
    valid = false;
  } else if (!/^(08|\+628|628)\d{8,12}$/.test(hpVal)) {
    hpErr.textContent = 'Format nomor tidak valid (contoh: 08xxxxxxxxxx).';
    hp.classList.add('error');
    valid = false;
  }

  if (!pesan.value.trim()) {
    pesanErr.textContent = 'Pesan tidak boleh kosong.';
    pesan.classList.add('error');
    valid = false;
  }

  return valid;
}

kontakForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const nama    = document.getElementById('nama').value.trim();
  const hp      = document.getElementById('hp').value.trim();
  const layanan = document.getElementById('layanan').value;
  const pesan   = document.getElementById('pesan').value.trim();

  const msg = [
    `Halo IE Interior, saya ingin konsultasi:`,
    ``,
    `Nama    : ${nama}`,
    `No. HP  : ${hp}`,
    layanan ? `Layanan : ${layanan}` : '',
    ``,
    `Pesan:`,
    pesan
  ].filter(l => l !== undefined).join('\n');

  const waURL = `https://wa.me/6289699639763?text=${encodeURIComponent(msg)}`;

  // Button loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Mengirim...`;

  setTimeout(() => {
    window.open(waURL, '_blank', 'noopener');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Kirim via WhatsApp`;
    kontakForm.reset();
    showToast('Pesan berhasil dikirim via WhatsApp!');
  }, 600);
});

// ─── Toast notification ───────────────────────────────────────────────────────
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 28px;
    background: #1a1a2e;
    color: #fff;
    padding: 14px 24px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    animation: toastIn 0.35s ease forwards;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(10px); } }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── Escape key closes modals ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (lightbox.classList.contains('active')) { closeLightbox(); return; }
    if (galleryModal.classList.contains('active')) { closeGalleryModal(); }
  }
});

// ─── Init on DOM ready ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateActiveNav();
  // Trigger navbar scrolled if page is already scrolled on load
  if (window.scrollY > 50) navbar.classList.add('scrolled');
});
