/* LMI Interactive Prototype — App Logic */

(function () {
  const state = {
    role: 'shopper',
    screen: 'splash',
    history: [],
    dark: false,
    lang: 'en',
  };

  const els = {
    screenContainer: document.getElementById('screen-container'),
    header: document.getElementById('app-header'),
    headerTitle: document.getElementById('header-title'),
    backBtn: document.getElementById('back-btn'),
    tabBar: document.getElementById('tab-bar'),
    fab: document.getElementById('fab'),
    overlay: document.getElementById('overlay'),
    sheetContent: document.getElementById('sheet-content'),
    screenSelect: document.getElementById('screen-select'),
    roleSelect: document.getElementById('role-select'),
    darkToggle: document.getElementById('dark-toggle'),
    langSelect: document.getElementById('lang-select'),
    toast: document.getElementById('toast'),
  };

  const TAB_CONFIG = {
    shopper: [
      { id: 'home', label: 'Home', icon: 'home', screen: 'home' },
      { id: 'search', label: 'Search', icon: 'search', screen: 'search' },
      { id: 'list', label: 'My list', icon: 'list', screen: 'list' },
      { id: 'alerts', label: 'Alerts', icon: 'alerts', screen: 'alerts' },
      { id: 'profile', label: 'Profile', icon: 'profile', screen: 'profile' },
    ],
    reporter: [
      { id: 'home', label: 'Home', icon: 'home', screen: 'home' },
      { id: 'search', label: 'Search', icon: 'search', screen: 'search' },
      { id: 'list', label: 'My list', icon: 'list', screen: 'list' },
      { id: 'alerts', label: 'Alerts', icon: 'alerts', screen: 'alerts' },
      { id: 'profile', label: 'Profile', icon: 'profile', screen: 'profile_reporter' },
    ],
    vendor: [
      { id: 'vendor', label: 'Dashboard', icon: 'vendor', screen: 'vendor-dashboard' },
      { id: 'products', label: 'Products', icon: 'products', screen: 'vendor-products' },
      { id: 'analytics', label: 'Analytics', icon: 'chart', screen: 'vendor-analytics' },
      { id: 'profile', label: 'Profile', icon: 'profile', screen: 'profile' },
    ],
    admin: [
      { id: 'admin', label: 'Admin', icon: 'admin', screen: 'admin-home' },
      { id: 'home', label: 'Browse', icon: 'home', screen: 'home' },
      { id: 'search', label: 'Search', icon: 'search', screen: 'search' },
      { id: 'profile', label: 'Profile', icon: 'profile', screen: 'profile' },
    ],
  };

  function getScreen(id) {
    if (id === 'profile' && state.role === 'reporter') return SCREENS.profile_reporter;
    return SCREENS[id];
  }

  function buildScreenPicker() {
    const groups = {
      'Auth & launch': ['splash','welcome','register','login','verify-otp','forgot-password','role-select','onboarding-1','onboarding-2','onboarding-3','blocked','force-update','maintenance'],
      'Shopper': ['home','search','list','alerts','profile','product-comparison','market-profile','market-map','list-result','favourites'],
      'Reporter': ['submit-guidelines','submit-market','submit-product','submit-price','submit-confirm','submit-success','submission-history','leaderboard','reporter-public'],
      'Vendor': ['vendor-dashboard','vendor-products','vendor-product-add','vendor-analytics','vendor-subscription','claim-market','claim-stall','claim-status','vendor-public'],
      'Admin': ['admin-home','admin-flags','admin-flag-review','admin-user','admin-products','admin-markets','admin-broadcast','admin-analytics'],
      'Settings': ['settings','settings-notifications','settings-language','settings-privacy','delete-account','edit-profile','premium-upgrade','subscription'],
      'Sheets': ['flag-sheet','alert-sheet','logout-dialog','badge-unlock'],
    };
    let html = '';
    Object.entries(groups).forEach(([group, ids]) => {
      html += `<optgroup label="${group}">`;
      ids.forEach((id) => {
        const s = SCREENS[id] || SHEETS[id];
        const label = s?.title || id;
        html += `<option value="${id}">${label || id} (${id})</option>`;
      });
      html += '</optgroup>';
    });
    els.screenSelect.innerHTML = html;
  }

  function renderTabs(activeTab) {
    const tabs = TAB_CONFIG[state.role] || TAB_CONFIG.shopper;
    els.tabBar.innerHTML = tabs.map((t) => `
      <button class="tab-item ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}" data-nav="${t.screen}">
        ${ICONS[t.icon]}
        <span>${t.label}</span>
      </button>
    `).join('');
  }

  function renderScreen(id, pushHistory = true) {
    const screen = getScreen(id);
    if (!screen && !SHEETS[id]) return;

    if (pushHistory && state.screen !== id) {
      state.history.push(state.screen);
    }
    state.screen = id;

    if (SHEETS[id]) {
      openSheet(id);
      els.screenSelect.value = state.history[state.history.length - 1] || state.screen;
      return;
    }

    els.screenContainer.innerHTML = `<div class="screen active ${screen.fullBleed ? 'no-pad screen-map' : ''}" id="current-screen">${screen.html}</div>`;

    const showHeader = screen.title !== undefined;
    els.header.style.display = showHeader ? 'flex' : 'none';
    els.headerTitle.textContent = screen.title || '';
    els.backBtn.classList.toggle('hidden', !screen.showBack);

    const showTabs = screen.showTabs === true;
    els.tabBar.classList.toggle('hidden', !showTabs);
    if (showTabs) renderTabs(screen.tab);

    const showFab = state.role === 'reporter' && ['home','search','list','alerts','profile_reporter'].includes(id);
    els.fab.classList.toggle('visible', showFab);

    els.screenSelect.value = id;
    bindScreenEvents();
    els.screenContainer.scrollTop = 0;
  }

  function navigate(id, pushHistory = true) {
    if (SHEETS[id]) {
      openSheet(id);
      return;
    }
    renderScreen(id, pushHistory);
  }

  function goBack() {
    if (state.history.length) {
      const prev = state.history.pop();
      renderScreen(prev, false);
    } else {
      navigate('home', false);
    }
  }

  function openSheet(id) {
    const sheet = SHEETS[id];
    if (!sheet) return;
    const isCenter = !!sheet.center;
    els.sheetContent.className = isCenter ? 'modal' : 'bottom-sheet';
    els.sheetContent.innerHTML = `
      ${isCenter ? '' : '<div class="sheet-handle"></div>'}
      ${sheet.title ? `<h2 class="h2 mb-md">${sheet.title}</h2>` : ''}
      ${sheet.html}
    `;
    els.overlay.classList.add('active');
    els.overlay.classList.toggle('center', isCenter);
    bindScreenEvents(els.sheetContent);
  }

  function closeSheet() {
    els.overlay.classList.remove('active', 'center');
    els.sheetContent.innerHTML = '';
    els.sheetContent.className = 'bottom-sheet';
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 2500);
  }

  function setRole(role) {
    state.role = role;
    els.roleSelect.value = role;
    const entry = {
      shopper: 'home',
      reporter: 'home',
      vendor: 'vendor-dashboard',
      admin: 'admin-home',
    };
    state.history = [];
    navigate(entry[role] || 'home', false);
  }

  function setTheme(dark) {
    state.dark = dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    els.darkToggle.classList.toggle('on', dark);
    document.querySelectorAll('.theme-check-light').forEach((el) => {
      el.style.display = dark ? 'none' : 'inline';
    });
    document.querySelectorAll('.theme-check-dark').forEach((el) => {
      el.style.display = dark ? 'inline' : 'none';
    });
  }

  function bindScreenEvents(root = els.screenContainer) {
    root.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const nav = el.dataset.nav;
        if (el.dataset.role) setRole(el.dataset.role);
        if (nav) navigate(nav);
      });
    });

    root.querySelectorAll('[data-sheet]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openSheet(el.dataset.sheet);
      });
    });

    root.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const actions = el.dataset.action.split(' ');
        actions.forEach((a) => {
          if (a === 'close-sheet') closeSheet();
          if (a === 'toast' && el.dataset.msg) showToast(el.dataset.msg);
          if (a === 'theme-light') setTheme(false);
          if (a === 'theme-dark') setTheme(true);
        });
      });
    });

    root.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.toggle('on');
      });
    });
  }

  // Event listeners
  els.backBtn.addEventListener('click', goBack);
  els.fab.addEventListener('click', () => navigate('submit-guidelines'));
  els.overlay.addEventListener('click', (e) => {
    if (e.target === els.overlay) closeSheet();
  });

  els.screenSelect.addEventListener('change', () => {
    state.history = [];
    const val = els.screenSelect.value;
    if (SHEETS[val]) openSheet(val);
    else renderScreen(val, false);
  });

  els.roleSelect.addEventListener('change', () => setRole(els.roleSelect.value));

  els.darkToggle.addEventListener('click', () => setTheme(!state.dark));

  els.langSelect.addEventListener('change', () => {
    state.lang = els.langSelect.value;
    showToast(state.lang === 'pidgin' ? 'Pidgin mode (demo)' : 'English');
  });

  document.getElementById('btn-splash').addEventListener('click', () => navigate('welcome', false));
  document.getElementById('btn-badge').addEventListener('click', () => openSheet('badge-unlock'));
  document.getElementById('btn-reset').addEventListener('click', () => {
    state.history = [];
    setRole('shopper');
    navigate('splash', false);
  });

  // Init
  buildScreenPicker();
  setTheme(false);
  renderScreen('splash', false);

  // Auto splash → welcome
  setTimeout(() => {
    if (state.screen === 'splash') navigate('welcome', false);
  }, 1500);

  document.getElementById('screen-count').textContent =
    `${SCREEN_LIST.length + Object.keys(SHEETS).length} screens · ${Object.keys(SHEETS).length} sheets/modals`;
})();
