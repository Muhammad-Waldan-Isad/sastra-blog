/* app.js
   Vanilla JS, mobile-first.
   Cocok dengan index.html dan style.css yang kamu pakai.
*/

(() => {
  const POSTS_URL = 'posts.json';
  const PAGE_SIZE = 6; // post per halaman
  const tpl = document.getElementById('tpl-post-card');
  const postsEl = document.getElementById('posts');
  const tagListEl = document.getElementById('tag-list');
  const recentListEl = document.getElementById('recent-list');
  const searchInput = document.getElementById('search');
  const filterSelect = document.getElementById('filter-type');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const yearEl = document.getElementById('year');
  const decreaseFontBtn = document.getElementById('decrease-font');
  const increaseFontBtn = document.getElementById('increase-font');

  let POSTS = [];         // semua post dari posts.json
  let FILTERED = [];      // hasil filter + search
  let currentPage = 1;
  let currentType = '';   // cerpen|puisi|artikel or ''
  let currentTag = '';    // tag string or ''
  let currentQuery = '';  // search query

  /* =========================
     Utils
     ========================= */
  const qs = new URLSearchParams(location.search);

  function fmtDate(d) {
    // tampilkan tanggal: 7 Maret 2026 (bahasa sederhana)
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return d;
    }
  }

  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function setPageTitle(title) {
    if (title) document.title = `${title} — Nama Blog Karya Sastra`;
  }

  function updateURLParams() {
    const p = new URLSearchParams();
    if (currentQuery) p.set('q', currentQuery);
    if (currentType) p.set('type', currentType);
    if (currentTag) p.set('tag', currentTag);
    if (currentPage > 1) p.set('page', String(currentPage));
    const s = p.toString();
    const newUrl = location.pathname + (s ? `?${s}` : '');
    history.replaceState(null, '', newUrl);
  }

  /* =========================
     Fetch & prepare posts
     ========================= */
  async function fetchPosts() {
    try {
      const res = await fetch(POSTS_URL, {cache: "no-store"});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // normalize: ensure fields exist and date is Date-parsable
      POSTS = (data || []).map(p => ({
        slug: p.slug || (p.path?.replace(/^posts\//,'').replace('.html','') || ''),
        title: p.title || 'Tanpa Judul',
        date: p.date || '1970-01-01',
        type: p.type || '',
        author: p.author || '',
        excerpt: p.excerpt || '',
        tags: Array.isArray(p.tags) ? p.tags : (p.tags ? String(p.tags).split(',').map(t=>t.trim()).filter(Boolean) : []),
        path: p.path || (`posts/${p.slug}.html`),
        // jika kamu mau tambahkan field lain, bisa di sini
      }));

      // sort by date desc (terbaru dulu)
      POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error('Gagal memuat posts.json:', err);
      POSTS = [];
      postsEl.innerHTML = `<p class="error">Gagal memuat daftar tulisan. Cek file <code>posts.json</code> atau koneksi.</p>`;
    }
  }

  /* =========================
     Render helpers
     ========================= */
  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderPostsList(page = 1) {
    clearChildren(postsEl);

    if (!FILTERED.length) {
      postsEl.innerHTML = `<p class="empty">Tidak ada tulisan yang cocok dengan kriteria.</p>`;
      pageInfo.textContent = 'Halaman 0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (page - 1) * PAGE_SIZE;
    const chunk = FILTERED.slice(start, start + PAGE_SIZE);

    // render each card using template
    chunk.forEach(p => {
      const clone = tpl.content.cloneNode(true);
      const article = clone.querySelector('article.post-card');
      const link = clone.querySelector('.post-link');
      const titleEl = clone.querySelector('.post-title');
      const metaEl = clone.querySelector('.post-meta');
      const excerptEl = clone.querySelector('.post-excerpt');

      link.href = p.path;
      titleEl.textContent = p.title;
      metaEl.textContent = `${fmtDate(p.date)} • ${p.type}${p.author ? ' • ' + p.author : ''}`;
      excerptEl.textContent = p.excerpt || '';

      postsEl.appendChild(clone);
    });

    // pagination controls
    pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // focus ke daftar post agar pengguna keyboard tahu ada konten baru
    postsEl.setAttribute('tabindex', '-1');
    postsEl.focus({preventScroll: true});

    updateURLParams();
  }

  function renderTagCloud() {
    if (!tagListEl) return;
    clearChildren(tagListEl);

    const counts = POSTS.reduce((acc, p) => {
      p.tags.forEach(t => {
        if (!t) return;
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {});

    const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);

    if (!entries.length) {
      tagListEl.innerHTML = `<li><small class="muted">Belum ada tag</small></li>`;
      return;
    }

    entries.forEach(([tag, count]) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.tag = tag;
      btn.title = `${tag} — ${count} tulisan`;
      btn.textContent = `${tag} (${count})`;
      btn.addEventListener('click', () => {
        // set active tag and reset page
        currentTag = tag;
        filterSelect.value = ''; // clear type filter
        currentType = '';
        currentQuery = '';
        if (searchInput) searchInput.value = '';
        applyFilters({resetPage: true});
      });
      li.appendChild(btn);
      tagListEl.appendChild(li);
    });
  }

  function renderRecent() {
    if (!recentListEl) return;
    clearChildren(recentListEl);

    POSTS.slice(0, 6).forEach(p => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = p.path;
      a.textContent = p.title;
      li.appendChild(a);
      recentListEl.appendChild(li);
    });
  }

  /* =========================
     Filtering & searching
     ========================= */
  function applyFilters({resetPage = false} = {}) {
    // start from all posts
    let result = POSTS.slice();

    // filter by type (if set)
    if (currentType) {
      result = result.filter(p => String(p.type).toLowerCase() === currentType.toLowerCase());
    }

    // filter by tag
    if (currentTag) {
      result = result.filter(p => p.tags && p.tags.includes(currentTag));
    }

    // search (title, excerpt, tags)
    if (currentQuery) {
      const q = currentQuery.trim().toLowerCase();
      result = result.filter(p => {
        if (p.title && p.title.toLowerCase().includes(q)) return true;
        if (p.excerpt && p.excerpt.toLowerCase().includes(q)) return true;
        if (p.author && p.author.toLowerCase().includes(q)) return true;
        if (p.tags && p.tags.join(' ').toLowerCase().includes(q)) return true;
        return false;
      });
    }

    FILTERED = result;
    if (resetPage) currentPage = 1;
    renderPostsList(currentPage);
  }

  /* =========================
     Handlers
     ========================= */
  function onSearchInput(e) {
    currentQuery = e.target.value || '';
    currentTag = ''; // clear tag when searching
    applyFilters({resetPage: true});
  }

  const debouncedSearch = debounce(onSearchInput, 300);

  function onFilterChange(e) {
    currentType = e.target.value || '';
    currentTag = '';
    if (searchInput) searchInput.value = ''; currentQuery = '';
    applyFilters({resetPage: true});
  }

  function onPrev() {
    if (currentPage > 1) {
      renderPostsList(currentPage - 1);
    }
  }
  function onNext() {
    const totalPages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      renderPostsList(currentPage + 1);
    }
  }

  /* =========================
     Font size controls
     ========================= */
  function readFontPref() {
    return localStorage.getItem('sastra_font') || 'normal'; // 'small' | 'normal' | 'large'
  }
  function writeFontPref(v) {
    localStorage.setItem('sastra_font', v);
  }
  function applyFont(pref) {
    const body = document.body;
    if (pref === 'small') body.dataset.font = 'small';
    else if (pref === 'large') body.dataset.font = 'large';
    else body.dataset.font = '';
    writeFontPref(pref);
  }
  function incFont() {
    const cur = readFontPref();
    if (cur === 'small') applyFont('normal');
    else if (cur === 'normal') applyFont('large');
    else applyFont('large'); // already large -> stay
  }
  function decFont() {
    const cur = readFontPref();
    if (cur === 'large') applyFont('normal');
    else if (cur === 'normal') applyFont('small');
    else applyFont('small');
  }

  /* =========================
     Init: wire up events & load
     ========================= */
  async function init() {
    // set year fallback (if HTML didn't)
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // wire events
    if (searchInput) searchInput.addEventListener('input', debouncedSearch);
    if (filterSelect) filterSelect.addEventListener('change', onFilterChange);
    if (prevBtn) prevBtn.addEventListener('click', onPrev);
    if (nextBtn) nextBtn.addEventListener('click', onNext);
    if (increaseFontBtn) increaseFontBtn.addEventListener('click', () => { incFont(); });
    if (decreaseFontBtn) decreaseFontBtn.addEventListener('click', () => { decFont(); });

    // restore font preference
    applyFont(readFontPref());

    // parse initial query params (q,type,tag,page)
    if (qs.get('q')) currentQuery = qs.get('q');
    if (qs.get('type')) currentType = qs.get('type');
    if (qs.get('tag')) currentTag = qs.get('tag');
    if (qs.get('page')) currentPage = Math.max(1, parseInt(qs.get('page'), 10) || 1);

    // pre-fill UI controls from params
    if (searchInput && currentQuery) searchInput.value = currentQuery;
    if (filterSelect && currentType) filterSelect.value = currentType;

    // load posts
    await fetchPosts();

    // render tag cloud + recent (depends on POSTS)
    renderTagCloud();
    renderRecent();

    // initial filter application
    applyFilters({resetPage: true});

    // if currentTag param present, apply it (after tags rendered)
    if (currentTag) {
      // ensure tag-list shows selection visually (optional)
      // find corresponding button and focus it
      const btn = tagListEl?.querySelector(`button[data-tag="${currentTag}"]`);
      if (btn) btn.focus();
      applyFilters({resetPage: true});
    }
  }

  // run
  document.addEventListener('DOMContentLoaded', init);
})();
