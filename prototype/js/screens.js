/* LMI Prototype — Screen Registry (all screens) */

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  alerts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  vendor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.79 1.1L21 9"/></svg>',
  products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  chevron: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
  heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  bell: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>',
  share: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>',
};

function priceCard(market, price, unit, freshness, reporter, badge, freshClass) {
  const chipClass = freshClass === 'amber' ? 'chip-amber' : freshClass === 'red' ? 'chip-red' : 'chip-green';
  return `<div class="card card-clickable" data-nav="market-profile">
    <div class="card-row">
      <div class="card-main">
        <div class="h3">${market}</div>
        <span class="chip ${chipClass} mt-sm">${freshness}</span>
        <p class="caption mt-sm">${badge} ${reporter}</p>
      </div>
      <div class="price-sm">₦${price} <span class="caption">/ ${unit}</span></div>
    </div>
  </div>`;
}

function listItem(icon, title, sub, nav) {
  return `<div class="list-item" data-nav="${nav || ''}">
    <div class="icon-wrap">${icon}</div>
    <div class="list-content">
      <div class="list-title">${title}</div>
      ${sub ? `<div class="list-sub">${sub}</div>` : ''}
    </div>
    <span class="chevron">${ICONS.chevron}</span>
  </div>`;
}

function settingsItem(label, nav) {
  return `<div class="settings-item" data-nav="${nav}"><span>${label}</span><span class="chevron">${ICONS.chevron}</span></div>`;
}

const SCREENS = {
  // ─── AUTH & LAUNCH ───
  splash: {
    title: '', showBack: false, showTabs: false,
    html: `<div class="splash-screen">
      <div class="splash-logo">LMI</div>
      <p class="caption">Lagos Market Intelligence</p>
    </div>`
  },
  welcome: {
    title: '', showBack: false, showTabs: false,
    html: `<div class="welcome-hero">
      <div class="splash-logo" style="margin:0 auto 24px">LMI</div>
      <h1 class="display">Know market prices before you go</h1>
      <p class="body mt-md">Compare prices across Lagos markets in seconds</p>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" data-nav="register">Create account</button>
      <button class="btn btn-secondary" data-nav="login">Sign in</button>
    </div>
    <p class="legal-links">By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy policy</a></p>`
  },
  register: {
    title: 'Create your account', showBack: true, showTabs: false,
    html: `<div class="form-group"><label>Phone number</label><input class="form-input" type="tel" placeholder="+234 800 000 0000" value="+234 801 234 5678"></div>
    <label class="form-checkbox"><input type="checkbox" checked> I am 16 or older</label>
    <div class="btn-row"><button class="btn btn-primary" data-nav="verify-otp">Continue</button></div>
    <p class="text-center mt-lg caption">or</p>
    <button class="btn btn-secondary" data-nav="role-select">Continue with Google</button>`
  },
  login: {
    title: 'Welcome back', showBack: true, showTabs: false,
    html: `<div class="form-group"><label>Phone or email</label><input class="form-input" placeholder="you@email.com"></div>
    <div class="form-group"><label>Password</label><input class="form-input" type="password" placeholder="••••••••"></div>
    <button class="btn btn-ghost" data-nav="forgot-password" style="width:auto;margin-bottom:16px">Forgot password?</button>
    <button class="btn btn-primary" data-nav="home">Sign in</button>
    <p class="text-center mt-lg caption">Don't have an account? <button class="link-text" data-nav="register">Create account</button></p>`
  },
  'verify-otp': {
    title: 'Enter verification code', showBack: true, showTabs: false,
    html: `<p class="body">Sent to +234 801 234 5678</p>
    <div class="otp-row">
      <input class="otp-box filled" value="4" readonly><input class="otp-box filled" value="8" readonly>
      <input class="otp-box filled" value="2" readonly><input class="otp-box" readonly>
      <input class="otp-box" readonly><input class="otp-box" readonly>
    </div>
    <p class="caption text-center">Resend code in 42s</p>
    <button class="btn btn-primary mt-lg" data-nav="role-select">Verify</button>`
  },
  'forgot-password': {
    title: 'Reset password', showBack: true, showTabs: false,
    html: `<p class="body mb-lg">Enter your email and we'll send a reset link.</p>
    <div class="form-group"><label>Email</label><input class="form-input" type="email" placeholder="you@email.com"></div>
    <button class="btn btn-primary" data-nav="login">Send reset link</button>`
  },
  'role-select': {
    title: 'How will you use LMI?', showBack: true, showTabs: false,
    html: `<div class="role-card" data-nav="onboarding-1" data-role="shopper">
      <div class="role-icon">🛒</div><h3>Shopper</h3><p>Find the best prices and save on your market run</p>
    </div>
    <div class="role-card" data-nav="onboarding-1" data-role="reporter">
      <div class="role-icon">📋</div><h3>Reporter</h3><p>Share prices and build your reputation</p>
    </div>
    <div class="role-card" data-nav="claim-market" data-role="vendor">
      <div class="role-icon">🏪</div><h3>Vendor</h3><p>List your stall and reach more customers</p>
    </div>`
  },
  'onboarding-1': {
    title: '', showBack: false, showTabs: false,
    html: `<button class="skip-btn" data-nav="home">Skip</button>
    <div class="onboarding-illus">📊</div>
    <h1 class="h1">See prices across Lagos</h1>
    <p class="body mt-md">Compare tomatoes, rice, and pepper from Mile 12 to Balogun — without leaving home</p>
    <div class="onboarding-dots"><span class="dot active"></span><span class="dot"></span><span class="dot"></span></div>
    <button class="btn btn-primary" data-nav="onboarding-2">Next</button>`
  },
  'onboarding-2': {
    title: '', showBack: false, showTabs: false,
    html: `<button class="skip-btn" data-nav="home">Skip</button>
    <div class="onboarding-illus">📝</div>
    <h1 class="h1">Save every week</h1>
    <p class="body mt-md">Build a shopping list and find the one market that saves you the most</p>
    <div class="onboarding-dots"><span class="dot"></span><span class="dot active"></span><span class="dot"></span></div>
    <button class="btn btn-primary" data-nav="onboarding-3">Next</button>`
  },
  'onboarding-3': {
    title: '', showBack: false, showTabs: false,
    html: `<button class="skip-btn" data-nav="home">Skip</button>
    <div class="onboarding-illus">✓</div>
    <h1 class="h1">Prices you can trust</h1>
    <p class="body mt-md">Every price shows who reported it and when it was last updated</p>
    <div class="onboarding-dots"><span class="dot"></span><span class="dot"></span><span class="dot active"></span></div>
    <button class="btn btn-primary" data-nav="home">Get started</button>`
  },
  blocked: {
    title: 'Account suspended', showBack: false, showTabs: false,
    html: `<div class="empty-state">
      <div class="empty-icon">⛔</div>
      <h3>Account suspended</h3>
      <p>Your account has been suspended due to repeated policy violations.</p>
      <button class="btn btn-secondary">Contact support</button>
    </div>`
  },
  'force-update': {
    title: 'Update required', showBack: false, showTabs: false,
    html: `<div class="empty-state">
      <div class="empty-icon">⬆️</div>
      <h3>Update required</h3>
      <p>A new version of LMI is available. Please update to continue.</p>
      <button class="btn btn-primary">Update now</button>
    </div>`
  },
  maintenance: {
    title: 'Maintenance', showBack: false, showTabs: false,
    html: `<div class="empty-state">
      <div class="empty-icon">🔧</div>
      <h3>We'll be right back</h3>
      <p>LMI is undergoing scheduled maintenance. Try again in a few minutes.</p>
      <button class="btn btn-primary" data-nav="home">Try again</button>
    </div>`
  },

  // ─── SHOPPER TABS ───
  home: {
    title: 'Good morning', showBack: false, showTabs: true, tab: 'home',
    html: `<div class="search-bar" data-nav="search"><span>🔍</span><span class="caption">Search products and markets</span></div>
    <div class="section-title">Nearby markets <button class="section-link" data-nav="market-map" style="float:right">View map</button></div>
    <div class="scroll-row">
      <div class="scroll-card" data-nav="market-profile"><div class="emoji">🏪</div><strong>Mile 12</strong><p class="caption">1.2 km</p></div>
      <div class="scroll-card" data-nav="market-profile"><div class="emoji">🏪</div><strong>Oyingbo</strong><p class="caption">2.4 km</p></div>
      <div class="scroll-card" data-nav="market-profile"><div class="emoji">🏪</div><strong>Balogun</strong><p class="caption">5.1 km</p></div>
    </div>
    <div class="section-title">Trending today</div>
    <div class="scroll-row">
      <div class="scroll-card" data-nav="product-comparison"><div class="emoji">🍅</div><strong>Tomatoes</strong><p class="caption">from ₦650</p></div>
      <div class="scroll-card" data-nav="product-comparison"><div class="emoji">🌶️</div><strong>Pepper</strong><p class="caption">from ₦1,200</p></div>
      <div class="scroll-card" data-nav="product-comparison"><div class="emoji">🍚</div><strong>Rice</strong><p class="caption">from ₦2,800</p></div>
    </div>
    <div class="section-title">Price drops</div>
    <div class="card card-clickable" data-nav="product-comparison">
      <div class="card-row"><div><strong>Tomatoes</strong><span class="chip chip-green mt-sm">↓ 18%</span></div><div class="price-sm text-green">₦650 / kg</div></div>
    </div>`
  },
  search: {
    title: 'Search', showBack: false, showTabs: true, tab: 'search',
    html: `<div class="search-bar"><span>🔍</span><input placeholder="Search tomatoes, rice, pepper…" value="tomato"></div>
    <div class="section-title">Products</div>
    ${listItem('🍅', 'Tomatoes', 'Vegetables · from ₦650', 'product-comparison')}
    ${listItem('🍅', 'Cherry tomatoes', 'Vegetables · from ₦1,100', 'product-comparison')}
    <div class="section-title mt-lg">Markets</div>
    ${listItem('🏪', 'Mile 12 Market', 'Ketu · 1.2 km', 'market-profile')}`
  },
  list: {
    title: 'My list', showBack: false, showTabs: true, tab: 'list',
    html: `<div class="card card-row card-clickable"><div><strong>Tomatoes</strong><p class="caption">1 kg</p></div><span class="caption">✕</span></div>
    <div class="card card-row card-clickable"><div><strong>Rice</strong><p class="caption">1 bag</p></div><span class="caption">✕</span></div>
    <div class="card card-row card-clickable"><div><strong>Pepper</strong><p class="caption">1 kg</p></div><span class="caption">✕</span></div>
    <button class="btn btn-secondary mt-md" data-nav="search">Add item</button>
    <button class="btn btn-primary mt-md" data-nav="list-result">Find cheapest market</button>`
  },
  alerts: {
    title: 'Alerts', showBack: false, showTabs: true, tab: 'alerts',
    html: `<div class="section-title">Active alerts</div>
    <div class="card"><div class="card-row"><div><strong>Tomatoes</strong><p class="caption">Alert when drops 15% · ₦650 / kg now</p></div><div class="switch on" data-toggle></div></div></div>
    <div class="card"><div class="card-row"><div><strong>Rice</strong><p class="caption">Alert when drops 15% · ₦2,800 / bag now</p></div><div class="switch on" data-toggle></div></div></div>
    <div class="section-title mt-lg">Activity</div>
    <div class="card card-clickable" data-nav="product-comparison"><strong>Tomatoes dropped 18%</strong><p class="caption">2h ago · Now ₦650 / kg at Mile 12</p></div>
    <div class="card"><strong>Weekly market summary</strong><p class="caption">Yesterday · Mile 12 was cheapest for 3 items</p></div>`
  },
  profile: {
    title: 'Profile', showBack: false, showTabs: true, tab: 'profile',
    html: `<div class="profile-header">
      <div class="avatar">A</div>
      <h2 class="h2">Amaka Okafor</h2>
      <div class="badge-row"><span class="chip chip-neutral">Shopper</span><span class="chip chip-green">LMI Premium</span></div>
    </div>
    ${listItem('♥', 'Favourites', '8 products', 'favourites')}
    ${listItem('🔔', 'My alerts', '2 active', 'alerts')}
    ${listItem('📊', 'Subscription', 'Premium · renews 30 Jul', 'subscription')}
    ${listItem('⚙️', 'Settings', '', 'settings')}`
  },

  // ─── SHOPPER DETAIL ───
  'product-comparison': {
    title: 'Tomatoes', showBack: true, showTabs: false,
    html: `<div class="sort-bar">
      <button class="sort-chip active">Cheapest</button><button class="sort-chip">Nearest</button>
      <button class="sort-chip">Freshest</button><button class="sort-chip">Top reporters</button>
    </div>
    ${priceCard('Mile 12 Market', '650', 'kg', 'Updated 3h ago', '🥈', 'Chukwuemeka · Silver', 'green')}
    ${priceCard('Oyingbo Market', '720', 'kg', 'Updated 5h ago', '🥉', 'Adaeze · Bronze', 'green')}
    ${priceCard('Balogun Market', '800', 'kg', 'Updated 2d ago', '🥉', 'Tunde · Bronze', 'amber')}
    <div class="locked-section" data-nav="premium-upgrade"><strong>Price history</strong><p class="caption">Unlock with Premium</p></div>
    <div class="sticky-footer" style="position:sticky;bottom:0">
      <button class="footer-btn" data-action="toast" data-msg="Saved to favourites">${ICONS.heart} Save</button>
      <button class="footer-btn" data-sheet="alert-sheet">${ICONS.bell} Alert</button>
      <button class="footer-btn" data-action="toast" data-msg="Link copied">${ICONS.share} Share</button>
      <button class="footer-btn" data-sheet="flag-sheet">⋯ Report</button>
    </div>`
  },
  'market-profile': {
    title: 'Mile 12 Market', showBack: true, showTabs: false,
    html: `<div class="map-placeholder" style="height:160px;border-radius:16px;margin:0 0 16px"><div class="map-pin" style="top:40%;left:45%"></div></div>
    <div class="chip chip-green mb-md">Open now</div>
    <p class="caption mb-md">Ketu · Opens 6:00 – 20:00 WAT</p>
    <button class="btn btn-secondary mb-lg">Get directions</button>
    <div class="section-title">Popular prices</div>
    ${priceCard('Tomatoes', '650', 'kg', 'Updated 3h ago', '🥈', 'Chukwuemeka', 'green')}
    ${priceCard('Pepper', '1,200', 'kg', 'Updated 6h ago', '🥉', 'Adaeze', 'green')}
    <div class="section-title mt-lg">Vendors</div>
    ${listItem('🏪', 'Mama Ngozi Stall', 'Tomatoes · Pepper · Verified', 'vendor-public')}`
  },
  'market-map': {
    title: 'Markets', showBack: true, showTabs: false, fullBleed: true,
    html: `<div class="map-placeholder screen-map" style="min-height:520px">
      <div class="map-pin" style="top:30%;left:40%"></div>
      <div class="map-pin" style="top:50%;left:60%"></div>
      <div class="map-pin" style="top:65%;left:35%"></div>
      <span style="position:absolute;bottom:100px">12 markets nearby</span>
    </div>
    <div class="card" style="margin:16px 20px" data-nav="market-profile"><strong>Mile 12 Market</strong><p class="caption">1.2 km · Tomatoes from ₦650</p></div>`
  },
  'list-result': {
    title: 'Best market', showBack: true, showTabs: false,
    html: `<div class="card card-lg" style="background:var(--green-light);border:2px solid var(--green-primary)">
      <span class="chip chip-green">Recommended</span>
      <h2 class="h2 mt-md">Mile 12 Market</h2>
      <div class="price mt-sm">Est. ₦4,650</div>
      <p class="caption mt-sm">3/3 items found</p>
    </div>
    <div class="section-title">All markets ranked</div>
    <div class="card card-row"><div><strong>Mile 12</strong><p class="caption">3/3 items</p></div><div class="price-sm">₦4,650</div></div>
    <div class="card card-row"><div><strong>Oyingbo</strong><p class="caption">3/3 items</p></div><div class="price-sm">₦4,890</div></div>
    <div class="locked-section" data-nav="premium-upgrade"><p class="caption">Savings breakdown & distance — Premium</p></div>
    <button class="btn btn-primary mt-md" data-nav="market-profile">View market</button>`
  },
  favourites: {
    title: 'Favourites', showBack: true, showTabs: false,
    html: `${listItem('🍅', 'Tomatoes', 'from ₦650 / kg', 'product-comparison')}
    ${listItem('🍚', 'Rice', 'from ₦2,800 / bag', 'product-comparison')}
    ${listItem('🌶️', 'Pepper', 'from ₦1,200 / kg', 'product-comparison')}`
  },

  // ─── REPORTER ───
  'submit-guidelines': {
    title: 'Guidelines', showBack: true, showTabs: false,
    html: `<h2 class="h2">Help shoppers trust your prices</h2>
    <div class="card mt-lg"><p class="body">1. Report prices you see today</p></div>
    <div class="card"><p class="body">2. Include the correct unit (per kg, per piece)</p></div>
    <div class="card"><p class="body">3. Add a photo when you can</p></div>
    <div class="card"><p class="body">4. One update per product per visit</p></div>
    <label class="form-checkbox"><input type="checkbox" checked> I understand</label>
    <button class="btn btn-primary mt-lg" data-nav="submit-market">Start submitting</button>`
  },
  'submit-market': {
    title: 'Select market', showBack: true, showTabs: false,
    html: `<div class="steps"><div class="step done"></div><div class="step"></div><div class="step"></div><div class="step"></div></div>
    <div class="search-bar"><span>🔍</span><input placeholder="Search markets"></div>
    <p class="caption mb-md">Recent</p>
    ${listItem('🏪', 'Mile 12 Market', 'Submitted 2h ago', 'submit-product')}
    <p class="caption mb-md mt-lg">Near me</p>
    ${listItem('🏪', 'Oyingbo Market', '2.4 km', 'submit-product')}`
  },
  'submit-product': {
    title: 'Select product', showBack: true, showTabs: false,
    html: `<div class="steps"><div class="step done"></div><div class="step done"></div><div class="step active"></div><div class="step"></div></div>
    <div class="search-bar"><span>🔍</span><input placeholder="Search products" value="tomato"></div>
    ${listItem('🍅', 'Tomatoes', 'Vegetables', 'submit-price')}
    ${listItem('🍅', 'Cherry tomatoes', 'Vegetables', 'submit-price')}`
  },
  'submit-price': {
    title: 'Enter price', showBack: true, showTabs: false,
    html: `<div class="steps"><div class="step done"></div><div class="step done"></div><div class="step done"></div><div class="step active"></div></div>
    <p class="caption">Mile 12 · Tomatoes</p>
    <div class="form-group mt-lg"><label>Price (₦)</label><input class="form-input" type="number" value="650" style="font-size:24px;font-weight:700"></div>
    <div class="form-group"><label>Unit</label>
      <div class="sort-bar"><button class="sort-chip active">kg</button><button class="sort-chip">piece</button><button class="sort-chip">bunch</button></div>
    </div>
    <div class="banner banner-warning">This price looks unusual — double-check before submitting</div>
    <button class="btn btn-primary" data-nav="submit-confirm">Continue</button>`
  },
  'submit-confirm': {
    title: 'Confirm & submit', showBack: true, showTabs: false,
    html: `<div class="card card-lg">
      <p class="caption">Mile 12 Market</p><h2 class="h2">Tomatoes</h2>
      <div class="price mt-md">₦650 / kg</div>
    </div>
    <div class="card" style="text-align:center;padding:32px;cursor:pointer" data-action="toast" data-msg="Photo added">
      <div style="font-size:32px">📷</div><p class="caption mt-sm">Add photo (optional)</p>
    </div>
    <button class="btn btn-primary" data-nav="submit-success">Submit price</button>`
  },
  'submit-success': {
    title: '', showBack: false, showTabs: false,
    html: `<div class="empty-state" style="padding-top:80px">
      <div style="width:72px;height:72px;background:var(--green-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:36px;color:var(--green-primary)">✓</div>
      <h2 class="h1">Price submitted</h2>
      <p class="body mt-md">42 / 50 updates to Silver</p>
      <div class="progress-bar" style="max-width:200px;margin:12px auto"><div class="progress-fill" style="width:84%"></div></div>
      <p class="caption mt-md">🔥 5-day streak</p>
      <div class="btn-row"><button class="btn btn-primary" data-nav="submit-market">Submit another</button>
      <button class="btn btn-secondary" data-nav="home">Done</button></div>
    </div>`
  },
  'submission-history': {
    title: 'My submissions', showBack: true, showTabs: false,
    html: `${listItem('🍅', 'Tomatoes · Mile 12', '₦650 / kg · 2h ago', 'submit-price')}
    ${listItem('🌶️', 'Pepper · Oyingbo', '₦1,200 / kg · Yesterday', 'submit-price')}`
  },
  leaderboard: {
    title: 'Top reporters', showBack: true, showTabs: false,
    html: `<div class="rank-item"><span class="rank-num top">1</span><div class="avatar" style="width:40px;height:40px;font-size:16px;margin:0">C</div><div style="flex:1"><strong>Chukwuemeka</strong><p class="caption">🥇 Gold · 214 updates</p></div></div>
    <div class="rank-item"><span class="rank-num top">2</span><div class="avatar" style="width:40px;height:40px;font-size:16px;margin:0">A</div><div style="flex:1"><strong>Adaeze</strong><p class="caption">🥈 Silver · 89 updates</p></div></div>
    <div class="rank-item"><span class="rank-num">3</span><div class="avatar" style="width:40px;height:40px;font-size:16px;margin:0">Y</div><div style="flex:1"><strong>You</strong><p class="caption">🥉 Bronze · 42 updates</p></div></div>`
  },
  'reporter-public': {
    title: 'Chukwuemeka', showBack: true, showTabs: false,
    html: `<div class="profile-header">
      <div class="avatar">C</div><h2 class="h2">Chukwuemeka</h2>
      <span class="chip chip-green">🥇 Gold Reporter</span>
      <p class="caption mt-sm">214 updates · Member since Mar 2026</p>
    </div>
    <div class="section-title">Recent updates</div>
    <div class="card"><strong>Tomatoes</strong><p class="caption">Mile 12 · ₦650 / kg · 3h ago</p></div>`
  },

  // ─── VENDOR ───
  'vendor-dashboard': {
    title: 'Dashboard', showBack: false, showTabs: true, tab: 'vendor', role: 'vendor',
    html: `<div class="card card-lg">
      <span class="tier-badge">Vendor Pro</span>
      <h2 class="h2 mt-md">Mama Ngozi Stall</h2>
      <p class="caption">Oyingbo Market · Verified</p>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">128</div><div class="stat-label">Views (7d)</div></div>
      <div class="stat-card"><div class="stat-value">34</div><div class="stat-label">Clicks (7d)</div></div>
    </div>
    <button class="btn btn-primary" data-nav="vendor-product-add">Add product</button>
    <button class="btn btn-ghost mt-md" data-nav="home">Browse as shopper</button>`
  },
  'vendor-products': {
    title: 'Products', showBack: false, showTabs: true, tab: 'products', role: 'vendor',
    html: `${listItem('🍅', 'Tomatoes', '₦750 / kg · Available', 'vendor-product-add')}
    ${listItem('🌶️', 'Pepper', '₦1,300 / kg · Available', 'vendor-product-add')}
    <button class="btn btn-primary mt-lg" data-nav="vendor-product-add">Add product</button>`
  },
  'vendor-product-add': {
    title: 'Add product', showBack: true, showTabs: false,
    html: `<div class="form-group"><label>Product</label><input class="form-input" value="Tomatoes"></div>
    <div class="form-group"><label>Price (₦)</label><input class="form-input" value="750"></div>
    <div class="form-group"><label>Unit</label><input class="form-input" value="kg"></div>
    <div class="card card-row"><span>Available today</span><div class="switch on" data-toggle></div></div>
    <button class="btn btn-primary mt-lg" data-nav="vendor-products">Publish</button>`
  },
  'vendor-analytics': {
    title: 'Analytics', showBack: false, showTabs: true, tab: 'analytics', role: 'vendor',
    html: `<div class="stat-grid">
      <div class="stat-card"><div class="stat-value">128</div><div class="stat-label">Profile views</div></div>
      <div class="stat-card"><div class="stat-value">34</div><div class="stat-label">Product clicks</div></div>
    </div>
    <div class="section-title">Views over time</div>
    <div class="chart-placeholder">
      <div class="chart-bar" style="height:40%"></div><div class="chart-bar" style="height:65%"></div>
      <div class="chart-bar" style="height:55%"></div><div class="chart-bar" style="height:80%"></div>
      <div class="chart-bar" style="height:70%"></div><div class="chart-bar" style="height:90%"></div>
      <div class="chart-bar" style="height:100%"></div>
    </div>`
  },
  'vendor-subscription': {
    title: 'Vendor plans', showBack: true, showTabs: false,
    html: `<div class="plan-card"><strong>Vendor Basic</strong><div class="plan-price">₦5,000 / month</div><p class="caption mt-sm">Stall listing + profile</p></div>
    <div class="plan-card selected"><strong>Vendor Pro</strong><div class="plan-price">₦12,000 / month</div><p class="caption mt-sm">Analytics + promoted search</p></div>
    <button class="btn btn-primary mt-lg">Subscribe</button>
    <p class="caption text-center mt-md">Secured by Paystack</p>`
  },
  'claim-market': {
    title: 'Select market', showBack: true, showTabs: false,
    html: `<p class="body mb-lg">Where is your stall located?</p>
  <div class="search-bar"><span>🔍</span><input placeholder="Search markets"></div>
    ${listItem('🏪', 'Oyingbo Market', 'Mainland', 'claim-stall')}
    ${listItem('🏪', 'Mile 12 Market', 'Ketu', 'claim-stall')}`
  },
  'claim-stall': {
    title: 'Stall details', showBack: true, showTabs: false,
    html: `<div class="form-group"><label>Stall name</label><input class="form-input" value="Mama Ngozi Stall"></div>
    <div class="form-group"><label>Categories</label><div class="sort-bar"><button class="sort-chip active">Vegetables</button><button class="sort-chip active">Spices</button></div></div>
    <div class="form-group"><label>Description</label><input class="form-input" value="Fresh tomatoes and pepper daily"></div>
    <div class="form-group"><label>Location hint</label><input class="form-input" value="Row B, Stall 14"></div>
    <button class="btn btn-primary" data-nav="claim-status">Submit claim</button>`
  },
  'claim-status': {
    title: 'Claim status', showBack: true, showTabs: false,
    html: `<div class="empty-state">
      <div class="empty-icon">⏳</div>
      <h3>We're reviewing your claim</h3>
      <p>Usually within 48 hours. We'll notify you when approved.</p>
    </div>`
  },
  'vendor-public': {
    title: 'Mama Ngozi Stall', showBack: true, showTabs: false,
    html: `<div class="profile-header">
      <div class="avatar">🏪</div><h2 class="h2">Mama Ngozi Stall</h2>
      <span class="chip chip-green">Verified vendor</span>
      <p class="caption mt-sm">Oyingbo Market · Vegetables, Spices</p>
    </div>
    <div class="section-title">Products</div>
    ${priceCard('Tomatoes', '750', 'kg', 'Available today', '✓', 'Vendor listed', 'green')}
    ${priceCard('Pepper', '1,300', 'kg', 'Available today', '✓', 'Vendor listed', 'green')}`
  },

  // ─── ADMIN ───
  'admin-home': {
    title: 'Admin', showBack: false, showTabs: true, tab: 'admin', role: 'admin',
    html: `<div class="stat-grid">
      <div class="stat-card" data-nav="admin-flags"><div class="stat-value">7</div><div class="stat-label">Pending flags</div></div>
      <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">Pending claims</div></div>
    </div>
    ${listItem('🚩', 'Flag queue', '7 to review', 'admin-flags')}
    ${listItem('📦', 'Product catalogue', '', 'admin-products')}
    ${listItem('🏪', 'Market directory', '', 'admin-markets')}
    ${listItem('📢', 'Broadcast', '', 'admin-broadcast')}
    ${listItem('📊', 'Analytics', '', 'admin-analytics')}`
  },
  'admin-flags': {
    title: 'Flag queue', showBack: true, showTabs: false,
    html: `${listItem('🍅', 'Tomatoes · Mile 12', '₦650 · 3 flags', 'admin-flag-review')}
    ${listItem('🍚', 'Rice · Balogun', '₦3,200 · 4 flags', 'admin-flag-review')}`
  },
  'admin-flag-review': {
    title: 'Review flag', showBack: true, showTabs: false,
    html: `<div class="card card-lg"><p class="caption">Mile 12 Market</p><h2 class="h2">Tomatoes</h2><div class="price">₦650 / kg</div></div>
    <div class="card"><strong>Reporter:</strong> Chukwuemeka <span class="chip chip-green">Gold</span><p class="caption mt-sm">214 updates · 0 recent flags</p></div>
    <div class="card"><strong>Flags:</strong> 3 · Incorrect price (2), Outdated (1)</div>
    <div class="btn-row">
      <button class="btn btn-primary" data-nav="admin-flags">Confirm</button>
      <button class="btn btn-secondary" data-nav="admin-flags">Edit price</button>
      <button class="btn btn-secondary" data-nav="admin-flags">Remove</button>
      <button class="btn btn-destructive" data-nav="admin-user">Warn reporter</button>
    </div>`
  },
  'admin-user': {
    title: 'User management', showBack: true, showTabs: false,
    html: `<div class="profile-header"><div class="avatar">C</div><h2 class="h2">Chukwuemeka</h2><span class="chip chip-green">Gold Reporter</span></div>
    <div class="card card-row"><span>Verified reporter</span><div class="switch on" data-toggle></div></div>
    <button class="btn btn-secondary mt-lg">Issue warning</button>
    <button class="btn btn-destructive mt-md" data-nav="blocked">Suspend account</button>`
  },
  'admin-products': {
    title: 'Product catalogue', showBack: true, showTabs: false,
    html: `<div class="search-bar"><span>🔍</span><input placeholder="Search products"></div>
    ${listItem('🍅', 'Tomatoes', 'Vegetables', '')}
    ${listItem('🍚', 'Rice', 'Grains', '')}
    <button class="btn btn-primary mt-lg">Add product</button>`
  },
  'admin-markets': {
    title: 'Market directory', showBack: true, showTabs: false,
    html: `${listItem('🏪', 'Mile 12 Market', 'Ketu', '')}
    ${listItem('🏪', 'Oyingbo Market', 'Mainland', '')}
    <button class="btn btn-primary mt-lg">Add market</button>`
  },
  'admin-broadcast': {
    title: 'Broadcast', showBack: true, showTabs: false,
    html: `<div class="form-group"><label>Title</label><input class="form-input" placeholder="Max 60 characters"></div>
    <div class="form-group"><label>Message</label><input class="form-input" placeholder="Max 200 characters"></div>
    <div class="form-group"><label>Audience</label>
      <div class="sort-bar"><button class="sort-chip active">All</button><button class="sort-chip">Shoppers</button><button class="sort-chip">Reporters</button></div>
    </div>
    <button class="btn btn-primary" data-action="toast" data-msg="Broadcast sent">Send</button>`
  },
  'admin-analytics': {
    title: 'Analytics', showBack: true, showTabs: false,
    html: `<div class="stat-grid">
      <div class="stat-card"><div class="stat-value">12.4K</div><div class="stat-label">MAU</div></div>
      <div class="stat-card"><div class="stat-value">523</div><div class="stat-label">Submissions/day</div></div>
    </div>
    <div class="section-title">Submissions over time</div>
    <div class="chart-placeholder">
      <div class="chart-bar" style="height:60%"></div><div class="chart-bar" style="height:75%"></div>
      <div class="chart-bar" style="height:85%"></div><div class="chart-bar" style="height:70%"></div>
      <div class="chart-bar" style="height:95%"></div><div class="chart-bar" style="height:100%"></div>
    </div>`
  },

  // ─── SETTINGS & SHARED ───
  settings: {
    title: 'Settings', showBack: true, showTabs: false,
    html: `<div class="settings-group"><div class="settings-group-title">Account</div>
    ${settingsItem('Edit profile', 'edit-profile')}
    ${settingsItem('Subscription', 'subscription')}</div>
    <div class="settings-group"><div class="settings-group-title">Preferences</div>
    ${settingsItem('Notifications', 'settings-notifications')}
    ${settingsItem('Language', 'settings-language')}
    ${settingsItem('Theme', 'settings-language')}</div>
    <div class="settings-group"><div class="settings-group-title">Privacy</div>
    ${settingsItem('Privacy & data', 'settings-privacy')}
    ${settingsItem('Delete account', 'delete-account')}</div>
    <div class="settings-group">${settingsItem('Help centre', '')}${settingsItem('Contact support', '')}</div>
    <button class="btn btn-secondary mt-lg" data-sheet="logout-dialog">Sign out</button>`
  },
  'settings-notifications': {
    title: 'Notifications', showBack: true, showTabs: false,
    html: `<div class="card card-row"><span>Push notifications</span><div class="switch on" data-toggle></div></div>
    <div class="card card-row"><span>Price drop alerts</span><div class="switch on" data-toggle></div></div>
    <div class="card card-row"><span>Significant changes</span><div class="switch on" data-toggle></div></div>
    <div class="card card-row"><span>Weekly summary</span><div class="switch on" data-toggle></div></div>`
  },
  'settings-language': {
    title: 'Language', showBack: true, showTabs: false,
    html: `<div class="card card-row card-clickable"><span>English</span><span class="text-green">✓</span></div>
    <div class="card card-row card-clickable"><span>Nigerian Pidgin</span></div>
    <div class="section-title mt-lg">Theme</div>
    <div class="card card-row card-clickable" data-action="theme-light"><span>Light</span><span class="text-green theme-check-light">✓</span></div>
    <div class="card card-row card-clickable" data-action="theme-dark"><span>Dark</span><span class="text-green theme-check-dark" style="display:none">✓</span></div>
    <div class="card card-row card-clickable" data-action="theme-system"><span>System</span></div>`
  },
  'settings-privacy': {
    title: 'Privacy & data', showBack: true, showTabs: false,
    html: `<p class="body mb-lg">Your data is protected under NDPR. We never sell your personal information.</p>
    ${settingsItem('Privacy policy', '')}
    ${settingsItem('Terms of service', '')}
    ${settingsItem('Export my data', '')}
    ${settingsItem('Delete account', 'delete-account')}`
  },
  'delete-account': {
    title: 'Delete account', showBack: true, showTabs: false,
    html: `<p class="body mb-lg">This permanently removes your account after a 7-day grace period.</p>
    <div class="form-group"><label>Type DELETE to confirm</label><input class="form-input" placeholder="DELETE"></div>
    <button class="btn btn-destructive" data-nav="welcome">Delete account</button>`
  },
  'edit-profile': {
    title: 'Edit profile', showBack: true, showTabs: false,
    html: `<div class="profile-header"><div class="avatar">A</div><button class="btn btn-ghost">Change photo</button></div>
    <div class="form-group"><label>Display name</label><input class="form-input" value="Amaka Okafor"></div>
    <div class="form-group"><label>Email</label><input class="form-input" value="amaka@email.com"></div>
    <div class="form-group"><label>Bio</label><input class="form-input" placeholder="Optional"></div>
    <button class="btn btn-primary" data-nav="profile">Save</button>`
  },
  'premium-upgrade': {
    title: '', showBack: true, showTabs: false,
    html: `<div class="text-center mt-lg"><h1 class="display">Shop smarter with LMI Premium</h1>
    <p class="body mt-md">Unlimited lists, alerts, and price insights</p></div>
    <ul class="feature-list">
      <li>Unlimited shopping list</li><li>Unlimited price alerts</li>
      <li>Price history charts</li><li>Weekly market summary</li><li>Ad-free experience</li>
    </ul>
    <div class="plan-card selected"><strong>Monthly</strong><div class="plan-price">₦1,500 / month</div></div>
    <div class="plan-card"><strong>Annual</strong><div class="plan-price">₦12,000 / year</div><p class="caption text-green">Save 33%</p></div>
    <button class="btn btn-primary" data-action="toast" data-msg="Opening Paystack…">Subscribe</button>
    <p class="caption text-center mt-md">Secured by Paystack</p>`
  },
  subscription: {
    title: 'Subscription', showBack: true, showTabs: false,
    html: `<div class="card card-lg" style="text-align:center">
      <span class="chip chip-green">Active</span>
      <h2 class="h2 mt-md">LMI Premium</h2>
      <p class="caption">Renews 30 Jul 2026 · ₦1,500 / month</p>
    </div>
    <button class="btn btn-secondary mt-lg" data-sheet="logout-dialog">Cancel subscription</button>`
  },
};

// Sheet & modal content
const SHEETS = {
  'flag-sheet': {
    title: 'Report price',
    html: `<p class="caption mb-md">Why is this price incorrect?</p>
    <div class="sort-bar" style="flex-direction:column;align-items:stretch">
      <button class="sort-chip active" style="text-align:left">Incorrect price</button>
      <button class="sort-chip" style="text-align:left">Outdated</button>
      <button class="sort-chip" style="text-align:left">Spam</button>
    </div>
    <div class="form-group mt-md"><input class="form-input" placeholder="Optional comment"></div>
    <button class="btn btn-primary" data-action="close-sheet toast" data-msg="Thanks — we'll review this">Submit report</button>`
  },
  'alert-sheet': {
    title: 'Set price alert',
    html: `<p class="body mb-md">Notify me when tomatoes drop by:</p>
    <div class="sort-bar"><button class="sort-chip">10%</button><button class="sort-chip active">15%</button><button class="sort-chip">20%</button><button class="sort-chip">Any</button></div>
    <button class="btn btn-primary mt-lg" data-action="close-sheet toast" data-msg="Alert set">Set alert</button>`
  },
  'logout-dialog': {
    title: 'Sign out?',
    html: `<p>You'll need to sign in again to access your account.</p>
    <button class="btn btn-primary" data-nav="welcome" data-action="close-sheet">Sign out</button>
    <button class="btn btn-secondary mt-md" data-action="close-sheet">Cancel</button>`,
    center: true
  },
  'badge-unlock': {
    title: '',
    html: `<div class="celebration-icon">🥈</div>
    <h2 class="h1 text-center">Silver unlocked</h2>
    <p class="body text-center mt-md">50 price updates — keep going</p>
    <button class="btn btn-primary mt-lg" data-action="close-sheet">Continue</button>`,
    center: true
  },
};

const SCREEN_LIST = Object.keys(SCREENS);

// Reporter profile extras when role is reporter
SCREENS.profile_reporter = {
  title: 'Profile', showBack: false, showTabs: true, tab: 'profile',
  html: `<div class="profile-header">
    <div class="avatar">C</div><h2 class="h2">Chukwuemeka</h2>
    <div class="badge-row"><span class="chip chip-green">🥉 Bronze Reporter</span></div>
    <p class="caption mt-sm">42 updates · 84% to Silver</p>
    <div class="progress-bar" style="max-width:200px;margin:12px auto"><div class="progress-fill" style="width:84%"></div></div>
  </div>
  ${listItem('📋', 'My submissions', '42 updates', 'submission-history')}
  ${listItem('🏆', 'Leaderboard', '#3 this week', 'leaderboard')}
  ${listItem('📖', 'Submission guidelines', '', 'submit-guidelines')}
  ${listItem('⚙️', 'Settings', '', 'settings')}`
};
