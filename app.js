/* =============================================
   MEALPILOT — app.js  v2.0
   Updated with 2025 Nigerian market prices
   + Real food photography via Unsplash
   ============================================= */

'use strict';

/* =============================================
   MEALPILOT — Supabase Auth Module
   Project URL: https://golkwvdeuryujwfwazrf.supabase.co
   ============================================= */

// ─────────────────────────────────────────────
//  SUPABASE CONFIG
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://golkwvdeuryujwfwazrf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7iB7pbrIvwl6bq848Lrpgw_7BSbm7MR';

// Initialise client — supabase-js is loaded via CDN in index.html
const _supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Auth state (populated on page load + on auth change)
let authState = {
  user:    null,   // Supabase user object
  profile: null,   // Row from public.profiles { id, email, is_paid }
  loading: true,
};

// ─────────────────────────────────────────────
//  FETCH USER PROFILE from profiles table
// ─────────────────────────────────────────────
async function fetchProfile(userId) {
  if (!_supabase) return null;
  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('id, email, is_paid')
      .eq('id', userId)
      .single();
    if (error) {
      // Row may not exist yet — create it
      if (error.code === 'PGRST116') {
        const { data: inserted } = await _supabase
          .from('profiles')
          .insert({ id: userId, email: authState.user?.email, is_paid: false })
          .select()
          .single();
        return inserted || null;
      }
      console.error('Profile fetch error:', error.message);
      return null;
    }
    return data;
  } catch(e) {
    console.error('fetchProfile exception:', e);
    return null;
  }
}

// ─────────────────────────────────────────────
//  AUTH UI HELPERS
// ─────────────────────────────────────────────
function updateAuthUI() {
  const { user, profile } = authState;
  const headerBtn   = document.getElementById('authHeaderBtn');
  const avatarIcon  = document.getElementById('authAvatarIcon');
  const headerLabel = document.getElementById('authHeaderLabel');

  if (!headerBtn) return;

  if (user) {
    const initial = (user.email || 'U')[0].toUpperCase();
    avatarIcon.textContent = initial;
    const isPaid = profile?.is_paid === true;
    headerLabel.innerHTML = isPaid
      ? `${initial} <span class="paid-badge">PRO</span>`
      : initial;

    // Dropdown
    const dropEmail  = document.getElementById('dropdownEmail');
    const dropStatus = document.getElementById('dropdownStatus');
    if (dropEmail)  dropEmail.textContent = user.email;
    if (dropStatus) dropStatus.innerHTML  = isPaid
      ? '<span style="color:var(--green)">✅ Premium access</span>'
      : '<span style="color:var(--text-muted)">🔒 Free account</span>';
  } else {
    avatarIcon.textContent = '?';
    headerLabel.textContent = 'Sign In';
  }

  // Update healthy feature gating
  renderHealthyGate();
}

// ─────────────────────────────────────────────
//  HEALTHY FEATURE GATE (paywall logic)
// ─────────────────────────────────────────────
function renderHealthyGate() {
  const healthySec    = document.getElementById('healthyRecipeSection');
  const paywallDiv    = document.getElementById('healthyPaywall');
  const dietBar       = document.getElementById('dietFilterBar');
  const recipeGrid    = document.getElementById('healthyRecipeGrid');

  if (!healthySec || !paywallDiv) return;

  const isPaid = authState.profile?.is_paid === true;
  const isLoggedIn = !!authState.user;

  if (isPaid) {
    // Full access
    paywallDiv.classList.add('hidden');
    dietBar.classList.remove('hidden');
    recipeGrid.classList.remove('hidden');
    renderHealthyRecipes();
  } else {
    // Show paywall
    paywallDiv.classList.remove('hidden');
    dietBar.classList.add('hidden');
    recipeGrid.classList.add('hidden');

    // Update paywall button text
    const paywallBtn = document.getElementById('paywallSignInBtn');
    if (paywallBtn) {
      paywallBtn.textContent = isLoggedIn
        ? '✉️ Contact Admin for Access'
        : 'Sign In to Check Access';
    }
  }
}

// ─────────────────────────────────────────────
//  AUTH MODAL LOGIC
// ─────────────────────────────────────────────
let authMode = 'login'; // 'login' | 'signup'

function openAuthModal() {
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('authEmail').focus();
  clearAuthMessages();
}
function closeAuthModal() {
  document.getElementById('authOverlay').classList.add('hidden');
  clearAuthMessages();
}
function clearAuthMessages() {
  document.getElementById('authError').classList.add('hidden');
  document.getElementById('authSuccess').classList.add('hidden');
}
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccess');
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function handleAuthSubmit() {
  if (!_supabase) { showAuthError('Auth not available'); return; }
  const email    = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const btn      = document.getElementById('authSubmitBtn');

  if (!email || !password) { showAuthError('Please enter email and password.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  btn.disabled = true;
  btn.textContent = authMode === 'login' ? 'Signing in…' : 'Creating account…';
  clearAuthMessages();

  try {
    if (authMode === 'login') {
      const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange handles the rest
      closeAuthModal();
      showToast('Welcome back! ✓', 'success');
    } else {
      const { data, error } = await _supabase.auth.signUp({ email, password });
      if (error) throw error;
      showAuthSuccess('Account created! Check your email to confirm, then sign in.');
    }
  } catch(err) {
    showAuthError(err.message || 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
  }
}

async function handleSignOut() {
  if (!_supabase) return;
  await _supabase.auth.signOut();
  authState.user    = null;
  authState.profile = null;
  updateAuthUI();
  document.getElementById('userDropdown').classList.add('hidden');
  showToast('Signed out', 'success');
}

// ─────────────────────────────────────────────
//  INIT AUTH (called inside main init())
// ─────────────────────────────────────────────
async function initAuth() {
  if (!_supabase) {
    authState.loading = false;
    updateAuthUI();
    return;
  }

  // Wire up auth modal tabs
  document.getElementById('loginTab').addEventListener('click', () => {
    authMode = 'login';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
    document.getElementById('authSubmitBtn').textContent = 'Sign In';
    document.getElementById('authPassword').setAttribute('autocomplete','current-password');
    clearAuthMessages();
  });
  document.getElementById('signupTab').addEventListener('click', () => {
    authMode = 'signup';
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('authSubmitBtn').textContent = 'Create Account';
    document.getElementById('authPassword').setAttribute('autocomplete','new-password');
    clearAuthMessages();
  });
  document.getElementById('authSubmitBtn').addEventListener('click', handleAuthSubmit);
  document.getElementById('authPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAuthSubmit();
  });
  document.getElementById('authClose').addEventListener('click', closeAuthModal);
  document.getElementById('authSkipBtn').addEventListener('click', closeAuthModal);
  document.getElementById('authOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('authOverlay')) closeAuthModal();
  });

  // Header auth button — sign in or open dropdown
  document.getElementById('authHeaderBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (authState.user) {
      const dd = document.getElementById('userDropdown');
      dd.classList.toggle('hidden');
    } else {
      openAuthModal();
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.add('hidden');
  });

  // Dropdown sign out
  document.getElementById('dropdownSignOut').addEventListener('click', handleSignOut);

  // Paywall sign-in button
  document.getElementById('paywallSignInBtn')?.addEventListener('click', () => {
    if (authState.user) {
      showToast('Contact admin to upgrade your account', 'error');
    } else {
      openAuthModal();
    }
  });

  // Listen for auth state changes (login, logout, token refresh)
  _supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      authState.user    = session.user;
      authState.profile = await fetchProfile(session.user.id);
    } else {
      authState.user    = null;
      authState.profile = null;
    }
    authState.loading = false;
    updateAuthUI();
  });

  // Check existing session
  const { data: { session } } = await _supabase.auth.getSession();
  if (session?.user) {
    authState.user    = session.user;
    authState.profile = await fetchProfile(session.user.id);
  }
  authState.loading = false;
  updateAuthUI();
}

// ─────────────────────────────────────────────
//  CHICKEN REPUBLIC 2025 PRICE REFERENCE
//  Source: topinfo.ng / chicken-republic.com (July 2025)
//  Refuel Meal: ₦900–₦1,350
//  Citizens Meal (2pc): ₦2,000–₦2,200
//  Express Meal: ₦1,800
//  Pot Lovers (8pc + sides + drinks): ₦9,000
//
//  HOME COOKING 2025 MARKET PRICES (Lagos/Abuja)
//  Rice 50kg bag: ₦110,000–₦120,000 → ~₦2,400/kg
//  Tomatoes basket: ₦18,000 → ~₦800/cup blended
//  1 pot Jollof Rice (4 servings): ~₦8,500
//  Egusi 500g: ~₦4,500  |  Palm oil 1L: ~₦2,500
//  Chicken per kg: ~₦4,800  |  Eggs (crate 30): ₦3,800
//  Yam per tuber: ₦6,000  |  Beans 1kg: ₦2,200
//  Garri 1kg: ₦1,500  |  Indomie pack: ₦250
//  Plantain (bunch): ₦3,000  |  Bread loaf: ₦1,200
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  IMAGE MAP — exact filenames as downloaded
//  All files go inside an  images/  folder
//  next to index.html
// ─────────────────────────────────────────────
const IMAGES = {
  jollof_rice:              'images/Jollof_Rice.jpg',
  fried_rice:               'images/fried_rice.jpg',
  coconut_rice:             'images/Coconut_rice.jpg',
  white_rice_stew:          'images/White_Rice_Stew.jpeg',
  rice_beans:               'images/Rice_beans.jpg',
  jollof_spaghetti:         'images/Jollof_Spaghetti.jpg',
  egusi:                    'images/Egusi.jpg',
  okro_soup:                'images/Okro_Soup.jpg',
  vegetable_soup:           'images/Vegetable_soup.jpg',
  peppersoup:               'images/Goat_Meat_Peppersoup.jpg',
  catfish_peppersoup:       'images/Catfish_peppersoup.jpg',
  goatmeat_peppersoup:      'images/Goat_Meat_Peppersoup.jpg',
  ogbono_soup:              'images/Ogbono_soup.jpg',
  eba:                      'images/Eba.jpg',
  pounded_yam:              'images/pounded_yam.jpg',
  fufu:                     'images/Fufu.jpg',
  semo:                     'images/Semo.jpg',
  yam_egg:                  'images/yam_egg.jpg',
  akara_pap:                'images/Akara_pap.jpeg',
  pap_moi_moi:              'images/pap_moi_moi.jpeg',
  custard_moi_moi:          'images/custard_moi_moi.jpeg',
  custard_akara:            'images/custard_akara.jpeg',
  noodles:                  'images/Noodles.jpg',
  agege_bread_egg_sauce:    'images/agege_bread_egg_sauce.jpeg',
  agege_bread_ewa_agoyin:   'images/agege_bread_ewa_agoyin.jpeg',
  fried_plantain:           'images/Fried_plantain.jpg',
  boiled_plantain:          'images/Boiled_plantain.jpg',
  beans_porridge:           'images/Beans_porridge.jpg',
  fried_yam:                'images/Fried_Yam_PepperSauce.jpeg',
  fried_potato:             'images/Fried_potato.jpg',
  puff_puff:                'images/puff_puff.jpg',
  small_chops:              'images/Small_chops.jpg',
  suya:                     'images/Suya.jpg',
  yam_pottage:              'images/Yam_Pottage.jpeg',
  fried_yam_pepper_sauce:   'images/Fried_Yam_PepperSauce.jpeg',
  garri:                    'images/Garri.jpg',
  fried_chicken:            'images/Fried_chicken.jpg',
  fried_beef:               'images/Fried_beef.jpg',
  fried_turkey:             'images/Fried_turkey.jpg',
  buka_stew:                'images/Stew.jpg',
  pancake:                  'images/Pancake.jpg',
  // aliases used in RECIPES
  moi_moi:                  'images/moi_moi.jpg',
  akara:                    'images/Akara.jpg',
  pepper_soup:              'images/Pepper_soup.jpg',
  oatmeal:                  'images/Beans_porridge.jpg',
};

// ─────────────────────────────────────────────
//  DATA: NIGERIAN MEALS with 2025 prices
// ─────────────────────────────────────────────
const MEALS = [

  // ══════════════════════════════
  //  RICE
  // ══════════════════════════════
  { id:1, name:'Jollof Rice', category:'Rice', emoji:'🍚',
    img: IMAGES.jollof_rice, cost:8500, servings:4,
    note:'₦8,500 for 4 servings (≈₦2,125/person). Chicken Republic Refuel: ₦900 single',
    ingredients:['rice (1kg)','tomatoes (4)','red peppers','scotch bonnet','onion','vegetable oil','chicken (500g)','seasoning cubes','thyme','curry','bay leaf'] },

  { id:2, name:'Fried Rice', category:'Rice', emoji:'🍳',
    img: IMAGES.fried_rice, cost:10500, servings:4,
    note:'Vegetable mix + protein makes this pricier but a crowd favourite',
    ingredients:['rice (1kg)','carrot','green beans','green peas','eggs (3)','soy sauce','vegetable oil','chicken (500g)','onion','curry powder'] },

  { id:3, name:'Coconut Rice', category:'Rice', emoji:'🥥',
    img: IMAGES.coconut_rice, cost:7500, servings:4,
    note:'Coconut milk adds rich flavour. Great for special occasions',
    ingredients:['rice (1kg)','coconut milk (400ml)','tomatoes','peppers','onion','seasoning cubes','vegetable oil'] },

  { id:4, name:'White Rice and Stew', category:'Rice', emoji:'🍲',
    img: IMAGES.white_rice_stew, cost:7000, servings:4,
    note:'Everyday Nigerian staple. Easy, filling, affordable',
    ingredients:['rice (1kg)','tomatoes (5)','peppers','onion','vegetable oil','chicken (400g)','seasoning cubes'] },

  { id:5, name:'Rice and Beans', category:'Rice', emoji:'🫘',
    img: IMAGES.rice_beans, cost:4500, servings:4,
    note:'Budget king — protein-rich, very filling, super cheap',
    ingredients:['rice (500g)','honey beans (500g)','palm oil','peppers','onion','seasoning cubes'] },

  { id:6, name:'Jollof Spaghetti', category:'Rice', emoji:'🍝',
    img: IMAGES.jollof_spaghetti, cost:5500, servings:4,
    note:'Budget-friendly twist on Jollof. Chicken Republic Refuel spaghetti: ₦900',
    ingredients:['spaghetti (500g)','tomatoes','peppers','onion','vegetable oil','seasoning cubes','chicken (300g)','thyme','curry'] },

  // ══════════════════════════════
  //  SOUPS
  // ══════════════════════════════
  { id:7, name:'Egusi Soup', category:'Soups', emoji:'🥣',
    img: IMAGES.egusi, cost:12000, servings:6,
    note:'Market 2025: egusi ₦4,500 + assorted meat ₦5,000. Best made in bulk',
    ingredients:['ground egusi (500g)','spinach or bitter leaf','assorted meat (500g)','stockfish','palm oil','ground crayfish','onion','peppers','seasoning cubes'] },

  { id:8, name:'Okro Soup', category:'Soups', emoji:'🫑',
    img: IMAGES.okro_soup, cost:9500, servings:5,
    note:'Draw texture comes from finely chopped okro. Do not cover the pot',
    ingredients:['fresh okro (500g)','assorted meat (400g)','palm oil','ground crayfish','peppers','onion','seasoning cubes','stockfish'] },

  { id:9, name:'Vegetable Soup (Efo Riro)', category:'Soups', emoji:'🥬',
    img: IMAGES.vegetable_soup, cost:9500, servings:5,
    note:'Yoruba classic. Fresh tete (spinach) is affordable and very nutritious',
    ingredients:['fresh spinach or tete (500g)','assorted meat (400g)','palm oil','peppers','onion','locust beans (iru)','ground crayfish','seasoning cubes'] },

  { id:10, name:'Ogbono Soup', category:'Soups', emoji:'🫙',
    img: IMAGES.ogbono_soup, cost:9500, servings:5,
    note:'Ogbono seeds: ₦3,500–4,500 per 200g in 2025. Rich draw soup',
    ingredients:['ground ogbono seeds (200g)','spinach','assorted meat (400g)','palm oil','ground crayfish','peppers','seasoning cubes'] },

  { id:11, name:'Goat Meat Pepper Soup', category:'Soups', emoji:'🌶️',
    img: IMAGES.goatmeat_peppersoup, cost:10000, servings:4,
    note:'Goat meat: ₦6,500/kg in 2025. Best enjoyed hot as a starter or light meal',
    ingredients:['goat meat (600g)','pepper soup spice mix','uziza leaves','scotch bonnet peppers','onion','ground crayfish','seasoning cubes'] },

  { id:12, name:'Catfish Pepper Soup', category:'Soups', emoji:'🐟',
    img: IMAGES.catfish_peppersoup, cost:11500, servings:4,
    note:'Fresh catfish: ₦6,000–7,000/kg in 2025. A Lagos favourite',
    ingredients:['catfish (600g)','pepper soup spice mix','uziza leaves','scotch bonnet peppers','onion','seasoning cubes','ground crayfish'] },

  // ══════════════════════════════
  //  SWALLOWS
  // ══════════════════════════════
  { id:13, name:'Eba', category:'Swallows', emoji:'🫓',
    img: IMAGES.eba, cost:800, servings:3,
    note:'Garri 1kg: ₦1,500 in 2025. Fastest swallow to make. Pair with any soup',
    ingredients:['garri (500g)','hot water'] },

  { id:14, name:'Pounded Yam', category:'Swallows', emoji:'🍠',
    img: IMAGES.pounded_yam, cost:6000, servings:3,
    note:'Yam tuber: ₦6,000 in 2025. The king of Nigerian swallows',
    ingredients:['yam (1 medium tuber)','water','salt'] },

  { id:15, name:'Fufu (Cassava)', category:'Swallows', emoji:'⚪',
    img: IMAGES.fufu, cost:2000, servings:3,
    note:'Cassava fufu: affordable, stretchy, very filling',
    ingredients:['cassava fufu (fermented, 500g)','water'] },

  { id:16, name:'Semolina / Semo', category:'Swallows', emoji:'🌾',
    img: IMAGES.semo, cost:3000, servings:3,
    note:'Semolina (semo) 1kg: ₦2,200 in 2025. Smooth, light texture',
    ingredients:['semolina flour (500g)','hot water'] },

  { id:17, name:'Semovita', category:'Swallows', emoji:'🌾',
    img: IMAGES.semo, cost:3000, servings:3,
    note:'Semovita 1kg: ₦2,200 in 2025. Slightly coarser than semolina',
    ingredients:['semovita flour (500g)','hot water'] },

  { id:18, name:'Poundo Yam', category:'Swallows', emoji:'🍠',
    img: IMAGES.pounded_yam, cost:2500, servings:3,
    note:'Instant yam flour — convenient and affordable substitute for pounded yam',
    ingredients:['poundo yam flour (500g)','hot water'] },

  // ══════════════════════════════
  //  BREAKFAST
  // ══════════════════════════════
  { id:19, name:'Yam and Egg Sauce', category:'Breakfast', emoji:'🥚',
    img: IMAGES.yam_egg, cost:5500, servings:3,
    note:'Eggs: ₦127 each in 2025. Yam: ₦6,000/tuber. Classic and filling',
    ingredients:['yam (½ tuber)','eggs (4)','tomatoes','scotch bonnet peppers','onion','vegetable oil','seasoning cube'] },

  { id:20, name:'Akara and Pap', category:'Breakfast', emoji:'🫓',
    img: IMAGES.akara_pap, cost:2500, servings:3,
    note:'Street akara: ₦200–500. Pap (ogi) from corn: ₦1,500/kg powder',
    ingredients:['black-eyed beans peeled (2 cups)','scotch bonnet pepper','onion','vegetable oil','corn pap powder','water'] },

  { id:21, name:'Pap and Moi Moi', category:'Breakfast', emoji:'🟤',
    img: IMAGES.pap_moi_moi, cost:3500, servings:4,
    note:'Moi Moi + pap is a beloved Nigerian power breakfast',
    ingredients:['black-eyed beans peeled (3 cups)','peppers','onion','vegetable oil','eggs (2)','ground crayfish','seasoning','fish','corn pap powder'] },

  { id:22, name:'Custard and Moi Moi', category:'Breakfast', emoji:'🍮',
    img: IMAGES.custard_moi_moi, cost:3000, servings:3,
    note:'Custard powder: ₦1,500. Smooth, sweet and satisfying morning meal',
    ingredients:['custard powder (4 tbsp)','milk','sugar','hot water','moi moi (2 wraps)'] },

  { id:23, name:'Custard and Akara', category:'Breakfast', emoji:'🍮',
    img: IMAGES.custard_akara, cost:2500, servings:3,
    note:'Hot custard + crispy akara — perfect combo for a quick morning',
    ingredients:['custard powder (4 tbsp)','milk','sugar','hot water','black-eyed beans peeled (2 cups)','pepper','onion','vegetable oil'] },

  { id:24, name:'Noodles and Egg', category:'Breakfast', emoji:'🍜',
    img: IMAGES.noodles, cost:1200, servings:2,
    note:'Indomie: ₦250/pack in 2025. Budget winner — done in under 10 minutes',
    ingredients:['Indomie noodles (2 packs)','eggs (2)','carrot (sliced)','onion','scotch bonnet pepper','vegetable oil'] },

  { id:25, name:'Agege Bread and Egg Sauce', category:'Breakfast', emoji:'🍞',
    img: IMAGES.agege_bread_egg_sauce, cost:2000, servings:2,
    note:'Agege bread loaf: ₦1,200 in 2025. Lagos breakfast icon',
    ingredients:['Agege bread (half loaf)','eggs (3)','tomatoes','peppers','onion','vegetable oil'] },

  { id:26, name:'Agege Bread and Ewa Agoyin', category:'Breakfast', emoji:'🍞',
    img: IMAGES.agege_bread_ewa_agoyin, cost:2200, servings:2,
    note:'Classic Lagos street breakfast. Hot beans + fresh Agege bread',
    ingredients:['Agege bread (half loaf)','black-eyed beans peeled (1 cup)','pepper','onion','palm oil'] },

  { id:27, name:'Pancake', category:'Breakfast', emoji:'🥞',
    img: IMAGES.pancake, cost:2000, servings:3,
    note:'Simple, budget-friendly weekend breakfast for the whole family',
    ingredients:['flour (2 cups)','eggs (2)','milk','sugar','baking powder','butter','vegetable oil','vanilla extract'] },

  { id:28, name:'Fried Plantain and Egg', category:'Breakfast', emoji:'🍌',
    img: IMAGES.fried_plantain_egg, cost:2800, servings:2,
    note:'Ripe plantain: ₦500–800 each in 2025. Dodo + eggs = a full meal',
    ingredients:['ripe plantain (2)','eggs (3)','tomato','scotch bonnet pepper','onion','vegetable oil'] },

  { id:29, name:'Boiled Plantain and Egg Sauce', category:'Breakfast', emoji:'🍌',
    img: IMAGES.boiled_plantain_eggsauce, cost:2500, servings:2,
    note:'Lighter alternative to fried dodo — boil until soft and serve with sauce',
    ingredients:['unripe or half-ripe plantain (2)','eggs (3)','tomatoes','peppers','onion','vegetable oil','seasoning'] },

  { id:30, name:'Beans Porridge', category:'Breakfast', emoji:'🫘',
    img: IMAGES.beans_porridge, cost:4000, servings:4,
    note:'Add ripe plantain for natural sweetness. Very nutritious and filling',
    ingredients:['brown beans (2 cups)','palm oil','peppers','onion','ground crayfish','seasoning cubes','ripe plantain (2)'] },

  { id:31, name:'Yam Pottage (Asaro)', category:'Breakfast', emoji:'🍠',
    img: IMAGES.yam_pottage, cost:5000, servings:4,
    note:'One-pot meal — yam + palm oil + spinach. Comforting and complete',
    ingredients:['yam (½ tuber)','palm oil','peppers','onion','ground crayfish','fresh spinach','seasoning cubes'] },

  // ══════════════════════════════
  //  SNACKS
  // ══════════════════════════════
  { id:32, name:'Puff Puff', category:'Snacks', emoji:'🍩',
    img: IMAGES.puff_puff, cost:1800, servings:8,
    note:'Makes ~24 balls. Street price: ₦100–200/ball. Cheap to make at home',
    ingredients:['flour (3 cups)','sugar','instant yeast','nutmeg','warm water','salt','vegetable oil (for deep frying)'] },

  { id:33, name:'Small Chops', category:'Snacks', emoji:'🥗',
    img: IMAGES.small_chops, cost:5000, servings:6,
    note:'Party staple — spring rolls, puff puff, samosa, mini sausage rolls',
    ingredients:['spring roll pastry sheets','puff puff batter','minced meat or fish filling','samosa pastry','onion','peppers','vegetable oil (for frying)'] },

  { id:34, name:'Suya', category:'Snacks', emoji:'🍢',
    img: IMAGES.suya, cost:5000, servings:3,
    note:'Beef: ₦5,500/kg in 2025. Street suya: ₦1,500–3,000 per stick',
    ingredients:['beef (500g)','yaji (suya spice)','groundnut powder','onion','cabbage','tomatoes'] },

  { id:35, name:'Fried Yam and Pepper Sauce', category:'Snacks', emoji:'🍟',
    img: IMAGES.fried_yam_pepper_sauce, cost:3000, servings:3,
    note:'Street: ₦500–1,000 per plate in 2025. Crispy outside, soft inside',
    ingredients:['yam (½ tuber)','vegetable oil (for deep frying)','tomatoes','peppers','onion','seasoning cube'] },

  { id:36, name:'Fried Potatoes', category:'Snacks', emoji:'🍟',
    img: IMAGES.fried_potato, cost:2500, servings:3,
    note:'Irish potatoes: ₦2,000/kg in 2025. Great snack or side dish',
    ingredients:['Irish potatoes (500g)','vegetable oil','salt','pepper','seasoning'] },

  { id:37, name:'Garri and Groundnut', category:'Snacks', emoji:'🥛',
    img: IMAGES.garri, cost:800, servings:2,
    note:'Soaked garri is a beloved snack. Add milk, sugar, groundnut — done!',
    ingredients:['garri (2 cups)','cold water','groundnut (roasted)','sugar','milk (optional)','coconut (optional)'] },

  // ══════════════════════════════
  //  PROTEINS / SIDES
  // ══════════════════════════════
  { id:38, name:'Fried Chicken', category:'Proteins', emoji:'🍗',
    img: IMAGES.fried_chicken, cost:6000, servings:4,
    note:'Whole chicken: ₦6,000–8,000 in 2025. Crispy skin, juicy inside',
    ingredients:['whole chicken cut into pieces','flour','eggs (2)','curry powder','thyme','seasoning cubes','vegetable oil','garlic powder'] },

  { id:39, name:'Fried Beef', category:'Proteins', emoji:'🥩',
    img: IMAGES.fried_beef, cost:5500, servings:4,
    note:'Beef: ₦5,500/kg in 2025. Marinate overnight for best flavour',
    ingredients:['beef (500g)','onion','seasoning cubes','curry powder','thyme','vegetable oil','garlic','ginger'] },

  { id:40, name:'Fried Turkey', category:'Proteins', emoji:'🦃',
    img: IMAGES.fried_turkey, cost:9000, servings:6,
    note:'Turkey: ₦12,000–15,000 whole in 2025. Festive favourite at Christmas and parties',
    ingredients:['turkey (half, cut up)','seasoning cubes','curry powder','thyme','onion','garlic','ginger','vegetable oil'] },

  { id:41, name:'Buka Beef Stew', category:'Proteins', emoji:'🍲',
    img: IMAGES.buka_stew, cost:7500, servings:5,
    note:'Base stew for rice, yam, bread. Make in bulk and refrigerate for the week',
    ingredients:['beef (500g)','tomatoes (6)','red peppers','scotch bonnet peppers','onion','vegetable oil','seasoning cubes','curry','thyme'] },
];

// ─────────────────────────────────────────────
//  DETAILED RECIPES (30 recipes) — updated prices
// ─────────────────────────────────────────────
const RECIPES = [
  {
    id:1, mealId:1, name:'Jollof Rice', emoji:'🍚', category:'Rice',
    img: IMAGES.jollof_rice,
    cookTime:60, servings:4, cost:8500,
    ingredients:['1kg long grain rice (₦2,400)','5 large tomatoes (₦2,000)','3 red peppers','2 scotch bonnet','2 large onions (₦600)','½ cup vegetable oil (₦500)','500g chicken (₦2,400)','2 seasoning cubes','1 tsp thyme','1 tsp curry','2 bay leaves','Salt to taste'],
    steps:[
      'Season chicken with diced onion, seasoning cubes, thyme, curry, salt. Fry or grill until golden. Set aside.',
      'Blend tomatoes, peppers, and 1 onion into a smooth purée.',
      'Heat oil in a heavy pot. Fry remaining sliced onion until golden.',
      'Pour in blended tomato purée and cook on medium heat for 25 minutes, stirring regularly, until oil rises to the top.',
      'Add chicken stock (or 3 cups water), bay leaves, and remaining seasoning. Taste.',
      'Wash rice and add to the pot. Stir. Liquid should just cover the rice.',
      'Cover tightly and cook on low heat for 30 minutes. Check halfway and add a splash of water if needed.',
      'For "smoky" party rice: crank heat to high for the last 5 minutes to get a slight char at the bottom.',
      'Fluff rice, add chicken back, and serve with fried plantain or salad.',
    ]
  },
  {
    id:2, mealId:7, name:'Egusi Soup', emoji:'🥣', category:'Soups',
    img: IMAGES.egusi,
    cookTime:50, servings:6, cost:12000,
    ingredients:['500g ground egusi (₦4,500)','500g assorted meat (₦5,000)','150g stockfish (₦1,500)','3 tbsp palm oil (₦750)','2 tbsp ground crayfish (₦800)','1 large onion','3–4 scotch bonnet peppers','2 cups washed bitter leaf or spinach','2 seasoning cubes','Salt to taste'],
    steps:[
      'Cook assorted meat and stockfish with half the onion, salt, and 1 seasoning cube until tender. Reserve stock.',
      'Mix egusi with a little water to form a thick paste. Season lightly.',
      'Heat palm oil in a pot. Fry sliced onion and blended peppers for 10 minutes until fragrant.',
      'Add egusi paste in lumps — do not stir yet. Fry for 5–8 minutes until slightly dry and golden.',
      'Pour in meat stock (add water if needed). Add meat, stockfish, crayfish, and remaining seasoning.',
      'Simmer on medium heat for 15 minutes. Taste and adjust salt.',
      'Add washed bitter leaf or spinach. Stir and cook for 5 more minutes.',
      'Serve hot with eba, pounded yam, or any swallow of choice.',
    ]
  },
  {
    id:3, mealId:20, name:'Akara (Bean Cakes)', emoji:'🫓', category:'Breakfast',
    img: IMAGES.akara,
    cookTime:30, servings:5, cost:2500,
    ingredients:['2 cups black-eyed beans — peeled (₦1,800)','1 medium onion (₦200)','2 scotch bonnet peppers','1 tsp salt','Vegetable oil for deep frying (₦500)'],
    steps:[
      'Soak beans in water for 30 minutes, then rub between palms to remove the skin. Rinse several times until clean.',
      'Blend beans with onion, peppers, and minimal water into a smooth, thick batter.',
      'Whisk batter vigorously for 5 minutes to incorporate air — this is the key to fluffy akara.',
      'Heat vegetable oil in a deep pot to 180°C (a drop of batter should sizzle immediately).',
      'Scoop batter with a spoon and carefully lower into hot oil. Fry in batches for 3–4 minutes, turning once, until golden brown.',
      'Drain on paper towels. Serve hot with pap (ogi) or as a street snack.',
    ]
  },
  {
    id:4, mealId:21, name:'Moi Moi', emoji:'🟤', category:'Breakfast',
    img: IMAGES.pap_moi_moi,
    cookTime:60, servings:6, cost:3500,
    ingredients:['3 cups black-eyed beans peeled (₦2,200)','3 red bell peppers (₦800)','2 scotch bonnet peppers','1 large onion','¼ cup vegetable oil (₦400)','2 hard-boiled eggs (₦260)','100g fish fillet (₦600)','2 tsp ground crayfish','2 seasoning cubes','Salt to taste'],
    steps:[
      'Peel beans by soaking and rubbing off skins. Blend smooth with peppers and onion using very little water.',
      'Transfer to a bowl. Add oil, crayfish, seasoning cubes, and salt. Mix well.',
      'Pour batter into greased aluminium foil cups or banana leaves. Add egg slices and fish pieces.',
      'Fold or seal the cups tightly.',
      'Arrange in a pot, add water to come halfway up the cups. Cover pot tightly.',
      'Steam on medium heat for 45–50 minutes until set. Test with a toothpick — it should come out clean.',
      'Cool slightly before unwrapping. Serve as a side dish or breakfast protein.',
    ]
  },
  {
    id:5, mealId:9, name:'Efo Riro', emoji:'🥬', category:'Soups',
    img: IMAGES.vegetable_soup,
    cookTime:45, servings:5, cost:9500,
    ingredients:['500g fresh spinach / tete (₦1,500)','400g assorted meat (₦4,000)','3 tbsp palm oil (₦750)','2 red bell peppers (₦600)','3 scotch bonnet peppers','1 large onion','2 tbsp locust beans (iru) (₦600)','2 tbsp ground crayfish (₦800)','2 seasoning cubes','Salt to taste'],
    steps:[
      'Cook assorted meat with onion, salt, and 1 seasoning cube until tender. Set aside.',
      'Blend bell peppers and scotch bonnets. Set aside.',
      'Heat palm oil in a wide pot. Add sliced onion and locust beans, fry for 3 minutes.',
      'Pour in blended peppers. Fry on medium-high heat for 15–20 minutes, stirring often, until sauce is thick and oil floats.',
      'Add cooked meat and a little stock. Stir in crayfish and remaining seasoning. Taste.',
      'Simmer 5 minutes, then add washed spinach.',
      'Stir gently and cook for only 3–5 minutes. Do not overcook — spinach should stay bright green.',
      'Serve with any swallow, eba, or steamed rice.',
    ]
  },
  {
    id:6, mealId:19, name:'Yam and Egg Sauce', emoji:'🥚', category:'Breakfast',
    img: IMAGES.yam_egg,
    cookTime:30, servings:3, cost:5500,
    ingredients:['½ yam tuber (₦3,000)','4 large eggs (₦500)','2 ripe tomatoes (₦600)','2 scotch bonnet peppers','1 medium onion (₦200)','3 tbsp vegetable oil (₦300)','1 seasoning cube','Salt to taste','Spring onions for garnish'],
    steps:[
      'Peel and cut yam into thick slices. Boil in salted water for 15–20 minutes until fork-tender. Drain.',
      'Dice tomatoes, onion, and slice peppers.',
      'Heat oil in a pan. Sauté onion until translucent, about 2 minutes.',
      'Add tomatoes and peppers. Cook on medium heat for 5–7 minutes, stirring, until slightly reduced.',
      'Break eggs into the sauce. Scramble gently or let them set — your preference.',
      'Add seasoning cube and salt. Stir and remove from heat.',
      'Serve egg sauce over hot boiled yam slices. Garnish with spring onions.',
    ]
  },
  {
    id:7, mealId:31, name:'Yam Pottage (Asaro)', emoji:'🍠', category:'Breakfast',
    img: IMAGES.yam_pottage,
    cookTime:40, servings:4, cost:5000,
    ingredients:['½ tuber yam (₦3,000)','3 tbsp palm oil (₦750)','2 ripe tomatoes (₦600)','2 scotch bonnet peppers','1 large onion (₦200)','2 tbsp ground crayfish (₦600)','A handful of spinach','2 seasoning cubes','Salt to taste'],
    steps:[
      'Peel and cut yam into medium chunks. Rinse well.',
      'Place yam in a pot, add water to cover, and boil for 10 minutes.',
      'Add palm oil, blended tomatoes and peppers, sliced onion, crayfish, and seasoning. Stir.',
      'Continue cooking on medium heat for 15–20 minutes until yam is very soft.',
      'Mash a few yam pieces with a wooden spoon to thicken the pottage. Leave others chunky.',
      'Add spinach, stir, and cook for 2 more minutes.',
      'Taste, adjust salt and serve hot.',
    ]
  },
  {
    id:8, mealId:5, name:'Rice and Beans', emoji:'🫘', category:'Rice',
    img: IMAGES.rice_beans,
    cookTime:60, servings:4, cost:4500,
    ingredients:['500g long grain rice (₦1,200)','500g honey beans oloyin (₦1,100)','2 tbsp palm oil (₦500)','2 scotch bonnet peppers','1 large onion (₦200)','1 seasoning cube','Salt to taste'],
    steps:[
      'Sort and wash beans. Boil for 20 minutes, drain and rinse (this reduces gas-causing compounds).',
      'Return beans to pot with fresh water. Cook until almost soft, about 20 minutes.',
      'Add washed rice to the beans. Add enough water to come 2cm above the mixture.',
      'Add palm oil, sliced onion, peppers, seasoning, and salt.',
      'Stir, cover, and cook on low-medium heat for 25–30 minutes until both are fully cooked.',
      'Stir gently. Serve with fried plantain or any protein of choice.',
    ]
  },
  {
    id:9, mealId:30, name:'Beans Porridge with Plantain', emoji:'🫘', category:'Breakfast',
    img: IMAGES.beans_porridge_fried_plantain,
    cookTime:50, servings:4, cost:4000,
    ingredients:['2 cups brown beans (₦2,200)','2 tbsp palm oil (₦500)','2 ripe plantains (₦1,000)','2 scotch bonnet peppers','1 large onion (₦200)','2 tbsp ground crayfish (₦600)','2 seasoning cubes','Salt to taste','Smoked fish optional (₦800)'],
    steps:[
      'Sort and wash beans. Boil for 5 minutes, discard water, and add fresh water to cook until soft.',
      'When beans is almost done, add palm oil, blended peppers, sliced onion, crayfish, and seasoning.',
      'Add smoked fish if using. Stir and continue cooking for 15 minutes.',
      'Peel plantains, cut diagonally, and add to the pot.',
      'Cook for another 10 minutes until plantain is soft and porridge has thickened.',
      'Mash a few beans for creaminess. Taste and serve.',
    ]
  },
  {
    id:10, mealId:32, name:'Puff Puff', emoji:'🍩', category:'Snacks',
    img: IMAGES.puff_puff,
    cookTime:35, servings:8, cost:1800,
    ingredients:['3 cups plain flour (₦600)','2 tsp instant yeast (₦200)','½ cup sugar (₦200)','½ tsp nutmeg','1½ cups warm water','1 tsp salt','Vegetable oil for deep frying (₦500)'],
    steps:[
      'Mix flour, yeast, sugar, nutmeg, and salt in a bowl.',
      'Gradually add warm water and mix until you have a smooth, thick batter.',
      'Cover with a damp cloth and leave in a warm spot for 45 minutes–1 hour until doubled in size.',
      'Heat oil in a deep pot to 175°C.',
      'Use a spoon or wet hand to scoop batter and drop round balls into hot oil.',
      'Fry in batches for 3–4 minutes, turning regularly, until golden brown.',
      'Drain on paper towels. Enjoy warm. Optionally dust with icing sugar.',
    ]
  },
  {
    id:11, mealId:2, name:'Nigerian Fried Rice', emoji:'🍳', category:'Rice',
    img: IMAGES.fried_rice,
    cookTime:50, servings:4, cost:10500,
    ingredients:['1kg parboiled rice (₦2,400)','Mixed vegetables carrot, green beans, peas (₦1,500)','3 eggs (₦380)','300g chicken (₦1,440)','2 tbsp soy sauce (₦400)','1 tsp curry powder','1 large onion','3 tbsp vegetable oil (₦300)','Seasoning, salt, white pepper'],
    steps:[
      'Parboil rice until half-done, drain and spread to cool.',
      'Season chicken and stir-fry in 1 tbsp oil until cooked. Remove and set aside.',
      'In the same pot, scramble eggs in 1 tbsp oil. Push to the side.',
      'Add remaining oil, sauté onion, add carrots and green beans, fry for 3 minutes.',
      'Add rice to the pot. Mix everything together.',
      'Add soy sauce, curry powder, seasoning, salt, and pepper. Toss well.',
      'Add peas and protein. Stir-fry on high heat for 5 minutes until well combined.',
      'Serve with fried chicken, coleslaw, or moin moin.',
    ]
  },
  {
    id:12, mealId:9, name:'Afang Soup', emoji:'🌱', category:'Soups',
    img: IMAGES.afang_soup,
    cookTime:50, servings:5, cost:13000,
    ingredients:['400g afang leaves sliced thin (₦3,500)','400g waterleaf (₦1,000)','400g assorted meat (₦4,000)','200g periwinkle (₦1,500)','3 tbsp palm oil (₦750)','3 tbsp ground crayfish (₦1,000)','Stockfish and smoked fish (₦1,500)','Seasoning cubes, peppers, salt'],
    steps:[
      'Cook assorted meat and stockfish with seasoning until tender. Reserve stock.',
      'Rinse waterleaf and squeeze out excess water.',
      'Heat palm oil in a pot. Add blended peppers and cook for 5 minutes.',
      'Add meat, smoked fish, stockfish, crayfish, and remaining seasoning. Stir.',
      'Add periwinkle and a little stock. Cook 5 minutes.',
      'Add waterleaf, stir and cook for 3 minutes.',
      'Add the sliced afang leaves (do not cover pot). Stir and cook for exactly 5 minutes.',
      'Taste, adjust, and serve with any swallow.',
    ]
  },
  {
    id:13, mealId:34, name:'Suya', emoji:'🍢', category:'Snacks',
    img: IMAGES.suya,
    cookTime:30, servings:3, cost:5000,
    ingredients:['500g beef sirloin or rump (₦2,750)','4 tbsp ground groundnut (₦500)','2 tbsp yaji suya spice (₦400)','1 tsp ginger powder','1 tsp garlic powder','1 tsp paprika','Salt to taste','Sliced tomatoes, onions, cabbage to serve (₦500)'],
    steps:[
      'Slice beef very thin — about 3–4mm thick.',
      'Mix groundnut, yaji, ginger, garlic, paprika, and salt.',
      'Coat each beef slice thoroughly with the spice mixture.',
      'Thread onto skewers or lay flat on a wire rack.',
      'Grill on a charcoal or gas grill at high heat for 5–6 minutes per side.',
      'Brush with groundnut oil halfway through for shine and flavour.',
      'Serve with fresh sliced onions, tomatoes, and cabbage.',
    ]
  },
  {
    id:14, mealId:11, name:'Goat Pepper Soup', emoji:'🌶️', category:'Soups',
    img: IMAGES.goatmeat_peppersoup,
    cookTime:55, servings:4, cost:10000,
    ingredients:['600g goat meat (₦3,900)','2 tbsp pepper soup spice mix (₦500)','2 scotch bonnet peppers','1 medium onion (₦200)','A handful of uziza leaves (₦500)','2 seasoning cubes (₦100)','2 tbsp ground crayfish (₦800)','Salt to taste'],
    steps:[
      'Wash goat meat thoroughly. Place in a pot.',
      'Add sliced onion, seasoning cubes, salt, and half the pepper soup spice. Mix and steam 10 minutes.',
      'Add 4–5 cups of water. Cook on medium-high for 25 minutes until almost tender.',
      'Add blended scotch bonnets, crayfish, and remaining pepper soup spice.',
      'Continue cooking for 10 minutes. Taste and adjust seasoning.',
      'Add sliced uziza leaves. Cook 3 more minutes.',
      'Serve hot in bowls. Best with boiled yam or alone as is.',
    ]
  },
  {
    id:15, mealId:37, name:'Garri and Groundnut', emoji:'🥛', category:'Snacks',
    img: IMAGES.garri,
    cookTime:5, servings:2, cost:800,
    ingredients:['2 cups garri (₦300)','cold water','100g roasted groundnut (₦300)','sugar to taste','milk optional','coconut optional'],
    steps:[
      'Pour garri into a bowl.',
      'Add cold water until the garri is just soaked but not too watery.',
      'Add roasted groundnut, sugar, and milk if desired.',
      'Mix lightly and enjoy immediately as a refreshing snack.',
    ]
  },
  {
    id:16, mealId:6, name:'Ofada Rice and Ayamase Stew', emoji:'🌿', category:'Rice',
    img: IMAGES.ofada_rice_ayamase,
    cookTime:60, servings:3, cost:9500,
    ingredients:['1kg ofada rice (₦3,500)','400g assorted meat (₦4,000)','3 red bell peppers (₦900)','5 tatashe peppers','5 scotch bonnet peppers','3 tbsp palm oil (₦750)','3 tbsp locust beans (₦600)','Seasoning, crayfish, salt'],
    steps:[
      'Wash ofada rice thoroughly (it stays slightly earthy). Cook until tender, drain.',
      'Cook assorted meat with seasoning and onion. Reserve stock.',
      'Dry-roast tatashe and scotch bonnet peppers in a hot pan until slightly charred.',
      'Blend the roasted peppers roughly — keep some texture.',
      'Heat palm oil until very hot. Add locust beans, fry 1 minute.',
      'Pour in blended peppers. Fry on medium-high for 20–25 minutes, stirring constantly.',
      'Add cooked meat and a little stock. Season, add crayfish. Cook 10 more minutes.',
      'Serve ofada rice wrapped in banana leaf with stew.',
    ]
  },
  {
    id:17, mealId:3, name:'Coconut Rice', emoji:'🥥', category:'Rice',
    img: IMAGES.coconut_rice,
    cookTime:40, servings:4, cost:7500,
    ingredients:['1kg rice (₦2,400)','400ml coconut milk (₦2,000)','2 cups water','2 tomatoes (₦600)','2 peppers','1 onion (₦200)','2 tbsp vegetable oil','Seasoning, salt','Chicken or prawns optional (₦2,000)'],
    steps:[
      'Wash and drain rice.',
      'Heat oil, sauté sliced onion until soft.',
      'Add blended tomatoes and peppers. Fry 8 minutes.',
      'Add coconut milk, water, seasoning, and salt. Bring to a boil.',
      'Add rice. Stir once and cover tightly. Cook on low-medium for 25–30 minutes.',
      'Stir-fry protein separately and add in last 5 minutes if using.',
      'Fluff gently and serve with coleslaw or fried plantain.',
    ]
  },
  {
    id:18, mealId:8, name:'Okra Soup', emoji:'🫑', category:'Soups',
    img: IMAGES.okro_soup,
    cookTime:40, servings:5, cost:9500,
    ingredients:['500g fresh okra (₦2,500)','400g assorted meat (₦4,000)','100g stockfish (₦1,000)','3 tbsp palm oil (₦750)','2 tbsp ground crayfish (₦800)','2 scotch bonnet peppers','1 onion (₦200)','Seasoning cubes, salt'],
    steps:[
      'Cook meat and stockfish with seasoning and onion until tender. Reserve stock.',
      'Wash okra and chop very finely (or blend roughly) for draw soup texture.',
      'Heat palm oil in a pot. Add blended peppers and fry for 5 minutes.',
      'Add meat, stockfish, crayfish, and enough stock. Bring to a boil.',
      'Add okra and stir vigorously. Do not cover pot.',
      'Cook on medium heat for 8–10 minutes, stirring often.',
      'Taste and adjust. Serve with any swallow.',
    ]
  },
  {
    id:19, mealId:6, name:'Spaghetti Jollof', emoji:'🍝', category:'Rice',
    img: IMAGES.jollof_spaghetti,
    cookTime:35, servings:4, cost:5500,
    ingredients:['500g spaghetti (₦1,200)','4 tomatoes (₦1,600)','3 peppers','1 large onion (₦200)','¼ cup vegetable oil (₦250)','1 tsp thyme','1 tsp curry','2 seasoning cubes','Salt to taste','Chicken 300g optional (₦1,440)'],
    steps:[
      'Boil spaghetti for 5 minutes (half-cooked). Drain and set aside.',
      'Blend tomatoes, peppers, and half the onion.',
      'Heat oil, fry remaining sliced onion. Add tomato blend and cook 15 minutes until reduced.',
      'Add thyme, curry, seasoning, and a cup of water. Taste.',
      'Add spaghetti. Toss to coat fully. Cook on low heat 10–12 minutes, stirring occasionally.',
      'Serve hot with fried plantain or protein.',
    ]
  },
  {
    id:20, mealId:24, name:'Noodles and Egg', emoji:'🍜', category:'Breakfast',
    img: IMAGES.noodles,
    cookTime:15, servings:2, cost:1200,
    ingredients:['2 packs Indomie noodles (₦500)','2 eggs (₦260)','1 carrot sliced (₦100)','1 onion (₦100)','1 pepper','2 tbsp vegetable oil (₦200)','Salt to taste'],
    steps:[
      'Boil noodles for 2–3 minutes until half-done. Drain and set aside.',
      'Heat oil in a pan. Sauté onion and pepper for 1 minute.',
      'Add carrot slices. Stir-fry 2 minutes.',
      'Break eggs into the pan and scramble.',
      'Add drained noodles, seasoning from the packet, and salt.',
      'Toss everything together for 2 minutes on medium heat.',
      'Serve immediately while hot.',
    ]
  },
  {
    id:21, mealId:28, name:'Fried Plantain and Egg', emoji:'🍌', category:'Breakfast',
    img: IMAGES.fried_plantain_egg,
    cookTime:20, servings:2, cost:2800,
    ingredients:['2 ripe plantains (₦1,000)','3 eggs (₦380)','1 tomato (₦300)','1 pepper','1 small onion (₦150)','2 tbsp vegetable oil (₦200)','Salt to taste'],
    steps:[
      'Peel plantains and slice diagonally.',
      'Heat 1 tbsp oil. Fry plantain slices on both sides until golden brown. Set aside.',
      'In the same pan, add remaining oil. Sauté onion, diced tomato and pepper for 2 minutes.',
      'Break in eggs and scramble to desired consistency.',
      'Season with salt. Serve egg sauce alongside fried plantain.',
    ]
  },
  {
    id:22, mealId:29, name:'Boiled Plantain and Egg Sauce', emoji:'🍌', category:'Breakfast',
    img: IMAGES.boiled_plantain,
    cookTime:20, servings:2, cost:2500,
    ingredients:['2 unripe or half-ripe plantains (₦800)','3 eggs (₦380)','1 tomato (₦300)','1 pepper','1 small onion (₦150)','2 tbsp vegetable oil (₦200)','Seasoning, salt'],
    steps:[
      'Peel plantains, cut into chunks, and boil in salted water for 15–20 minutes until soft.',
      'Heat oil in a pan. Sauté onion, tomato and pepper for 2–3 minutes.',
      'Break in eggs, scramble or set as desired. Season with salt.',
      'Serve egg sauce over boiled plantain.',
    ]
  },
  {
    id:23, mealId:14, name:'Amala and Ewedu', emoji:'🌿', category:'Swallows',
    img: IMAGES.amala_ewedu,
    cookTime:30, servings:3, cost:7000,
    ingredients:['2 cups plantain flour elubo (₦2,000)','3 cups water for amala','300g jute leaves ewedu (₦800)','2 tbsp palm oil (₦500)','1 tbsp ground crayfish (₦500)','Beef stew and gbegiri (₦2,500)','Seasoning, salt'],
    steps:[
      'Boil water in a pot. Gradually pour plantain flour while stirring vigorously to avoid lumps.',
      'Stir on low heat for 8–10 minutes until smooth and stretchy. Cover to keep warm.',
      'Wash jute leaves and blend or use a traditional broom (ijabe) to break down the texture.',
      'In a small pot, add blended ewedu with water, peppers, crayfish, and seasoning.',
      'Cook on medium heat for 10 minutes, stirring regularly. Add palm oil.',
      'Serve amala with ewedu and beef stew (and gbegiri/bean soup if available).',
    ]
  },
  {
    id:24, mealId:39, name:'Fried Beef', emoji:'🥩', category:'Proteins',
    img: IMAGES.fried_beef,
    cookTime:40, servings:4, cost:5500,
    ingredients:['500g beef (₦2,750)','1 onion (₦200)','2 seasoning cubes','1 tsp curry powder','1 tsp thyme','Vegetable oil for frying (₦500)','Garlic and ginger (₦300)'],
    steps:[
      'Wash and cut beef into chunks.',
      'Season with onion, garlic, ginger, curry, thyme, seasoning cubes, and salt.',
      'Steam for 15 minutes in a covered pot.',
      'Heat oil and deep-fry beef in batches until golden brown and slightly crispy.',
      'Drain on paper towels. Serve as a side protein.',
    ]
  },
  {
    id:25, mealId:12, name:'Catfish Pepper Soup', emoji:'🐟', category:'Soups',
    img: IMAGES.catfish_peppersoup,
    cookTime:35, servings:4, cost:11500,
    ingredients:['600g catfish (₦4,200)','2 tbsp pepper soup spice mix (₦500)','2 scotch bonnet peppers','1 medium onion (₦200)','Uziza leaves (₦500)','2 seasoning cubes','2 tbsp ground crayfish (₦800)','Salt to taste'],
    steps:[
      'Clean catfish thoroughly with alum or lemon to remove slime.',
      'Place in a pot with onion, half the pepper soup spice, seasoning, and salt.',
      'Add 4 cups of water. Bring to a boil.',
      'Add blended scotch bonnets, crayfish, and remaining spice.',
      'Simmer for 15–18 minutes. Do not over-stir to keep fish intact.',
      'Add sliced uziza leaves. Cook 3 more minutes.',
      'Serve hot. Best enjoyed fresh.',
    ]
  },
  {
    id:26, mealId:4, name:'White Rice and Tomato Stew', emoji:'🍲', category:'Rice',
    img: IMAGES.white_rice_stew,
    cookTime:45, servings:4, cost:7000,
    ingredients:['1kg long grain rice (₦2,400)','5 tomatoes (₦2,000)','3 peppers','1 large onion (₦200)','¼ cup vegetable oil (₦250)','500g chicken (₦2,400)','Seasoning, curry, salt'],
    steps:[
      'Wash and cook rice with salted water until done. Drain and set aside.',
      'Season and fry or grill chicken. Set aside.',
      'Blend tomatoes, peppers, and half the onion.',
      'Heat oil, fry sliced onion until golden.',
      'Add tomato blend. Cook on medium heat 20–25 minutes until oil floats to the top.',
      'Add chicken and stock. Simmer 10 minutes. Taste and adjust.',
      'Serve stew poured over rice with a side of fried plantain.',
    ]
  },
  {
    id:27, mealId:10, name:'Ogbono Soup', emoji:'🫙', category:'Soups',
    img: IMAGES.ogbono_soup,
    cookTime:45, servings:5, cost:9500,
    ingredients:['200g ground ogbono seeds (₦4,000)','500g assorted meat (₦5,000)','3 tbsp palm oil (₦750)','2 tbsp crayfish (₦800)','3 peppers','1 onion','Spinach or bitter leaf (₦800)','Seasoning, salt'],
    steps:[
      'Cook assorted meat until tender. Reserve stock.',
      'Heat palm oil in pot on medium heat.',
      'Add ground ogbono directly to the oil. Stir quickly — it will form strings and become fragrant.',
      'Add hot meat stock gradually, stirring constantly to keep it smooth.',
      'Add meat, crayfish, blended peppers, and seasoning. Stir.',
      'Cook on low-medium heat for 15 minutes, stirring regularly.',
      'Add spinach or bitter leaf. Cook 3–5 more minutes. Serve with any swallow.',
    ]
  },
  {
    id:28, mealId:14, name:'Pounded Yam and Egusi', emoji:'🍠', category:'Swallows',
    img: IMAGES.pounded_yam_egusi,
    cookTime:60, servings:3, cost:10500,
    ingredients:['1 tuber yam (₦6,000)','300g ground egusi (₦2,700)','Assorted meat 300g (₦3,000)','3 tbsp palm oil (₦750)','Crayfish, peppers, seasoning (₦1,200)'],
    steps:[
      'Peel and cut yam into chunks. Boil in salted water until very soft, about 25–30 minutes.',
      'Drain water completely. Pound in a mortar until smooth and stretchy with no lumps. Or blend in a food processor.',
      'Keep hot and moist. Mold into balls for serving.',
      'For egusi: heat palm oil, fry blended peppers, add egusi paste, meat, crayfish, and stock.',
      'Cook egusi for 20–25 minutes until oil floats. Add vegetables and simmer 5 minutes.',
      'Serve pounded yam alongside the egusi soup.',
    ]
  },
  {
    id:29, mealId:27, name:'Pancake', emoji:'🥞', category:'Breakfast',
    img: IMAGES.pancake,
    cookTime:20, servings:3, cost:2000,
    ingredients:['2 cups flour (₦400)','2 eggs (₦260)','1 cup milk (₦300)','2 tbsp sugar (₦100)','1 tsp baking powder','1 tbsp butter (₦200)','Vegetable oil','Vanilla extract'],
    steps:[
      'Mix flour, sugar, and baking powder in a bowl.',
      'In another bowl, whisk eggs, milk, melted butter, and vanilla.',
      'Combine wet and dry ingredients. Mix until just smooth — do not over-mix.',
      'Heat a non-stick pan on medium. Lightly grease with oil or butter.',
      'Pour a ladleful of batter. Cook until bubbles form on top, about 2 minutes.',
      'Flip and cook 1 more minute until golden.',
      'Serve with honey, jam, or sliced bananas.',
    ]
  },
  {
    id:30, mealId:35, name:'Fried Yam and Pepper Sauce', emoji:'🍟', category:'Snacks',
    img: IMAGES.fried_yam_pepper_sauce,
    cookTime:25, servings:3, cost:3000,
    ingredients:['½ tuber yam (₦3,000)','Vegetable oil for frying (₦500)','2 tomatoes (₦600)','3 peppers','1 onion (₦200)','Seasoning, salt'],
    steps:[
      'Peel yam and cut into thick sticks or slices.',
      'Rinse and pat dry with a paper towel.',
      'Heat oil in a deep pan. Fry yam in batches until golden and crispy — about 8 minutes.',
      'For pepper sauce: blend and fry tomatoes, peppers, and onion in a little oil for 10 minutes.',
      'Season sauce with seasoning cube and salt.',
      'Drain yam on paper towels. Serve hot with dipping sauce.',
    ]
  },
];

// ─────────────────────────────────────────────
//  FOOD TIPS  (updated with 2025 prices)
// ─────────────────────────────────────────────
const FOOD_TIPS = [
  '💧 Parboil rice before Jollof — this gives you the "party rice" texture. The SBM Jollof Index (2025) puts one pot of jollof at ₦25,486 — make it count!',
  '🧅 Always fry your tomato stew until the oil separates and floats — roughly 20–25 minutes. This means the stew is properly cooked and will last longer.',
  '🌿 Add leafy vegetables (efo, bitter leaf, uziza) last and only cook for 3–5 minutes. This preserves colour, nutrients, and flavour.',
  '💰 Tomatoes basket hit ₦18,000 in 2025. Buy in season, blend in bulk, and freeze in ice cube trays — each cube = 1 soup portion.',
  '🐟 Stockfish adds deep umami flavour to soups at a much lower cost than fresh fish. Soak overnight before cooking.',
  '🌴 At current prices, palm oil is ₦2,500+ per litre. Buy 10L from the market directly — you save up to 30% vs sachet purchases.',
  '🍌 For the sweetest fried plantain, the skin must have dark patches — the darker the skin, the sweeter the plantain.',
  '🧆 Whisking akara batter vigorously for 5 minutes before frying incorporates air for a light, fluffy result. This is the secret every Lagos aunty knows.',
  '📦 Indomie noodles are ₦250/pack in 2025. Add eggs (₦127 each), carrot, and onion for a complete ₦600 meal for two.',
  '🫘 Soaking beans for 2 hours before cooking reduces cook time by 40% and reduces gas-causing compounds.',
  '🔥 For smoky Jollof Rice (party-style), crank up the heat in the final 5 minutes. Let it catch slightly at the bottom — Nigerians call this "party rice".',
  '🍳 Save leftover frying oil — it picks up flavour from plantain or chicken and makes your next stew even better.',
  '💡 Chicken Republic\'s Refuel Meal (₦1,350 in 2025) is the benchmark for what a single home-cooked meal should cost. Beat it by cooking a full pot!',
  '🌽 Roasted corn is cheapest June–September (harvest season). A cob on the street: ₦400–800 in 2025.',
  '🍠 One yam tuber costs ₦6,000 in 2025. Cut into thirds: Breakfast is asaro, lunch is yam and egg, dinner is pottage — three meals, one tuber.',
  '🥚 A crate of 30 eggs is ₦3,800 in 2025 (≈₦127 per egg). Eggs are your most affordable complete protein — use them daily.',
  '🛒 Plan meals on Sunday, shop Monday when markets are freshest. Compare: open market is 30–50% cheaper than supermarkets for the same ingredients.',
  '🍲 Egusi or Ogbono soup made in bulk lasts 3–4 days in the fridge and 3 months in the freezer. Cook once, eat many times.',
  '🌶️ Scotch bonnet freezes whole beautifully. Buy a big bag at market price (₦2,000–₦3,000) and freeze for months of use.',
  '💸 In 2025, feeding an adult in Lagos on a budget costs approx ₦1,200–₦1,500/day cooking at home vs ₦2,000–₦4,000 eating out daily.',
];

// ─────────────────────────────────────────────
//  CHICKEN REPUBLIC REFERENCE PRICES (2025)
// ─────────────────────────────────────────────
const CR_PRICES = {
  'Refuel Meal (1pc chicken + rice)': 900,
  'Refuel Max Meal (+ coleslaw/moin moin + drink)': 1350,
  'Refuel Dodo Meal (chicken + rice + plantain)': 1200,
  'Refuel Dodo Max (+ drink)': 1350,
  'Citizens Meal (2pc + rice + drink)': 2000,
  'Citizens Meal with Chips': 2200,
  'Express Meal (chicken + chips + drink)': 1800,
  'ChickWhizz (sandwich)': 1400,
  'Chief Burger': 1900,
  'Chief Burger Meal (+ chips + drink)': 3100,
  'Pot Lovers (8pc + 4 rice + sides + drinks)': 9000,
  'Mega Pot Lovers (10pc + 6 rice + sides + drinks)': 12000,
  'Big Crew Meal (full rotisserie + 4 rice + sides + drinks)': 9500,
};

// ─────────────────────────────────────────────
//  INGREDIENT → CATEGORY MAP
// ─────────────────────────────────────────────
const INGREDIENT_CATS = {
  Proteins: ['chicken','beef','goat meat','fish','catfish','shrimp','eggs','stockfish','smoked fish','assorted meat','ponmo','tripe','cow foot','periwinkle','crayfish','dried crayfish','kilishi'],
  Vegetables: ['tomatoes','peppers','onion','scotch bonnet','spinach','bitter leaf','okra','carrot','green beans','garden egg','ugwu','efo','waterleaf','afang leaves','jute leaves','utazi','uziza','ugba','ewedu','tatashe','cabbage'],
  Grains: ['rice','spaghetti','noodles','indomie','beans','garri','fufu','yam','plantain','wheat meal','semovita','flour','oats','corn','abacha','cassava','breadfruit'],
  Seasonings: ['salt','seasoning cubes','maggi','curry powder','thyme','bay leaf','pepper soup spice','yaji','banga spice','potash','locust beans','nutmeg','cinnamon','soy sauce','tomato paste'],
  Oils: ['palm oil','vegetable oil','coconut milk','butter','groundnut oil'],
  Others: ['water','sugar','milk','groundnut','coconut','honey','yeast','ginger','garlic'],
};

// ─────────────────────────────────────────────
//  DAYS / MEAL TIMES
// ─────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TIMES = ['breakfast','lunch','dinner'];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let state = {
  plan: {},
  favourites: new Set(),
  expenses: [],
  monthlyBudgetGoal: 0,
  darkMode: false,
  tipIndex: 0,
  recentRecipes: [],
  savedShoppingPlans: [],   // Feature 1: saved market shopping plans
  dietFilter: 'all',        // Feature 2: active diet filter
};

// ─────────────────────────────────────────────
//  LOCAL STORAGE
// ─────────────────────────────────────────────
function saveState() {
  const toSave = {
    plan: state.plan, favourites: [...state.favourites], expenses: state.expenses,
    monthlyBudgetGoal: state.monthlyBudgetGoal, darkMode: state.darkMode,
    tipIndex: state.tipIndex, recentRecipes: state.recentRecipes,
    savedShoppingPlans: state.savedShoppingPlans, dietFilter: state.dietFilter,
  };
  localStorage.setItem('mealpilot_v2', JSON.stringify(toSave));
}

function loadState() {
  const raw = localStorage.getItem('mealpilot_v2') || localStorage.getItem('mealpilot');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state.plan = saved.plan || {};
    state.favourites = new Set(saved.favourites || []);
    state.expenses = saved.expenses || [];
    state.monthlyBudgetGoal = saved.monthlyBudgetGoal || 0;
    state.darkMode = saved.darkMode || false;
    state.tipIndex = saved.tipIndex || 0;
    state.recentRecipes = saved.recentRecipes || [];
    state.savedShoppingPlans = saved.savedShoppingPlans || [];
    state.dietFilter = saved.dietFilter || 'all';
  } catch(e) {}
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.add('hidden'), 2800);
}

function openModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

function openShoppingModal(html) {
  document.getElementById('shoppingBody').innerHTML = html;
  document.getElementById('shoppingOverlay').classList.remove('hidden');
}
function closeShoppingModal() { document.getElementById('shoppingOverlay').classList.add('hidden'); }

function getMealById(id) { return MEALS.find(m => m.id === id); }
function normalizeIngredient(s) { return s.trim().toLowerCase(); }

function categorizeIngredient(ing) {
  const n = normalizeIngredient(ing);
  for (const [cat, list] of Object.entries(INGREDIENT_CATS)) {
    if (list.some(i => n.includes(i) || i.includes(n))) return cat;
  }
  return 'Others';
}

function capitalize(s) { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }

function imgCard(img, alt) {
  return `<div class="meal-img-wrap"><img src="${img}" alt="${alt}" class="meal-img" loading="lazy" onerror="this.style.display='none'"/></div>`;
}

// ─────────────────────────────────────────────
//  PLANNER
// ─────────────────────────────────────────────
function initPlan() {
  DAYS.forEach(day => { if (!state.plan[day]) state.plan[day] = { breakfast: null, lunch: null, dinner: null }; });
}

function renderPlanner() {
  const grid = document.getElementById('plannerGrid');
  const todayName = new Date().toLocaleDateString('en-NG', { weekday: 'long' });

  grid.innerHTML = DAYS.map(day => {
    const dayPlan = state.plan[day] || {};
    const isToday = day === todayName;

    const rows = MEAL_TIMES.map(time => {
      const mealId = dayPlan[time];
      const meal = mealId ? getAnyMealById(mealId) : null;
      const filled = !!meal;
      return `
        <div class="planner-meal-row">
          <span class="meal-time-label ${time}">${time}</span>
          <div class="meal-slot ${filled ? 'filled' : ''}" data-day="${day}" data-time="${time}">
            ${filled
              ? `<span>${meal.emoji} ${meal.name}</span><button class="meal-slot-clear" data-day="${day}" data-time="${time}">✕</button>`
              : `<span style="color:var(--text-muted);font-size:0.82rem">+ Add meal</span>`}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="planner-day" ${isToday ? 'style="border-color:var(--orange);box-shadow:0 0 0 2px rgba(245,158,11,0.25)"' : ''}>
        <div class="planner-day-header" ${isToday ? 'style="background:var(--orange-dark)"' : ''}>
          <span class="planner-day-name">${day} ${isToday ? '📍' : ''}</span>
          <span class="planner-day-date">${isToday ? 'Today' : ''}</span>
        </div>
        <div class="planner-meals">${rows}</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.meal-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target.classList.contains('meal-slot-clear')) return;
      openMealPicker(slot.dataset.day, slot.dataset.time);
    });
  });

  grid.querySelectorAll('.meal-slot-clear').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.plan[btn.dataset.day][btn.dataset.time] = null;
      saveState(); renderPlanner();
    });
  });
}

function openMealPicker(day, time) {
  const html = `
    <div class="modal-meal-header">
      <div class="modal-meal-name" style="font-size:1.1rem">Choose meal for ${day} ${capitalize(time)}</div>
    </div>
    <div class="search-bar">
      <input type="text" id="mealPickerSearch" placeholder="Search meals…" style="margin:0"/>
      <span class="search-icon">🔍</span>
    </div>
    <div class="custom-meal-input">
      <label>Or type a custom meal name:</label>
      <div style="display:flex;gap:8px">
        <input type="text" id="customMealName" placeholder="e.g. Semolina and Okazi"/>
        <button class="btn btn-sm btn-primary" id="addCustomMealBtn">Add</button>
      </div>
    </div>
    <div class="meal-picker-grid" id="mealPickerGrid">${renderPickerGrid(MEALS)}</div>`;

  openModal(html);

  document.getElementById('mealPickerSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = q ? MEALS.filter(m => m.name.toLowerCase().includes(q)) : MEALS;
    document.getElementById('mealPickerGrid').innerHTML = renderPickerGrid(filtered);
    bindPickerItems(day, time);
  });

  document.getElementById('addCustomMealBtn').addEventListener('click', () => {
    const name = document.getElementById('customMealName').value.trim();
    if (!name) return;
    const customId = 'custom_' + Date.now();
    state.plan[day][time] = customId;
    const customs = JSON.parse(localStorage.getItem('mp_customs') || '{}');
    customs[customId] = { id: customId, name, emoji: '🍽️', category: 'Custom', cost: 0, img: '', ingredients: [] };
    localStorage.setItem('mp_customs', JSON.stringify(customs));
    saveState(); closeModal(); renderPlanner();
    showToast(`${name} added to ${day} ${capitalize(time)}`, 'success');
  });

  bindPickerItems(day, time);
}

function renderPickerGrid(meals) {
  return meals.map(m => `
    <div class="meal-picker-item" data-id="${m.id}">
      ${m.img ? `<img src="${m.img}" alt="${m.name}" class="picker-img" loading="lazy" onerror="this.style.display='none'"/>` : `<div class="meal-picker-emoji">${m.emoji}</div>`}
      <div class="meal-picker-name">${m.name}</div>
      <div class="meal-picker-cost">${fmt(m.cost)}${m.servings > 1 ? `/${m.servings} servings` : ''}</div>
    </div>`).join('');
}

function bindPickerItems(day, time) {
  document.querySelectorAll('.meal-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      state.plan[day][time] = Number(item.dataset.id);
      saveState(); closeModal(); renderPlanner();
      showToast('Meal added! ✓', 'success');
    });
  });
}

function getAnyMealById(id) {
  if (typeof id === 'string' && id.startsWith('custom_')) {
    const customs = JSON.parse(localStorage.getItem('mp_customs') || '{}');
    return customs[id];
  }
  return getMealById(id);
}

// ─────────────────────────────────────────────
//  SHOPPING LIST
// ─────────────────────────────────────────────
function generateShoppingList() {
  const allIngredients = [];
  DAYS.forEach(day => {
    MEAL_TIMES.forEach(time => {
      const mealId = (state.plan[day] || {})[time];
      if (!mealId) return;
      const meal = getAnyMealById(mealId);
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ing => {
          const clean = ing.replace(/\(.*?\)/g, '').trim();
          allIngredients.push(normalizeIngredient(clean));
        });
      }
    });
  });

  if (!allIngredients.length) { showToast('Plan some meals first!'); return; }

  const counts = {};
  allIngredients.forEach(ing => { counts[ing] = (counts[ing] || 0) + 1; });

  const grouped = {};
  Object.keys(INGREDIENT_CATS).forEach(cat => grouped[cat] = []);
  Object.entries(counts).forEach(([ing, count]) => {
    const cat = categorizeIngredient(ing);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ ing, count });
  });

  let listsHTML = '';
  let listText = '🛒 SHOPPING LIST — MealPilot\nGenerated: ' + new Date().toLocaleDateString('en-NG') + '\n\n';

  Object.entries(grouped).forEach(([cat, items]) => {
    if (!items.length) return;
    listsHTML += `<div class="shopping-group"><h4>${cat}</h4>`;
    listText += `── ${cat} ──\n`;
    items.forEach(({ ing, count }) => {
      const label = count > 1 ? `${capitalize(ing)} ×${count}` : capitalize(ing);
      const safeKey = ing.replace(/[^a-z0-9]/g, '_');
      listsHTML += `
        <div class="shopping-item" id="si_${safeKey}">
          <input type="checkbox" id="chk_${safeKey}" onchange="toggleShoppingItem(this)"/>
          <label for="chk_${safeKey}">${label}</label>
        </div>`;
      listText += `☐ ${label}\n`;
    });
    listsHTML += `</div>`;
    listText += '\n';
  });

  const totalMeals = Object.values(state.plan).flatMap(d => Object.values(d)).filter(Boolean).length;

  const html = `
    <div class="shopping-header">
      <h3>🛒 Shopping List</h3>
      <div class="shopping-actions">
        <button class="btn btn-sm btn-outline" onclick="printShoppingList()">🖨️</button>
        <button class="btn btn-sm btn-primary" onclick="copyShoppingList('${encodeURIComponent(listText)}')">📋 Copy</button>
        <button class="btn btn-sm btn-orange" onclick="downloadShoppingList('${encodeURIComponent(listText)}')">⬇️</button>
      </div>
    </div>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px">${totalMeals} meals planned · ${Object.values(counts).length} unique ingredients</p>
    ${listsHTML}`;

  openShoppingModal(html);
}

function toggleShoppingItem(checkbox) { checkbox.closest('.shopping-item').classList.toggle('checked', checkbox.checked); }
function printShoppingList() { window.print(); }
function copyShoppingList(encoded) { navigator.clipboard.writeText(decodeURIComponent(encoded)).then(() => showToast('Copied!', 'success')); }
function downloadShoppingList(encoded) {
  const blob = new Blob([decodeURIComponent(encoded)], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `mealpilot-shopping-list-${new Date().toISOString().slice(0,10)}.txt`; a.click();
  showToast('Downloaded!', 'success');
}

// ─────────────────────────────────────────────
//  MEAL CARDS (Explore)
// ─────────────────────────────────────────────
function renderMealCards(meals) {
  const grid = document.getElementById('mealCardsGrid');
  if (!meals.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No meals found.</p></div>`;
    return;
  }
  grid.innerHTML = meals.map(m => `
    <div class="meal-card" data-id="${m.id}">
      <button class="meal-fav-btn ${state.favourites.has(m.id) ? 'active' : ''}" data-id="${m.id}">⭐</button>
      ${m.img ? `<div class="meal-img-wrap"><img src="${m.img}" alt="${m.name}" class="meal-img" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:2.5rem>${m.emoji}</span>'"/></div>` : `<span class="meal-emoji">${m.emoji}</span>`}
      <div class="meal-name">${m.name}</div>
      <div class="meal-category">${m.category}</div>
      <div class="meal-cost">${fmt(m.cost)}${m.servings > 1 ? ` · ${m.servings} svgs` : ''}</div>
    </div>`).join('');

  grid.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', (e) => { if (e.target.classList.contains('meal-fav-btn')) return; openMealDetail(Number(card.dataset.id)); });
  });
  grid.querySelectorAll('.meal-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(Number(btn.dataset.id)); btn.classList.toggle('active'); });
  });
}

function filterMealCards() {
  const q = document.getElementById('mealSearchInput').value.toLowerCase();
  const cat = document.querySelector('#mealCategoryFilter .chip.active')?.dataset.cat || 'all';
  let meals = MEALS;
  if (cat !== 'all') meals = meals.filter(m => m.category === cat);
  if (q) meals = meals.filter(m => m.name.toLowerCase().includes(q));
  renderMealCards(meals);
}

// ─────────────────────────────────────────────
//  MEAL DETAIL MODAL
// ─────────────────────────────────────────────
function openMealDetail(id) {
  const meal = getMealById(id);
  if (!meal) return;
  const recipe = RECIPES.find(r => r.mealId === id);
  const isFav = state.favourites.has(id);

  const crRef = meal.note ? `<div style="background:rgba(14,122,61,0.08);border-radius:8px;padding:10px 12px;font-size:0.8rem;color:var(--green);margin-bottom:14px;border-left:3px solid var(--green)">💡 ${meal.note}</div>` : '';

  const stepsHTML = recipe ? `<div class="modal-section"><h4>Method (${recipe.cookTime} min)</h4><ol class="modal-step-list">${recipe.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>` : '';

  const html = `
    ${meal.img ? `<img src="${meal.img}" alt="${meal.name}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:16px" loading="lazy" onerror="this.style.display='none'"/>` : ''}
    <div class="modal-meal-header">
      <div class="modal-meal-emoji">${meal.emoji}</div>
      <div class="modal-meal-name">${meal.name}</div>
      <div class="modal-tags">
        <span class="modal-tag tag-green">${meal.category}</span>
        <span class="modal-tag tag-orange">${fmt(meal.cost)}${meal.servings > 1 ? ` / ${meal.servings} servings` : ''}</span>
        ${meal.servings > 1 ? `<span class="modal-tag tag-purple">${fmt(Math.round(meal.cost/meal.servings))} per person</span>` : ''}
      </div>
    </div>
    ${crRef}
    <div class="modal-section">
      <h4>Ingredients</h4>
      <ul class="modal-ingredient-list">${meal.ingredients.map(i=>`<li>${capitalize(i)}</li>`).join('')}</ul>
    </div>
    ${stepsHTML}
    <div class="modal-section">
      <h4>Add to Meal Plan</h4>
      <select class="meal-add-to-day-select" id="addToDaySelect">
        ${DAYS.map(d=>MEAL_TIMES.map(t=>`<option value="${d}|${t}">${d} — ${capitalize(t)}</option>`).join('')).join('')}
      </select>
      <button class="btn btn-primary btn-sm" id="addToPlanConfirmBtn">Add to Plan</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-sm ${isFav ? 'btn-orange' : 'btn-outline'}" id="favToggleBtn">${isFav ? '⭐ Saved' : '☆ Save'}</button>
      ${HEALTHY_SWAPS[id] ? '<button class="btn btn-sm" style="background:var(--green);color:#fff" id="healthyVersionBtn">🥗 Healthy Version</button>' : ''}
    </div>`;

  openModal(html);

  document.getElementById('addToPlanConfirmBtn').addEventListener('click', () => {
    const [day, time] = document.getElementById('addToDaySelect').value.split('|');
    state.plan[day][time] = id; saveState(); closeModal(); renderPlanner();
    showToast(`Added to ${day} ${capitalize(time)}!`, 'success');
  });

  document.getElementById('favToggleBtn').addEventListener('click', () => {
    toggleFav(id);
    const now = state.favourites.has(id);
    document.getElementById('favToggleBtn').textContent = now ? '⭐ Saved' : '☆ Save';
    document.getElementById('favToggleBtn').className = `btn btn-sm ${now ? 'btn-orange' : 'btn-outline'}`;
  });

  state.recentRecipes = [id, ...state.recentRecipes.filter(x=>x!==id)].slice(0,5);
  saveState();

  // Wire up Healthy Version button if present
  const hvBtn = document.getElementById('healthyVersionBtn');
  if (hvBtn) hvBtn.addEventListener('click', () => openHealthyVersion(id));
}

// ─────────────────────────────────────────────
//  RECIPES SECTION
// ─────────────────────────────────────────────
function renderRecipeCards(recipes) {
  const grid = document.getElementById('recipeCardsGrid');
  if (!recipes.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📖</div><p>No recipes found.</p></div>`;
    return;
  }
  grid.innerHTML = recipes.map(r => `
    <div class="recipe-card" data-id="${r.mealId}">
      ${r.img ? `<div class="meal-img-wrap"><img src="${r.img}" alt="${r.name}" class="meal-img" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:1.8rem>${r.emoji}</span>'"/></div>` : `<span class="recipe-emoji">${r.emoji}</span>`}
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">
        <span class="recipe-tag green">${r.category}</span>
        <span class="recipe-tag orange">⏱ ${r.cookTime}min</span>
        <span class="recipe-tag">${fmt(r.cost)}</span>
        <span class="recipe-tag">👥 ${r.servings}</span>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => openMealDetail(Number(card.dataset.id)));
  });
}

function filterRecipeCards() {
  const q = document.getElementById('recipeSearchInput').value.toLowerCase();
  const cat = document.querySelector('#recipeCategoryFilter .chip.active')?.dataset.cat || 'all';

  // If 'Healthy & Diet' tab is active, delegate to renderHealthyRecipes
  if (cat === 'Healthy & Diet') {
    document.getElementById('recipeCardsGrid').classList.add('hidden');
    const healthySec = document.getElementById('healthyRecipeSection');
    if (healthySec) healthySec.classList.remove('hidden');
    return;
  }

  // Show normal recipe grid, hide healthy section
  document.getElementById('recipeCardsGrid').classList.remove('hidden');
  const healthySec = document.getElementById('healthyRecipeSection');
  if (healthySec) healthySec.classList.add('hidden');

  let recipes = RECIPES;
  if (cat !== 'all') recipes = recipes.filter(r => r.category === cat);
  if (q) recipes = recipes.filter(r => r.name.toLowerCase().includes(q));
  renderRecipeCards(recipes);
}

// ─────────────────────────────────────────────
//  BUDGET: WHAT CAN I COOK?
// ─────────────────────────────────────────────
function runBudgetSuggest() {
  const budget = Number(document.getElementById('budgetInput').value);
  if (!budget || budget < 100) { showToast('Please enter a valid amount (min ₦100)'); return; }

  const affordable = MEALS.filter(m => m.cost <= budget * 1.2).sort((a,b) => Math.abs(budget-a.cost) - Math.abs(budget-b.cost));

  if (!affordable.length) {
    document.getElementById('budgetResults').innerHTML = `<p style="color:rgba(255,255,255,0.8);text-align:center;padding:16px">Hmm, ₦${budget.toLocaleString()} is very tight. Try ₦500 or more.</p>`;
    document.getElementById('budgetResults').classList.remove('hidden');
    return;
  }

  const shown = affordable.slice(0, 6);
  const html = `
    <p style="color:rgba(255,255,255,0.9);font-size:0.82rem;margin-bottom:12px">🎉 ${affordable.length} meals within your ${fmt(budget)} budget:</p>
    ${shown.map(m => `
      <div class="budget-meal-item">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          ${m.img ? `<img src="${m.img}" alt="${m.name}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0" loading="lazy" onerror="this.style.display='none'"/>` : `<span style="font-size:1.8rem">${m.emoji}</span>`}
          <div>
            <div class="meal-n">${m.name}</div>
            <div class="meal-c">${fmt(m.cost)} · ${m.servings > 1 ? `${m.servings} servings · ${fmt(Math.round(m.cost/m.servings))}/person` : '1 serving'}</div>
          </div>
        </div>
        <div class="meal-d">${m.ingredients.slice(0,4).map(i=>i.replace(/\(.*?\)/g,'')).join(', ')}…</div>
      </div>`).join('')}
    ${affordable.length > 6 ? `<p style="color:rgba(255,255,255,0.7);font-size:0.78rem;text-align:center;margin-top:8px">+${affordable.length-6} more meals fit your budget</p>` : ''}`;

  document.getElementById('budgetResults').innerHTML = html;
  document.getElementById('budgetResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  BUDGET ESTIMATOR
// ─────────────────────────────────────────────
function runBudgetEstimate() {
  const adults = Number(document.getElementById('numAdults').value) || 1;
  const children = Number(document.getElementById('numChildren').value) || 0;
  const days = Number(document.getElementById('numDays').value) || 7;

  const DAILY_PER_ADULT = { economy: 1500, standard: 2500, premium: 4500 };
  const DAILY_PER_CHILD = { economy: 900, standard: 1500, premium: 2500 };

  const tiers = ['economy', 'standard', 'premium'];
  const labels = { economy: '💚 Budget-Friendly (Market cooking)', standard: '🟡 Standard (Mix of home + occasional CR)', premium: '💜 Premium (Quality ingredients + dining out)' };

  const results = tiers.map(tier => {
    const daily = (adults * DAILY_PER_ADULT[tier]) + (children * DAILY_PER_CHILD[tier]);
    const total = daily * days;
    const weekly = daily * 7;
    return { tier, label: labels[tier], daily, total, weekly };
  });

  const crRef = `<div style="background:rgba(14,122,61,0.08);border-radius:8px;padding:10px;font-size:0.78rem;color:var(--green);margin-top:12px;border-left:3px solid var(--green)">
    🍗 <strong>Chicken Republic reference:</strong> Refuel Meal ₦900 · Citizens Meal (2pc) ₦2,000 · Pot Lovers (family) ₦9,000
  </div>`;

  const html = `
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px">For ${adults} adult${adults>1?'s':''} + ${children} child${children!==1?'ren':''}, ${days} days — 2025 prices:</p>
    ${results.map(r => `
      <div class="budget-tier ${r.tier}">
        <div>
          <div class="budget-tier-label">${r.label}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Daily: ${fmt(r.daily)} · Weekly: ${fmt(r.weekly)}</div>
        </div>
        <div class="budget-tier-amount">${fmt(r.total)}</div>
      </div>`).join('')}
    ${crRef}
    <p style="font-size:0.72rem;color:var(--text-muted);margin-top:10px">* Based on Lagos/Abuja 2025 market prices. Source: SBM Intelligence, Nigerian market data.</p>`;

  document.getElementById('budgetEstimateResults').innerHTML = html;
  document.getElementById('budgetEstimateResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  INGREDIENT MATCHING
// ─────────────────────────────────────────────
function runIngredientMatch() {
  const raw = document.getElementById('ingredientInput').value;
  if (!raw.trim()) { showToast('Enter some ingredients first'); return; }

  const userIngs = raw.split(',').map(s => normalizeIngredient(s)).filter(Boolean);

  const scored = MEALS.map(meal => {
    const mealIngs = meal.ingredients.map(i => normalizeIngredient(i.replace(/\(.*?\)/g,'')));
    const matches = mealIngs.filter(mi => userIngs.some(ui => mi.includes(ui) || ui.includes(mi)));
    const pct = Math.round((matches.length / mealIngs.length) * 100);
    const missing = mealIngs.filter(mi => !userIngs.some(ui => mi.includes(ui) || ui.includes(mi)));
    return { meal, pct, matches, missing };
  }).filter(s => s.pct > 0).sort((a,b) => b.pct-a.pct).slice(0,8);

  if (!scored.length) {
    document.getElementById('ingredientResults').innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px">No matching meals found. Try more ingredients!</p>`;
    document.getElementById('ingredientResults').classList.remove('hidden');
    return;
  }

  const html = scored.map(s => {
    const pctClass = s.pct >= 70 ? 'high' : s.pct >= 40 ? 'mid' : 'low';
    return `
      <div class="ingredient-match">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          ${s.meal.img ? `<img src="${s.meal.img}" alt="${s.meal.name}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0" loading="lazy" onerror="this.style.display='none'"/>` : `<span style="font-size:1.4rem">${s.meal.emoji}</span>`}
          <div class="match-header" style="flex:1;display:flex;align-items:center;justify-content:space-between">
            <span class="match-name">${s.meal.name}</span>
            <span class="match-pct ${pctClass}">${s.pct}%</span>
          </div>
        </div>
        <div class="match-detail">
          <span>✓ You have: ${s.matches.slice(0,4).map(capitalize).join(', ')}${s.matches.length>4?'…':''}</span>
          ${s.missing.length ? `<span style="color:var(--orange-dark)">✗ Still need: ${s.missing.slice(0,3).map(capitalize).join(', ')}${s.missing.length>3?` +${s.missing.length-3} more`:''}</span>` : '<span style="color:var(--green)">🎉 You have everything!</span>'}
        </div>
      </div>`;
  }).join('');

  document.getElementById('ingredientResults').innerHTML = html;
  document.getElementById('ingredientResults').classList.remove('hidden');
}

// ─────────────────────────────────────────────
//  TRACKER
// ─────────────────────────────────────────────
function renderTracker() {
  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate()-now.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekSpend = state.expenses.filter(e=>new Date(e.date)>=thisWeekStart).reduce((s,e)=>s+e.amount,0);
  const monthSpend = state.expenses.filter(e=>new Date(e.date)>=thisMonthStart).reduce((s,e)=>s+e.amount,0);
  const goal = state.monthlyBudgetGoal;
  const remaining = goal ? Math.max(0, goal-monthSpend) : 0;
  const pct = goal ? Math.min(100, Math.round((monthSpend/goal)*100)) : 0;
  const pctClass = pct>=90?'danger':pct>=70?'warn':'';

  document.getElementById('trackerSummary').innerHTML = `
    <div class="tracker-stat"><span class="amount">${fmt(weekSpend)}</span><span class="label">This week</span></div>
    <div class="tracker-stat"><span class="amount">${fmt(monthSpend)}</span><span class="label">This month</span></div>
    ${goal ? `<div class="tracker-stat" style="grid-column:1/-1">
      <div class="progress-wrap">
        <div class="progress-label"><span>Monthly budget</span><span>${pct}% used · ${fmt(remaining)} left</span></div>
        <div class="progress-bar"><div class="progress-fill ${pctClass}" style="width:${pct}%"></div></div>
      </div>
    </div>` : ''}`;

  if (goal) document.getElementById('monthlyBudgetGoal').value = goal;
  renderMiniChart();

  const list = document.getElementById('expenseList');
  const recent = [...state.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20);
  if (!recent.length) {
    list.innerHTML = `<div class="empty-state" style="padding:20px"><div class="empty-icon">💸</div><p>No expenses yet. Add your first one!</p></div>`;
    return;
  }
  list.innerHTML = recent.map(e => `
    <div class="expense-item">
      <div><div class="expense-desc">${e.desc}</div><div class="expense-cat">${e.category} · ${new Date(e.date).toLocaleDateString('en-NG')}</div></div>
      <div style="display:flex;align-items:center"><span class="expense-amount">${fmt(e.amount)}</span><button class="expense-delete" data-id="${e.id}">🗑</button></div>
    </div>`).join('');

  list.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      state.expenses = state.expenses.filter(e=>e.id!==Number(btn.dataset.id));
      saveState(); renderTracker();
    });
  });
}

function renderMiniChart() {
  const catTotals = {};
  Object.keys(INGREDIENT_CATS).forEach(c => catTotals[c] = 0);
  state.expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount; });
  const maxVal = Math.max(...Object.values(catTotals), 1);
  const container = document.getElementById('spendingChart').parentElement;
  const existing = container.querySelector('.mini-chart');
  if (existing) existing.remove();
  const miniChart = document.createElement('div');
  miniChart.className = 'mini-chart';
  const entries = Object.entries(catTotals).filter(([,v])=>v>0);
  miniChart.innerHTML = entries.length
    ? entries.map(([cat,val])=>`<div class="mini-bar-row"><span class="mini-bar-label">${cat}</span><div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round((val/maxVal)*100)}%"></div></div><span class="mini-bar-val">${fmt(val)}</span></div>`).join('')
    : `<p style="color:var(--text-muted);font-size:0.82rem;text-align:center;padding:10px">No spending data yet</p>`;
  container.insertBefore(miniChart, document.getElementById('expenseList'));
}

function addExpense() {
  const desc = document.getElementById('expenseDesc').value.trim();
  const amount = Number(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const budgetGoal = Number(document.getElementById('monthlyBudgetGoal').value);
  if (!desc || !amount || amount<=0) { showToast('Please fill in description and amount'); return; }
  state.expenses.push({ id:Date.now(), desc, amount, category, date:new Date().toISOString() });
  if (budgetGoal>0) state.monthlyBudgetGoal = budgetGoal;
  document.getElementById('expenseDesc').value = '';
  document.getElementById('expenseAmount').value = '';
  saveState(); renderTracker();
  showToast('Expense added!', 'success');
}

// ─────────────────────────────────────────────
//  FOOD TIPS
// ─────────────────────────────────────────────
function renderTip() {
  const tip = FOOD_TIPS[state.tipIndex % FOOD_TIPS.length];
  document.getElementById('foodTipDisplay').innerHTML = `
    <div class="tip-number">Tip ${(state.tipIndex % FOOD_TIPS.length)+1} of ${FOOD_TIPS.length}</div>
    <div class="tip-text">${tip}</div>`;
}

// ─────────────────────────────────────────────
//  FAVOURITES
// ─────────────────────────────────────────────
function toggleFav(id) {
  if (state.favourites.has(id)) { state.favourites.delete(id); showToast('Removed from favourites'); }
  else { state.favourites.add(id); showToast('Saved to favourites ⭐', 'success'); }
  saveState();
}

function openFavourites() {
  const favIds = [...state.favourites];
  if (!favIds.length) {
    openModal(`<div class="modal-meal-header"><div class="modal-meal-name">⭐ Favourites</div></div><div class="empty-state"><div class="empty-icon">⭐</div><p>No favourites yet! Tap the star on any meal to save it here.</p></div>`);
    return;
  }
  const meals = favIds.map(id=>getMealById(id)).filter(Boolean);
  const html = `
    <div class="modal-meal-header"><div class="modal-meal-name">⭐ Favourites (${meals.length})</div></div>
    <div class="fav-list">${meals.map(m=>`
      <div class="fav-item" data-id="${m.id}">
        ${m.img ? `<img src="${m.img}" alt="${m.name}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0" loading="lazy" onerror="this.style.display='none'"/>` : `<span class="fav-emoji">${m.emoji}</span>`}
        <div><div class="fav-name">${m.name}</div><div class="fav-cat">${m.category} · ${fmt(m.cost)}</div></div>
      </div>`).join('')}
    </div>`;
  openModal(html);
  document.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', () => { closeModal(); setTimeout(()=>openMealDetail(Number(item.dataset.id)),200); });
  });
}

// ─────────────────────────────────────────────
//  EXPORT PLAN
// ─────────────────────────────────────────────
function exportPlan() {
  let text = '📅 MY WEEKLY MEAL PLAN — MealPilot\nGenerated: ' + new Date().toLocaleDateString('en-NG') + '\n\n';
  let totalCost = 0;
  DAYS.forEach(day => {
    text += `── ${day.toUpperCase()} ──\n`;
    const dayPlan = state.plan[day] || {};
    MEAL_TIMES.forEach(time => {
      const mealId = dayPlan[time];
      const meal = mealId ? getAnyMealById(mealId) : null;
      text += `  ${capitalize(time)}: ${meal ? `${meal.name} (${fmt(meal.cost)})` : 'Not planned'}\n`;
      if (meal) totalCost += meal.cost;
    });
    text += '\n';
  });
  text += `──────────────────────\nEstimated Total: ${fmt(totalCost)}\n\nPlanned with MealPilot 🍛\nPrices based on Lagos/Abuja 2025 market rates.`;
  const blob = new Blob([text], { type:'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mealpilot-plan-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  showToast('Plan exported!', 'success');
}

// ─────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode', state.darkMode);
  document.getElementById('darkModeToggle').innerHTML = state.darkMode ? '<span>☀️</span>' : '<span class="icon-moon">🌙</span>';
  saveState();
}

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function navigate(sectionId) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const section = document.getElementById('sec-'+sectionId);
  const navBtn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (section) section.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  if (sectionId==='planner') renderPlanner();
  if (sectionId==='explore') filterMealCards();
  if (sectionId==='recipes') { filterRecipeCards(); renderHealthyRecipes(); renderHealthyGate(); }
  if (sectionId==='tracker') renderTracker();
  window.scrollTo(0,0);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
function init() {
  loadState();
  initPlan();
  initAuth(); // Supabase auth — runs async, updates UI when ready

  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    document.getElementById('app').classList.remove('hidden');
    renderPlanner();
    renderMealCards(MEALS);
    renderRecipeCards(RECIPES);
    renderHealthyRecipes();
    renderMarketPlanner();
    renderTracker();
    renderTip();
  }, 1600);

  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').innerHTML = '<span>☀️</span>';
  }

  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', ()=>navigate(btn.dataset.section)));
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('favBtn').addEventListener('click', openFavourites);
  document.getElementById('generateShoppingList').addEventListener('click', generateShoppingList);
  document.getElementById('exportPlanBtn').addEventListener('click', exportPlan);
  document.getElementById('clearPlanBtn').addEventListener('click', () => {
    if (!confirm('Clear the entire week\'s meal plan?')) return;
    DAYS.forEach(d => { state.plan[d] = { breakfast:null, lunch:null, dinner:null }; });
    saveState(); renderPlanner(); showToast('Plan cleared');
  });

  document.getElementById('mealSearchInput').addEventListener('input', filterMealCards);
  document.querySelectorAll('#mealCategoryFilter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#mealCategoryFilter .chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active'); filterMealCards();
    });
  });

  document.getElementById('recipeSearchInput').addEventListener('input', filterRecipeCards);
  document.querySelectorAll('#recipeCategoryFilter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#recipeCategoryFilter .chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active'); filterRecipeCards();
    });
  });

  document.getElementById('budgetSuggestBtn').addEventListener('click', runBudgetSuggest);
  document.getElementById('budgetInput').addEventListener('keydown', e=>{ if(e.key==='Enter') runBudgetSuggest(); });
  document.getElementById('estimateBudgetBtn').addEventListener('click', runBudgetEstimate);
  document.getElementById('ingredientMatchBtn').addEventListener('click', runIngredientMatch);
  document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
  document.getElementById('nextTipBtn').addEventListener('click', () => { state.tipIndex++; saveState(); renderTip(); });

  // Feature 1: Market Planner
  const calcMarketBtn = document.getElementById('calculateMarketBtn');
  if (calcMarketBtn) calcMarketBtn.addEventListener('click', calculateMarketBudget);
  const marketBudgetInput = document.getElementById('marketBudgetInput');
  if (marketBudgetInput) marketBudgetInput.addEventListener('input', renderMarketPlanner);

  // Feature 2: Healthy recipe diet filters
  document.querySelectorAll('#dietFilterBar .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#dietFilterBar .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.dietFilter = chip.dataset.diet;
      saveState();
      renderHealthyRecipes();
    });
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('shoppingClose').addEventListener('click', closeShoppingModal);
  document.getElementById('modalOverlay').addEventListener('click', e=>{ if(e.target===document.getElementById('modalOverlay')) closeModal(); });
  document.getElementById('shoppingOverlay').addEventListener('click', e=>{ if(e.target===document.getElementById('shoppingOverlay')) closeShoppingModal(); });
}

window.toggleShoppingItem = toggleShoppingItem;
window.printShoppingList = printShoppingList;
window.copyShoppingList = copyShoppingList;
window.downloadShoppingList = downloadShoppingList;

document.addEventListener('DOMContentLoaded', init);

// ═══════════════════════════════════════════════════════════════
//  FEATURE 1: "WHAT CAN I BUY WITH?" — Nigerian Market Planner
// ═══════════════════════════════════════════════════════════════

// Nigerian market unit prices (2025 averages, Lagos/Abuja)
const MARKET_ITEMS = [
  { name:'Tomatoes',       emoji:'🍅', unitPrice:1000, unit:'basket/cup',  priority:'high',   category:'Vegetables' },
  { name:'Pepper',         emoji:'🌶️', unitPrice:500,  unit:'cup',         priority:'high',   category:'Vegetables' },
  { name:'Onion',          emoji:'🧅', unitPrice:500,  unit:'medium bag',  priority:'high',   category:'Vegetables' },
  { name:'Rice',           emoji:'🍚', unitPrice:2400, unit:'1kg',         priority:'high',   category:'Grains' },
  { name:'Garri',          emoji:'🥣', unitPrice:1500, unit:'1kg',         priority:'high',   category:'Grains' },
  { name:'Beans',          emoji:'🫘', unitPrice:2200, unit:'1kg',         priority:'high',   category:'Grains' },
  { name:'Yam',            emoji:'🍠', unitPrice:3000, unit:'½ tuber',     priority:'medium', category:'Grains' },
  { name:'Plantain',       emoji:'🍌', unitPrice:1000, unit:'bunch (2–3)', priority:'medium', category:'Grains' },
  { name:'Bread',          emoji:'🍞', unitPrice:1200, unit:'loaf',        priority:'medium', category:'Grains' },
  { name:'Indomie',        emoji:'🍜', unitPrice:250,  unit:'pack',        priority:'low',    category:'Grains' },
  { name:'Spaghetti',      emoji:'🍝', unitPrice:700,  unit:'500g',        priority:'low',    category:'Grains' },
  { name:'Chicken',        emoji:'🍗', unitPrice:4800, unit:'1kg',         priority:'medium', category:'Proteins' },
  { name:'Beef',           emoji:'🥩', unitPrice:5500, unit:'1kg',         priority:'medium', category:'Proteins' },
  { name:'Goat Meat',      emoji:'🍖', unitPrice:6500, unit:'1kg',         priority:'low',    category:'Proteins' },
  { name:'Fish (Tilapia)', emoji:'🐟', unitPrice:3000, unit:'medium fish', priority:'medium', category:'Proteins' },
  { name:'Catfish',        emoji:'🐠', unitPrice:6000, unit:'1kg',         priority:'low',    category:'Proteins' },
  { name:'Eggs',           emoji:'🥚', unitPrice:1900, unit:'½ crate(15)', priority:'high',   category:'Proteins' },
  { name:'Smoked Fish',    emoji:'🐡', unitPrice:1500, unit:'medium',      priority:'medium', category:'Proteins' },
  { name:'Stockfish',      emoji:'🦴', unitPrice:1500, unit:'medium',      priority:'medium', category:'Proteins' },
  { name:'Turkey',         emoji:'🦃', unitPrice:6000, unit:'½kg',         priority:'low',    category:'Proteins' },
  { name:'Cabbage',        emoji:'🥬', unitPrice:800,  unit:'small head',  priority:'medium', category:'Vegetables' },
  { name:'Carrots',        emoji:'🥕', unitPrice:600,  unit:'3 medium',    priority:'medium', category:'Vegetables' },
  { name:'Garden Egg',     emoji:'🍆', unitPrice:500,  unit:'bunch',       priority:'low',    category:'Vegetables' },
  { name:'Spinach/Tete',   emoji:'🌿', unitPrice:400,  unit:'bunch',       priority:'medium', category:'Vegetables' },
  { name:'Ugwu',           emoji:'🌱', unitPrice:400,  unit:'bunch',       priority:'medium', category:'Vegetables' },
  { name:'Okra',           emoji:'🫑', unitPrice:600,  unit:'250g',        priority:'medium', category:'Vegetables' },
  { name:'Pumpkin Leaf',   emoji:'🍃', unitPrice:300,  unit:'bunch',       priority:'low',    category:'Vegetables' },
  { name:'Palm Oil',       emoji:'🫙', unitPrice:2500, unit:'1 litre',     priority:'high',   category:'Oils' },
  { name:'Vegetable Oil',  emoji:'🛢️', unitPrice:2000, unit:'1 litre',     priority:'high',   category:'Oils' },
  { name:'Ground Crayfish',emoji:'🦐', unitPrice:1500, unit:'small cup',   priority:'medium', category:'Seasonings' },
  { name:'Seasoning Cubes',emoji:'🧂', unitPrice:500,  unit:'pack of 12',  priority:'high',   category:'Seasonings' },
  { name:'Egusi',          emoji:'🥜', unitPrice:4500, unit:'500g',        priority:'medium', category:'Seasonings' },
  { name:'Ogbono',         emoji:'🌰', unitPrice:4000, unit:'200g',        priority:'low',    category:'Seasonings' },
  { name:'Locust Beans',   emoji:'🫘', unitPrice:600,  unit:'sachet',      priority:'low',    category:'Seasonings' },
  { name:'Milk (Tin)',     emoji:'🥛', unitPrice:800,  unit:'tin',         priority:'low',    category:'Others' },
  { name:'Sugar',          emoji:'🍬', unitPrice:1000, unit:'500g',        priority:'medium', category:'Others' },
  { name:'Salt',           emoji:'🧂', unitPrice:200,  unit:'sachet',      priority:'high',   category:'Others' },
  { name:'Coconut Milk',   emoji:'🥥', unitPrice:2000, unit:'tin',         priority:'low',    category:'Others' },
];

// Shopping cart state (session only — not persisted to keep it lightweight)
let marketCart = [];

function renderMarketPlanner() {
  const totalBudget = Number(document.getElementById('marketBudgetInput').value) || 0;

  // Group items by category for the picker grid
  const categories = [...new Set(MARKET_ITEMS.map(i => i.category))];

  const pickerHTML = categories.map(cat => `
    <div class="market-cat-group">
      <div class="market-cat-label">${cat}</div>
      <div class="market-item-grid">
        ${MARKET_ITEMS.filter(i => i.category === cat).map(item => {
          const inCart = marketCart.find(c => c.name === item.name);
          return `
            <div class="market-item-chip ${inCart ? 'selected' : ''}" data-name="${item.name}">
              <span>${item.emoji}</span>
              <span>${item.name}</span>
              ${inCart ? '<span class="chip-check">✓</span>' : ''}
            </div>`;
        }).join('')}
      </div>
    </div>`).join('');

  document.getElementById('marketItemPicker').innerHTML = pickerHTML;

  // Bind click events
  document.querySelectorAll('.market-item-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.name;
      const item = MARKET_ITEMS.find(i => i.name === name);
      const idx = marketCart.findIndex(c => c.name === name);
      if (idx >= 0) {
        marketCart.splice(idx, 1);
      } else {
        marketCart.push({ ...item, userPriority: item.priority });
      }
      renderMarketPlanner();
    });
  });

  // Render cart with priority controls
  const cartEl = document.getElementById('marketCart');
  if (!marketCart.length) {
    cartEl.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem;text-align:center;padding:12px">Tap items above to add them to your list</p>`;
  } else {
    cartEl.innerHTML = `
      <div class="market-cart-list">
        ${marketCart.map(item => `
          <div class="market-cart-row">
            <span class="market-cart-emoji">${item.emoji}</span>
            <span class="market-cart-name">${item.name}</span>
            <select class="market-priority-select" data-name="${item.name}">
              <option value="high"   ${item.userPriority==='high'   ? 'selected':''}>🔴 High</option>
              <option value="medium" ${item.userPriority==='medium' ? 'selected':''}>🟡 Medium</option>
              <option value="low"    ${item.userPriority==='low'    ? 'selected':''}>🟢 Optional</option>
            </select>
            <button class="market-remove-btn" data-name="${item.name}">✕</button>
          </div>`).join('')}
      </div>`;

    cartEl.querySelectorAll('.market-priority-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const item = marketCart.find(c => c.name === sel.dataset.name);
        if (item) { item.userPriority = sel.value; }
      });
    });
    cartEl.querySelectorAll('.market-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        marketCart = marketCart.filter(c => c.name !== btn.dataset.name);
        renderMarketPlanner();
      });
    });
  }
}

function calculateMarketBudget() {
  const budget = Number(document.getElementById('marketBudgetInput').value);
  if (!budget || budget < 200) { showToast('Enter a budget amount (min ₦200)'); return; }
  if (!marketCart.length) { showToast('Add at least one item to your list'); return; }

  // Sort: high priority first, then medium, then optional
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...marketCart].sort((a,b) => priorityOrder[a.userPriority] - priorityOrder[b.userPriority]);

  let remaining = budget;
  const included = [];
  const excluded = [];

  // Greedy allocation: fit items in priority order
  for (const item of sorted) {
    if (remaining >= item.unitPrice) {
      included.push({ ...item, allocated: item.unitPrice });
      remaining -= item.unitPrice;
    } else if (remaining > 0 && item.userPriority === 'high') {
      // Partial entry for high-priority items we can't fully afford
      included.push({ ...item, allocated: remaining, partial: true });
      remaining = 0;
    } else {
      excluded.push(item);
    }
  }

  const totalSpent = budget - remaining;
  const pct = Math.min(100, Math.round((totalSpent / budget) * 100));

  // Build breakdown bars
  const catTotals = {};
  included.forEach(i => { catTotals[i.category] = (catTotals[i.category] || 0) + i.allocated; });
  const maxCat = Math.max(...Object.values(catTotals), 1);

  const html = `
    <div class="market-result-header">
      <div class="market-result-budget">Budget: <strong>${fmt(budget)}</strong></div>
      <div class="market-result-spent">Spending: <strong>${fmt(totalSpent)}</strong></div>
      <div class="market-result-remaining ${remaining > 0 ? 'positive' : 'zero'}">Remaining: <strong>${fmt(remaining)}</strong></div>
    </div>

    <div class="market-progress-wrap">
      <div class="market-progress-bar">
        <div class="market-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="market-progress-label">${pct}% of budget allocated</div>
    </div>

    <h4 style="margin:14px 0 8px;font-size:0.88rem">✅ Recommended Shopping Plan</h4>
    <div class="market-plan-list">
      ${included.map(item => {
        const itemPct = Math.round((item.allocated / budget) * 100);
        return `
          <div class="market-plan-row">
            <span class="market-plan-emoji">${item.emoji}</span>
            <div class="market-plan-info">
              <span class="market-plan-name">${item.name}${item.partial ? ' <span class="partial-tag">partial</span>':''}</span>
              <span class="market-plan-unit">${item.unit}</span>
            </div>
            <div class="market-plan-right">
              <span class="market-plan-price">${fmt(item.allocated)}</span>
              <div class="market-plan-bar-wrap">
                <div class="market-plan-bar" style="width:${itemPct}%"></div>
              </div>
              <span class="market-plan-pct">${itemPct}%</span>
            </div>
          </div>`;
      }).join('')}
    </div>

    ${excluded.length ? `
      <div class="market-excluded">
        <h4 style="font-size:0.82rem;margin-bottom:6px;color:var(--orange-dark)">⚠️ Budget too small for these items:</h4>
        ${excluded.map(i => `<span class="market-excluded-chip">${i.emoji} ${i.name} (${fmt(i.unitPrice)})</span>`).join('')}
      </div>` : ''}

    <div class="market-cat-breakdown">
      <h4 style="font-size:0.82rem;margin-bottom:8px">📊 Category Breakdown</h4>
      ${Object.entries(catTotals).map(([cat, val]) => `
        <div class="mini-bar-row">
          <span class="mini-bar-label">${cat}</span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round((val/maxCat)*100)}%"></div></div>
          <span class="mini-bar-val">${fmt(val)}</span>
        </div>`).join('')}
    </div>

    <div class="market-plan-actions">
      <button class="btn btn-sm btn-primary" onclick="saveMarketPlan(${budget})">💾 Save Plan</button>
      <button class="btn btn-sm btn-outline" onclick="copyMarketPlan(${budget}, ${totalSpent}, ${remaining})">📋 Copy List</button>
    </div>`;

  document.getElementById('marketResults').innerHTML = html;
  document.getElementById('marketResults').classList.remove('hidden');
}

function saveMarketPlan(budget) {
  const plan = {
    id: Date.now(),
    budget,
    date: new Date().toLocaleDateString('en-NG'),
    items: marketCart.map(i => ({ name: i.name, emoji: i.emoji, price: i.unitPrice, priority: i.userPriority })),
  };
  state.savedShoppingPlans = [plan, ...state.savedShoppingPlans].slice(0, 10); // keep last 10
  saveState();
  showToast('Shopping plan saved! ✓', 'success');
}

function copyMarketPlan(budget, spent, remaining) {
  const lines = [`🛒 MARKET PLAN — MealPilot`, `Budget: ₦${budget.toLocaleString()}`, ``, ...marketCart.map(i => `☐ ${i.emoji} ${i.name} — ₦${i.unitPrice.toLocaleString()} (${i.unit})`), ``, `Total: ₦${spent.toLocaleString()}`, `Remaining: ₦${remaining.toLocaleString()}`];
  navigator.clipboard.writeText(lines.join('\n')).then(() => showToast('Copied!', 'success'));
}

// Expose for inline onclick
window.saveMarketPlan = saveMarketPlan;
window.copyMarketPlan = copyMarketPlan;


// ═══════════════════════════════════════════════════════════════
//  FEATURE 2: HEALTHY & DIET RECIPES
// ═══════════════════════════════════════════════════════════════

// Healthy recipe database
const HEALTHY_RECIPES = [
  // ── Nigerian Healthy Meals ──
  {
    id:'h1', name:'Boiled Yam & Garden Egg Sauce', emoji:'🍆', category:'Healthy & Diet',
    dietTags:['weight-loss','low-calorie','vegetarian','diabetic'],
    calories:320, protein:8, carbs:58, fat:6, servings:2, cookTime:30, difficulty:'Easy',
    cost:3500,
    ingredients:['½ yam tuber (₦3,000)','4 garden eggs (₦500)','2 tomatoes','1 onion','2 peppers','1 tsp vegetable oil','salt','seasoning'],
    steps:[
      'Boil yam in salted water for 20 minutes until tender. Drain.',
      'In a separate pan, heat 1 tsp oil and sauté onion for 2 minutes.',
      'Add diced tomatoes, peppers, and garden eggs. Crush garden eggs as they soften.',
      'Cook sauce for 8–10 minutes. Season lightly. Serve over yam.',
    ],
    healthNote:'Garden egg is low-calorie and high in antioxidants. Boiling yam is far healthier than frying.',
  },
  {
    id:'h2', name:'Grilled Fish & Vegetables', emoji:'🐟', category:'Healthy & Diet',
    dietTags:['weight-loss','low-calorie','high-protein','diabetic'],
    calories:280, protein:35, carbs:12, fat:8, servings:2, cookTime:25, difficulty:'Easy',
    cost:6000,
    ingredients:['2 medium tilapia (₦3,000)','carrots (₦600)','cabbage (₦800)','1 onion','lemon (₦300)','1 tsp vegetable oil','pepper soup spice','salt','thyme'],
    steps:[
      'Score fish with a knife. Rub with pepper soup spice, salt, thyme, and lemon juice. Marinate 10 minutes.',
      'Grill fish on high heat or in oven at 200°C for 12–15 minutes, turning once.',
      'While fish grills, stir-fry shredded cabbage and sliced carrots in 1 tsp oil for 5 minutes.',
      'Serve fish with the stir-fried vegetables. Squeeze lemon on top.',
    ],
    healthNote:'Grilling eliminates added fats. Fish is an excellent lean protein source with omega-3s.',
  },
  {
    id:'h3', name:'Moi Moi (Steamed, No Fry)', emoji:'🟤', category:'Healthy & Diet',
    dietTags:['high-protein','high-fiber','vegetarian','diabetic'],
    calories:220, protein:18, carbs:28, fat:5, servings:4, cookTime:60, difficulty:'Medium',
    cost:3500,
    ingredients:['3 cups peeled black-eyed beans (₦2,200)','2 peppers','1 onion','1 tbsp vegetable oil (reduced)','1 egg','crayfish','seasoning','salt'],
    steps:[
      'Blend beans smooth with peppers, onion, and minimal water.',
      'Add just 1 tbsp oil (instead of the usual ¼ cup), crayfish, seasoning, salt. Mix well.',
      'Pour into foil cups or leaves. Add egg slice per cup.',
      'Steam 45–50 minutes. This version has 60% less fat than regular moi moi.',
    ],
    healthNote:'High plant protein, low fat. One of the most nutritious Nigerian foods when prepared with minimal oil.',
  },
  {
    id:'h4', name:'Okra Soup (Light Oil)', emoji:'🫑', category:'Healthy & Diet',
    dietTags:['low-calorie','high-fiber','weight-loss'],
    calories:180, protein:22, carbs:10, fat:7, servings:4, cookTime:35, difficulty:'Easy',
    cost:8000,
    ingredients:['500g fresh okra (₦2,500)','300g chicken breast (₦1,440)','1 tbsp palm oil (reduced)','crayfish','peppers','onion','seasoning','salt'],
    steps:[
      'Cook chicken breast with seasoning, onion, salt. Shred. Reserve stock.',
      'Finely chop okra.',
      'Heat just 1 tbsp palm oil (instead of 3). Add peppers and fry 3 minutes.',
      'Add chicken, stock, crayfish, seasoning. Boil.',
      'Add okra. Stir. Cook uncovered 8 minutes.',
      'Serve with eba made from less garri (reduce portion).',
    ],
    healthNote:'Okra is high in fiber and helps regulate blood sugar. Reducing palm oil cuts calories by ~200.',
  },
  {
    id:'h5', name:'Oatmeal Swallow', emoji:'🌾', category:'Healthy & Diet',
    dietTags:['weight-loss','high-fiber','diabetic','low-calorie'],
    calories:210, protein:7, carbs:38, fat:4, servings:2, cookTime:10, difficulty:'Easy',
    cost:1500,
    ingredients:['2 cups rolled oats (₦800)','3 cups water','salt to taste'],
    steps:[
      'Bring water to boil in a pot.',
      'Add oats and stir vigorously on medium-low heat.',
      'Continue stirring for 5–7 minutes until it forms a smooth, stretchy swallow consistency.',
      'Serve hot with any light soup (pepper soup, efo riro, or light okra).',
    ],
    healthNote:'Oatmeal swallow has 3× the fiber of eba. Keeps you full longer, excellent for weight loss and diabetes management.',
  },
  {
    id:'h6', name:'Cabbage Stir Fry', emoji:'🥬', category:'Healthy & Diet',
    dietTags:['weight-loss','low-calorie','vegetarian','keto'],
    calories:120, protein:6, carbs:14, fat:5, servings:3, cookTime:15, difficulty:'Easy',
    cost:2500,
    ingredients:['1 medium cabbage (₦800)','carrots (₦600)','2 eggs (₦260)','1 tsp vegetable oil','onion','peppers','seasoning','salt','soy sauce optional'],
    steps:[
      'Shred cabbage and slice carrots thinly.',
      'Heat oil in a wide pan. Scramble eggs, push to side.',
      'Add onion, peppers, fry 1 minute.',
      'Add cabbage and carrots. Toss on high heat for 5–6 minutes — keep crunchy.',
      'Season. Serve alone or as a side dish.',
    ],
    healthNote:'Very low calorie, high in vitamins C and K. Excellent weight-loss side dish or light meal.',
  },
  {
    id:'h7', name:'Beans & Plantain (Balanced)', emoji:'🫘', category:'Healthy & Diet',
    dietTags:['high-protein','high-fiber','weight-loss'],
    calories:380, protein:16, carbs:65, fat:7, servings:3, cookTime:50, difficulty:'Easy',
    cost:4000,
    ingredients:['2 cups brown beans (₦2,200)','1 unripe plantain (₦500)','1 tbsp palm oil','onion','peppers','seasoning','crayfish','salt'],
    steps:[
      'Cook beans until soft. Add palm oil, peppers, onion, crayfish, seasoning.',
      'Slice plantain (unripe — lower sugar) into chunks. Add to beans.',
      'Cook together for 10 more minutes.',
      'Serve as a complete balanced meal.',
    ],
    healthNote:'Beans + plantain = complete protein + complex carbs. Unripe plantain has a lower glycemic index than ripe.',
  },
  {
    id:'h8', name:'Chicken Pepper Soup', emoji:'🌶️', category:'Healthy & Diet',
    dietTags:['high-protein','low-calorie','weight-loss','diabetic'],
    calories:190, protein:30, carbs:5, fat:6, servings:3, cookTime:40, difficulty:'Easy',
    cost:7000,
    ingredients:['500g chicken breast (₦2,400)','pepper soup spice (₦400)','uziza leaves (₦400)','scotch bonnet','onion','crayfish','seasoning','salt'],
    steps:[
      'Season chicken with onion, seasoning, salt, half the pepper soup spice. Steam 10 minutes.',
      'Add 4 cups water. Cook 20 minutes.',
      'Add scotch bonnets, crayfish, remaining spice.',
      'Simmer 10 minutes. Add uziza leaves. Cook 3 minutes.',
      'Serve as a light, filling meal — no starchy side needed.',
    ],
    healthNote:'Under 200 calories per serving. Zero carbs. One of the most effective weight-loss Nigerian meals.',
  },
  {
    id:'h9', name:'Brown Rice Jollof', emoji:'🍚', category:'Healthy & Diet',
    dietTags:['high-fiber','diabetic','weight-loss'],
    calories:340, protein:12, carbs:52, fat:8, servings:4, cookTime:70, difficulty:'Medium',
    cost:9500,
    ingredients:['1kg brown rice (₦3,500)','tomatoes','peppers','onion','3 tbsp vegetable oil (reduced)','chicken 400g (₦1,920)','seasoning','thyme','curry','salt'],
    steps:[
      'Brown rice takes longer — soak for 30 minutes before cooking.',
      'Prepare tomato stew as usual but use only 3 tbsp oil instead of ½ cup.',
      'Add brown rice and cook on low heat 45–50 minutes (longer than white rice).',
      'Check halfway and add water if needed. Result is nuttier and more filling.',
    ],
    healthNote:'Brown rice has 3× the fiber of white rice, lower glycemic index, and more vitamins. Use less oil for fewer calories.',
  },
  {
    id:'h10', name:'Garden Salad (Nigerian Style)', emoji:'🥗', category:'Healthy & Diet',
    dietTags:['weight-loss','low-calorie','vegetarian','keto'],
    calories:140, protein:7, carbs:12, fat:6, servings:2, cookTime:10, difficulty:'Easy',
    cost:2500,
    ingredients:['cabbage shredded (₦500)','carrots grated (₦400)','cucumber (₦500)','tomatoes (₦400)','boiled eggs (₦260)','lemon (₦200)','1 tsp olive or vegetable oil','salt','pepper'],
    steps:[
      'Shred cabbage, grate carrots, slice cucumber and tomatoes.',
      'Toss all vegetables together.',
      'Make dressing: lemon juice + oil + salt + pepper. Whisk.',
      'Pour dressing over salad. Slice eggs on top.',
      'Serve immediately. Add boiled chicken or tuna for more protein.',
    ],
    healthNote:'Zero unhealthy fats. Very low calorie. This simple salad is one of the most effective daily habits for weight loss.',
  },
  // ── International Meals Made in Nigeria ──
  {
    id:'h11', name:'Chicken Salad Bowl', emoji:'🥗', category:'Healthy & Diet',
    dietTags:['high-protein','weight-loss','low-calorie','keto'],
    calories:280, protein:34, carbs:10, fat:9, servings:2, cookTime:20, difficulty:'Easy',
    cost:5500,
    ingredients:['300g grilled chicken breast (₦1,440)','cabbage (₦500)','carrots (₦400)','cucumber (₦500)','tomatoes (₦500)','lemon juice','1 tsp vegetable oil','salt, pepper'],
    steps:[
      'Grill or boil chicken breast. Slice into strips.',
      'Prepare vegetable base: shred cabbage, grate carrots, slice cucumber and tomatoes.',
      'Dress with lemon juice, a drizzle of oil, salt, and pepper.',
      'Top with chicken strips. Serve chilled or at room temperature.',
    ],
    healthNote:'High protein, very low carb. Cabbage is widely available in Nigeria as a substitute for lettuce.',
  },
  {
    id:'h12', name:'Tuna Vegetable Bowl', emoji:'🐟', category:'Healthy & Diet',
    dietTags:['high-protein','low-calorie','keto','weight-loss'],
    calories:220, protein:28, carbs:8, fat:7, servings:2, cookTime:10, difficulty:'Easy',
    cost:4500,
    ingredients:['1 tin tuna in brine (₦1,500)','cabbage (₦500)','carrots (₦400)','cucumber (₦500)','1 boiled egg (₦130)','lemon juice','salt, pepper'],
    steps:[
      'Drain tuna. Shred cabbage, grate carrots, slice cucumber.',
      'Mix tuna with vegetables. Add lemon juice, salt, and pepper.',
      'Slice egg on top. Serve immediately.',
    ],
    healthNote:'Tinned tuna is one of the most affordable high-protein foods available in Nigerian supermarkets.',
  },
  {
    id:'h13', name:'Egg & Veggie Wrap', emoji:'🌯', category:'Healthy & Diet',
    dietTags:['high-protein','low-calorie','weight-loss'],
    calories:260, protein:18, carbs:22, fat:10, servings:2, cookTime:15, difficulty:'Easy',
    cost:2500,
    ingredients:['3 eggs (₦380)','cabbage shredded (₦300)','carrots (₦300)','2 peppers','1 onion','1 tsp oil','salt','2 flatbreads or tortillas (₦600)'],
    steps:[
      'Scramble eggs with peppers and onion in 1 tsp oil.',
      'Stir-fry cabbage and carrots in the same pan for 2 minutes.',
      'Warm flatbread. Fill with egg and vegetable mixture.',
      'Roll up and serve. Optionally add a drop of hot sauce.',
    ],
    healthNote:'Good protein-to-carb balance. Cabbage and carrots add fiber and crunch without extra calories.',
  },
  {
    id:'h14', name:'Oat Pancakes', emoji:'🥞', category:'Healthy & Diet',
    dietTags:['high-fiber','weight-loss','low-calorie'],
    calories:210, protein:10, carbs:30, fat:5, servings:3, cookTime:20, difficulty:'Easy',
    cost:1800,
    ingredients:['2 cups rolled oats blended (₦800)','2 eggs (₦260)','1 cup milk or water (₦300)','1 ripe banana mashed (₦300)','½ tsp baking powder','1 tsp vegetable oil','cinnamon'],
    steps:[
      'Blend oats into flour consistency.',
      'Mix oat flour, eggs, milk, mashed banana, baking powder, and cinnamon.',
      'Heat a pan with minimal oil. Pour ladleful of batter. Cook 2 min per side.',
      'Serve with honey or sliced fruit — skip the butter and syrup.',
    ],
    healthNote:'Oat pancakes have 40% fewer calories than regular flour pancakes and far more fiber. Banana replaces sugar.',
  },
  {
    id:'h15', name:'Grilled Chicken Bowl', emoji:'🍗', category:'Healthy & Diet',
    dietTags:['high-protein','low-calorie','keto','weight-loss'],
    calories:300, protein:38, carbs:14, fat:8, servings:2, cookTime:30, difficulty:'Easy',
    cost:6000,
    ingredients:['400g chicken breast (₦1,920)','brown rice 100g (₦350)','stir-fried vegetables (cabbage, carrot, pepper)','lemon, garlic, thyme','1 tsp olive or vegetable oil','salt, pepper'],
    steps:[
      'Marinate chicken in lemon, garlic, thyme, salt, pepper. Grill 12–15 min.',
      'Cook small portion of brown rice.',
      'Stir-fry vegetables in 1 tsp oil for 5 minutes.',
      'Assemble bowl: rice base, vegetables, grilled chicken on top.',
    ],
    healthNote:'Classic clean eating bowl. Protein + complex carb + vegetables in one meal.',
  },
  {
    id:'h16', name:'Vegetable Omelette', emoji:'🍳', category:'Healthy & Diet',
    dietTags:['high-protein','low-calorie','keto','vegetarian'],
    calories:200, protein:16, carbs:6, fat:12, servings:2, cookTime:12, difficulty:'Easy',
    cost:2000,
    ingredients:['4 eggs (₦500)','cabbage (₦300)','carrots (₦300)','onion','peppers','1 tsp vegetable oil','salt, seasoning'],
    steps:[
      'Whisk eggs with salt.',
      'Sauté onion, peppers, cabbage, and carrot in 1 tsp oil for 2 minutes.',
      'Pour eggs over vegetables. Cook on low-medium heat.',
      'Fold once edges are set. Serve immediately.',
    ],
    healthNote:'One of the fastest high-protein meals. Excellent for breakfast or a light dinner.',
  },
  {
    id:'h17', name:'Baked Sweet Potatoes', emoji:'🍠', category:'Healthy & Diet',
    dietTags:['high-fiber','weight-loss','vegetarian','diabetic'],
    calories:160, protein:3, carbs:37, fat:0, servings:2, cookTime:45, difficulty:'Easy',
    cost:2000,
    ingredients:['2 medium sweet potatoes (₦1,500)','½ tsp cinnamon','salt','optional: honey drizzle'],
    steps:[
      'Scrub sweet potatoes clean. Prick with fork all over.',
      'Place in oven at 200°C for 40–45 minutes until soft.',
      'Split open. Sprinkle cinnamon and a pinch of salt.',
      'Serve as a healthy breakfast or snack. Optionally add Greek yogurt.',
    ],
    healthNote:'Lower glycemic index than regular yam. No added fat. Naturally sweet and filling.',
  },
  {
    id:'h18', name:'High-Protein Egg Sauce', emoji:'🥚', category:'Healthy & Diet',
    dietTags:['high-protein','weight-loss','keto'],
    calories:180, protein:20, carbs:8, fat:8, servings:2, cookTime:15, difficulty:'Easy',
    cost:2500,
    ingredients:['5 eggs (₦630)','2 tomatoes (₦600)','peppers','1 onion','1 tsp vegetable oil (reduced)','100g chicken breast cooked (₦480)','seasoning','salt'],
    steps:[
      'Heat 1 tsp oil — much less than usual.',
      'Sauté onion, tomatoes, peppers 4 minutes.',
      'Add shredded chicken breast.',
      'Add eggs (5 instead of 3). Scramble to preferred consistency.',
      'Serve with boiled yam or oatmeal swallow.',
    ],
    healthNote:'30g protein per serving. Using 5 eggs + chicken with minimal oil makes this a gym-friendly meal.',
  },
];

// "Healthy Version" substitution map for existing meals
const HEALTHY_SWAPS = {
  1:  { name:'Healthy Brown Rice Jollof', swaps:['White rice → Brown rice','½ cup oil → 2 tbsp oil','Fry chicken → Grill chicken'], calSaving:'~400 cal less per pot' },
  2:  { name:'Low-Cal Fried Rice', swaps:['White rice → Brown or cauliflower rice','3 eggs → 4 eggs, reduce oil by half','Skip soy sauce excess salt'], calSaving:'~300 cal less per serving' },
  4:  { name:'Light White Rice & Stew', swaps:['Reduce oil in stew to 2 tbsp','Steam chicken instead of frying','Add more vegetables to stew'], calSaving:'~250 cal less per serving' },
  6:  { name:'High-Protein Egg Sauce', swaps:['3 eggs → 5 eggs','3 tbsp oil → 1 tsp oil','Add grilled chicken breast'], calSaving:'More protein, ~120 cal less' },
  7:  { name:'Reduced-Oil Egusi', swaps:['3 tbsp palm oil → 1 tbsp','More vegetable, less meat','Skip stockfish to reduce sodium'], calSaving:'~200 cal less per serving' },
  19: { name:'Healthy Yam & Egg Sauce', swaps:['Boiled yam (not fried)','3 tbsp oil → 1 tsp','Add garden eggs or spinach to sauce'], calSaving:'~180 cal less' },
};

// Diet filter labels
const DIET_FILTERS = [
  { key:'all',         label:'All Healthy' },
  { key:'weight-loss', label:'⚖️ Weight Loss' },
  { key:'low-calorie', label:'🔥 Low Calorie' },
  { key:'high-protein',label:'💪 High Protein' },
  { key:'high-fiber',  label:'🌾 High Fiber' },
  { key:'keto',        label:'🥑 Keto' },
  { key:'vegetarian',  label:'🥦 Vegetarian' },
  { key:'diabetic',    label:'🩺 Diabetic-Friendly' },
];

function renderHealthyRecipes() {
  const activeFilter = state.dietFilter || 'all';
  const filtered = activeFilter === 'all'
    ? HEALTHY_RECIPES
    : HEALTHY_RECIPES.filter(r => r.dietTags.includes(activeFilter));

  const grid = document.getElementById('healthyRecipeGrid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🥗</div><p>No recipes match this filter.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="healthy-recipe-card" data-id="${r.id}">
      <div class="healthy-recipe-emoji">${r.emoji}</div>
      <div class="healthy-recipe-name">${r.name}</div>
      <div class="healthy-recipe-tags">
        ${r.dietTags.slice(0,2).map(t => `<span class="diet-tag">${t.replace('-',' ')}</span>`).join('')}
      </div>
      <div class="healthy-recipe-macros">
        <span class="macro cal">🔥 ${r.calories} cal</span>
        <span class="macro pro">💪 ${r.protein}g P</span>
        <span class="macro carb">🌾 ${r.carbs}g C</span>
        <span class="macro fat">🫒 ${r.fat}g F</span>
      </div>
      <div class="healthy-recipe-meta">⏱ ${r.cookTime}min · ${r.difficulty} · ${fmt(r.cost)}</div>
    </div>`).join('');

  grid.querySelectorAll('.healthy-recipe-card').forEach(card => {
    card.addEventListener('click', () => openHealthyRecipeDetail(card.dataset.id));
  });
}

function openHealthyRecipeDetail(id) {
  const recipe = HEALTHY_RECIPES.find(r => r.id === id);
  if (!recipe) return;

  const html = `
    <div class="modal-meal-header">
      <div class="modal-meal-emoji">${recipe.emoji}</div>
      <div class="modal-meal-name">${recipe.name}</div>
      <div class="modal-tags">
        <span class="modal-tag tag-green">${recipe.category}</span>
        <span class="modal-tag tag-orange">⏱ ${recipe.cookTime}min</span>
        <span class="modal-tag" style="background:rgba(14,122,61,0.12);color:var(--green)">${recipe.difficulty}</span>
      </div>
    </div>

    <div class="macro-panel">
      <div class="macro-box"><div class="macro-val">${recipe.calories}</div><div class="macro-lbl">Calories</div></div>
      <div class="macro-box"><div class="macro-val">${recipe.protein}g</div><div class="macro-lbl">Protein</div></div>
      <div class="macro-box"><div class="macro-val">${recipe.carbs}g</div><div class="macro-lbl">Carbs</div></div>
      <div class="macro-box"><div class="macro-val">${recipe.fat}g</div><div class="macro-lbl">Fat</div></div>
    </div>

    <div style="background:rgba(14,122,61,0.08);border-left:3px solid var(--green);border-radius:8px;padding:10px 12px;font-size:0.8rem;color:var(--green);margin-bottom:14px">
      💡 ${recipe.healthNote}
    </div>

    <div class="modal-section">
      <h4>Diet Tags</h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
        ${recipe.dietTags.map(t=>`<span class="diet-tag large">${t.replace(/-/g,' ')}</span>`).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h4>Ingredients · ${fmt(recipe.cost)} · ${recipe.servings} servings</h4>
      <ul class="modal-ingredient-list">${recipe.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>

    <div class="modal-section">
      <h4>Method (${recipe.cookTime} min)</h4>
      <ol class="modal-step-list">${recipe.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    </div>`;

  openModal(html);
}

// "Healthy Version" button logic — called from existing meal detail modal
function openHealthyVersion(mealId) {
  const swap = HEALTHY_SWAPS[mealId];
  const meal = getMealById(mealId);
  if (!swap || !meal) return;

  const html = `
    <div class="modal-meal-header">
      <div class="modal-meal-emoji">🥗</div>
      <div class="modal-meal-name">${swap.name}</div>
      <div class="modal-tags">
        <span class="modal-tag tag-green">Healthy Version</span>
        <span class="modal-tag" style="background:rgba(14,122,61,0.12);color:var(--green)">${swap.calSaving}</span>
      </div>
    </div>
    <div style="background:rgba(14,122,61,0.08);border-left:3px solid var(--green);border-radius:8px;padding:12px;margin-bottom:14px">
      <p style="font-size:0.82rem;font-weight:600;color:var(--green);margin-bottom:8px">🔄 Ingredient Swaps:</p>
      ${swap.swaps.map(s=>`<div style="font-size:0.8rem;padding:4px 0;border-bottom:1px solid rgba(14,122,61,0.1)">${s}</div>`).join('')}
    </div>
    <div class="modal-section">
      <h4>Original Recipe: ${meal.name}</h4>
      <ul class="modal-ingredient-list">${meal.ingredients.map(i=>`<li>${capitalize(i)}</li>`).join('')}</ul>
    </div>
    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:12px;text-align:center">Apply these substitutions to the original recipe steps. The method stays the same — only ingredients change.</p>`;

  openModal(html);
}

window.openHealthyVersion = openHealthyVersion;
