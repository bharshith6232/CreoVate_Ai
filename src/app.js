import { api } from './api.js';

// State management
const state = {
  currentView: 'home',
  selectedCreatorId: 'kiara-mehta',
  activeProfileTab: 'about',
  activeCategory: 'All',
  filters: {
    q: '',
    category: 'All',
    platform: 'All',
    maxBudget: 50000,
    deliveryDays: null,
    aiModels: [],
    specializations: [],
    licensing: [],
    sortBy: 'relevance'
  },
  favorites: new Set(['kiara-mehta']),
  matchedCreators: null
};

// Toast notification helper
export function showToast(message, type = 'success') {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-on-primary font-label-md transition-all duration-300 transform translate-y-10 opacity-0';
    document.body.appendChild(toast);
  }
  toast.style.backgroundColor = type === 'success' ? '#006948' : '#ba1a1a';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${type === 'success' ? 'check_circle' : 'error'}</span>
    <span>${message}</span>
  `;
  toast.classList.remove('translate-y-10', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
  }, 3500);
}

// Router
export function navigateTo(view, params = {}) {
  state.currentView = view;
  if (params.creatorId) {
    state.selectedCreatorId = params.creatorId;
  }
  if (params.category) {
    state.filters.category = params.category;
  }
  if (params.q !== undefined) {
    state.filters.q = params.q;
  }

  // Update hash
  if (view === 'profile') {
    window.location.hash = `#profile?id=${state.selectedCreatorId}`;
  } else {
    window.location.hash = `#${view}`;
  }

  // Toggle view containers
  const views = ['home', 'marketplace', 'profile', 'campaign'];
  views.forEach(v => {
    const el = document.getElementById(`${v}-view`);
    if (el) {
      if (v === view) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render view-specific data
  if (view === 'marketplace') {
    loadMarketplace();
  } else if (view === 'profile') {
    loadProfile(state.selectedCreatorId);
  }

  updateCategorySubnavActiveState();
}

// Category Subnav highlighting
function updateCategorySubnavActiveState() {
  document.querySelectorAll('#category-subnav a').forEach(a => {
    const cat = a.getAttribute('data-category');
    if (state.currentView === 'marketplace' && state.filters.category.toLowerCase() === (cat || '').toLowerCase()) {
      a.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
      a.classList.remove('text-on-surface-variant');
    } else {
      a.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
      a.classList.add('text-on-surface-variant');
    }
  });
}

// --------------------------------------------------------------------------
// Marketplace Logic
// --------------------------------------------------------------------------
async function loadMarketplace() {
  const container = document.getElementById('marketplace-cards-grid');
  const countEl = document.getElementById('marketplace-results-count');
  const matchedBanner = document.getElementById('matched-campaign-banner');

  if (state.matchedCreators && state.matchedCreators.length > 0) {
    if (matchedBanner) matchedBanner.classList.remove('hidden');
    renderCreatorCards(state.matchedCreators, container);
    if (countEl) countEl.innerHTML = `Showing <span class="font-semibold text-on-surface">${state.matchedCreators.length}</span> algorithmically matched creators`;
    return;
  } else {
    if (matchedBanner) matchedBanner.classList.add('hidden');
  }

  if (container) {
    container.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="font-body-sm">Querying verified creators from Python & Pandas engine...</p>
      </div>
    `;
  }

  const res = await api.getCreators(state.filters);
  const creators = res.creators || [];

  if (countEl) {
    countEl.innerHTML = `Showing <span class="font-semibold text-on-surface">1 - ${creators.length}</span> of ${res.total_count || 480} verified creators`;
  }

  renderCreatorCards(creators, container);
}

function renderCreatorCards(creators, container) {
  if (!container) return;

  if (creators.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30">
        <span class="material-symbols-outlined text-[48px] text-primary mb-2">person_search</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface">No creators match your active filters</h3>
        <p class="font-body-md text-on-surface-variant mt-1">Try widening your budget range or selecting different AI tools.</p>
        <button id="reset-all-filters-btn" class="mt-4 px-5 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm">Reset Filters</button>
      </div>
    `;
    document.getElementById('reset-all-filters-btn')?.addEventListener('click', resetFilters);
    return;
  }

  container.innerHTML = creators.map(c => {
    const isFav = state.favorites.has(c.id);
    const tagsHtml = (c.ai_models || []).slice(0, 3).map((m, idx) => `
      <span class="px-2 py-0.5 rounded-full bg-surface-container font-label-xs text-[11px] text-primary font-medium flex items-center gap-1">
        ${idx === 0 ? '<span class="material-symbols-outlined text-[12px]">auto_awesome</span>' : ''}${m}
      </span>
    `).join('');

    const matchBadge = c.match_score ? `
      <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-xs text-label-xs font-bold shadow-md flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
        <span>${c.match_score}% Match</span>
      </div>
    ` : '';

    return `
      <div class="creator-card group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer" data-id="${c.id}">
        <div class="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${c.hero_image || c.avatar}" alt="${c.name}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          ${matchBadge}

          <button class="favorite-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white ${isFav ? 'text-error' : ''} hover:text-error transition-colors" data-id="${c.id}" type="button">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' ${isFav ? 1 : 0};">favorite</span>
          </button>
          
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-10 h-10 rounded-full bg-on-background/50 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            </div>
          </div>
          
          <div class="absolute bottom-3 right-3">
            <span class="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white font-label-xs text-label-xs font-semibold">${c.badge || 'Verified'}</span>
          </div>
        </div>

        <div class="p-4 flex flex-col flex-1 justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <img class="w-9 h-9 rounded-full object-cover shrink-0" src="${c.avatar || c.hero_image}" alt="${c.name}">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">${c.name}</h3>
                  <span class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 text-[10px]">
                    <span class="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${c.title}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 pt-0.5">
              ${tagsHtml}
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-tertiary" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="font-label-sm text-label-sm text-on-surface font-bold">${c.rating}</span>
                <span class="text-outline font-body-sm text-body-sm">(${c.reviews_count || 50})</span>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/30 text-primary font-label-xs text-[11px] font-semibold">
                <span class="material-symbols-outlined text-[12px]">verified</span>ProcessProof™
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-label-xs pt-0.5">
              <span>Format: ${(c.formats || ['9:16 Vertical'])[0]}</span>
              <span class="text-primary font-medium flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[12px]">shield</span>Clean IP
              </span>
            </div>
          </div>

          <div class="pt-3 mt-3 flex items-center justify-between border-t border-outline-variant/30">
            <div>
              <span class="text-outline block font-label-xs">From</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-bold">₹${(c.price_from || 2000).toLocaleString()}</span>
            </div>
            <button class="book-card-btn px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm transition-colors" data-id="${c.id}" type="button">Book</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach card click handlers
  container.querySelectorAll('.creator-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn') || e.target.closest('.book-card-btn')) return;
      const cid = card.getAttribute('data-id');
      navigateTo('profile', { creatorId: cid });
    });
  });

  // Favorite button click
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-id');
      const res = await api.toggleFavorite(cid);
      if (res && res.is_favorite) {
        state.favorites.add(cid);
        btn.classList.add('text-error');
        btn.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 1";
        showToast('Saved creator to favorites');
      } else {
        state.favorites.delete(cid);
        btn.classList.remove('text-error');
        btn.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 0";
        showToast('Removed from favorites');
      }
    });
  });

  // Book button click
  container.querySelectorAll('.book-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-id');
      openBookingModal(cid);
    });
  });
}

// --------------------------------------------------------------------------
// Creator Profile Logic
// --------------------------------------------------------------------------
async function loadProfile(creatorId) {
  const creator = await api.getCreatorDetail(creatorId);
  if (!creator) return;

  // Header info
  document.getElementById('profile-name').textContent = creator.name;
  document.getElementById('profile-title').textContent = creator.title;
  document.getElementById('profile-rating').textContent = creator.rating;
  document.getElementById('profile-reviews-count').textContent = `(${creator.reviews_count || 120} reviews)`;
  document.getElementById('profile-projects').textContent = `${creator.completed_projects || 500}+`;
  document.getElementById('profile-location').textContent = creator.location || 'India';
  document.getElementById('profile-bio').textContent = creator.bio || '';
  
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) avatarEl.src = creator.avatar || creator.hero_image;

  const introVideoThumb = document.getElementById('profile-intro-thumb');
  if (introVideoThumb) introVideoThumb.src = creator.intro_video_thumb || creator.hero_image;

  // Tool tags
  const toolTagsEl = document.getElementById('profile-tool-tags');
  if (toolTagsEl && creator.ai_models) {
    toolTagsEl.innerHTML = creator.ai_models.map(m => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest border border-outline-variant/30 font-label-xs text-label-xs text-on-surface font-medium">
        <span class="material-symbols-outlined text-primary text-[14px]">check</span>${m}
      </span>
    `).join('');
  }

  // Skills
  const skillsEl = document.getElementById('profile-skills');
  if (skillsEl && creator.skills) {
    skillsEl.innerHTML = creator.skills.map((s, i) => `
      <span class="px-3 py-1.5 rounded-lg ${i === 0 ? 'bg-secondary-fixed/50 text-on-secondary-fixed font-semibold' : 'bg-surface-container-low text-on-surface'} font-label-sm text-label-sm">${s}</span>
    `).join('');
  }

  // Hardware specs
  const hw = creator.hardware_specs || {};
  document.getElementById('spec-base-models').textContent = hw.base_models || 'Midjourney v6, Runway Gen-3 Alpha, Kling AI';
  document.getElementById('spec-hardware-rig').textContent = hw.rig || 'Dedicated Dual RTX 4090 Station, ComfyUI Nodes';
  document.getElementById('spec-guarantee').textContent = hw.guarantee || '100% Commercial Cleared & Enterprise Model Certified';

  // Featured Work / Portfolio
  const portfolioContainer = document.getElementById('profile-portfolio-grid');
  if (portfolioContainer && creator.portfolio) {
    if (creator.portfolio.length === 0) {
      portfolioContainer.innerHTML = `
        <div class="col-span-full py-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant font-body-sm">
          No public portfolio items configured for this creator yet.
        </div>
      `;
    } else {
      portfolioContainer.innerHTML = creator.portfolio.map(item => `
        <div class="group relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-container shadow-sm cursor-pointer">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${item.image}" alt="${item.title}">
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex flex-col justify-between p-3">
            <div class="flex items-start justify-between gap-1">
              <div class="flex flex-wrap gap-1">
                <span class="px-2 py-0.5 rounded bg-inverse-surface/70 backdrop-blur text-on-primary font-label-xs text-label-xs font-medium flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[12px] text-secondary-fixed">auto_awesome</span>${item.pipeline}
                </span>
                <span class="px-1.5 py-0.5 rounded bg-inverse-surface/60 backdrop-blur text-inverse-on-surface/80 font-label-xs text-label-xs">${item.aspect_ratio}</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-inverse-surface/60 backdrop-blur text-on-primary font-label-xs text-label-xs flex items-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-[12px]">visibility</span>${item.views}
              </span>
            </div>
            
            <div class="space-y-2">
              <div>
                <div class="flex items-center gap-1.5">
                  <p class="text-on-primary font-label-sm text-label-sm font-semibold leading-tight">${item.title}</p>
                  <span class="material-symbols-outlined text-secondary-fixed text-[14px]">check_circle</span>
                </div>
                <p class="text-inverse-on-surface/80 font-label-xs text-label-xs">${item.subtitle}</p>
              </div>
              
              <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                <button class="prompt-recipe-btn inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur text-on-surface font-label-xs text-label-xs font-semibold hover:bg-surface-container-lowest transition-colors" data-id="${item.id}" type="button">
                  <span class="material-symbols-outlined text-[13px] text-primary">receipt_long</span>Prompt Recipe
                </button>
                <div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-[16px] ml-0.5" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // Prompt recipe button clicks
      portfolioContainer.querySelectorAll('.prompt-recipe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = btn.getAttribute('data-id');
          const workItem = creator.portfolio.find(p => p.id === pId);
          if (workItem && workItem.prompt_recipe) {
            openRecipeModal(workItem);
          }
        });
      });
    }
  }

  // Profile hire button
  const hireBtn = document.getElementById('profile-hire-btn');
  if (hireBtn) {
    hireBtn.onclick = () => openBookingModal(creator.id);
  }
}

// --------------------------------------------------------------------------
// Modals (Recipe, Booking, Video)
// --------------------------------------------------------------------------
function openRecipeModal(item) {
  const modal = document.getElementById('recipe-modal');
  if (!modal) return;
  const recipe = item.prompt_recipe;

  document.getElementById('recipe-title').textContent = `${item.title} — Prompt Recipe`;
  document.getElementById('recipe-model').textContent = recipe.model || 'Runway Gen-3 / Midjourney v6';
  document.getElementById('recipe-seed').textContent = recipe.seed || '482910482';
  document.getElementById('recipe-steps').textContent = `${recipe.steps || 30} steps | CFG ${recipe.cfg_scale || 7.0}`;
  document.getElementById('recipe-positive-prompt').textContent = recipe.positive_prompt;
  document.getElementById('recipe-negative-prompt').textContent = recipe.negative_prompt || 'None';

  modal.classList.remove('hidden');

  const copyBtn = document.getElementById('recipe-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(recipe.positive_prompt);
      showToast('Copied Prompt Recipe to clipboard!');
    };
  }
}

function openBookingModal(creatorId) {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  const creator = api.getCreatorDetail(creatorId);

  modal.setAttribute('data-creator-id', creatorId);
  modal.classList.remove('hidden');
}

async function confirmBooking() {
  const modal = document.getElementById('booking-modal');
  const creatorId = modal.getAttribute('data-creator-id') || 'kiara-mehta';
  const tier = document.querySelector('input[name="booking-tier"]:checked')?.value || 'Standard';
  const amount = tier === 'Basic' ? 2500 : (tier === 'Premium' ? 12000 : 6000);

  const res = await api.bookCreator({
    creator_id: creatorId,
    tier,
    amount,
    client_name: 'Brand Partner'
  });

  if (res && res.success) {
    modal.classList.add('hidden');
    showToast(`Escrow Contract Created! ${res.escrow_id}`);
    
    // Show certificate modal
    const certModal = document.getElementById('certificate-modal');
    if (certModal) {
      document.getElementById('cert-booking-id').textContent = res.booking_id;
      document.getElementById('cert-escrow-id').textContent = res.escrow_id;
      document.getElementById('cert-amount').textContent = `₹${amount.toLocaleString()}`;
      certModal.classList.remove('hidden');
    }
  }
}

// --------------------------------------------------------------------------
// Smart Brief Builder Flow
// --------------------------------------------------------------------------
function setupSmartBrief() {
  const enhanceBtn = document.getElementById('enhanceAiBtn');
  const descTextarea = document.getElementById('campaignDescription');
  const form = document.getElementById('smartBriefForm');

  if (enhanceBtn && descTextarea) {
    enhanceBtn.addEventListener('click', async () => {
      const currentText = descTextarea.value.trim() || "We are a skincare brand launching a soothing vitamin C cleanser. We need 3-5 authentic lifestyle UGC creators for unboxing and texture demo.";
      const res = await api.refineBrief(currentText);
      if (res) {
        descTextarea.value = res.enhanced_text;
        
        // Update signals
        document.getElementById('signal-style').textContent = res.signals.style;
        document.getElementById('signal-aspect').textContent = res.signals.aspect;
        document.getElementById('signal-audio').textContent = res.signals.audio;
        document.getElementById('signal-pipeline').textContent = res.signals.pipeline;
        
        showToast('Brief refined with AI Deconstruction!');
      }
    });
  }

  // Platform Chip Toggle
  document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('bg-primary');
      chip.classList.toggle('text-on-primary');
      chip.classList.toggle('bg-surface-container-low');
      chip.classList.toggle('text-on-surface-variant');
    });
  });

  // Content Type Chip Toggle
  document.querySelectorAll('.content-type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.content-type-chip').forEach(c => {
        c.classList.remove('bg-primary', 'text-on-primary');
        c.classList.add('bg-surface-container-low', 'text-on-surface-variant');
      });
      chip.classList.add('bg-primary', 'text-on-primary');
      chip.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
    });
  });

  // Submit Brief
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('campaignTitle')?.value || 'Skincare UGC Reel';
      const description = descTextarea?.value || 'UGC video campaign';
      const submitBtn = document.getElementById('submitBriefBtn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Matching CreativeTwins...</span>
        `;
      }

      const matchRes = await api.matchCampaign({
        title,
        description,
        content_type: 'UGC Content',
        platforms: ['Instagram', 'TikTok']
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Find Matching Creators</span><span class="material-symbols-outlined text-[20px]">arrow_forward</span>`;
      }

      state.matchedCreators = matchRes.matches;
      showToast(`Matched ${matchRes.matches.length} creators with CreativeTwin algorithm!`);
      navigateTo('marketplace');
    });
  }
}

// Reset filters
function resetFilters() {
  state.filters = {
    q: '',
    category: 'All',
    platform: 'All',
    maxBudget: 50000,
    deliveryDays: null,
    aiModels: [],
    specializations: [],
    licensing: [],
    sortBy: 'relevance'
  };
  state.matchedCreators = null;

  document.querySelectorAll('#marketplace-filter-aside input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  const budgetInput = document.getElementById('budget-range-input');
  if (budgetInput) budgetInput.value = 50000;
  
  loadMarketplace();
  showToast('Filters reset');
}

// --------------------------------------------------------------------------
// Initialization & Global Event Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Navigation links
  document.querySelectorAll('[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path === 'marketplace' || path === 'explore') {
        state.matchedCreators = null;
        navigateTo('marketplace');
      } else if (path === 'become-a-creator' || path === 'create-campaign') {
        navigateTo('campaign');
      } else if (path === 'home') {
        navigateTo('home');
      }
    });
  });

  // Category sub-nav items
  document.querySelectorAll('#category-subnav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = a.getAttribute('data-category');
      state.filters.category = cat;
      state.matchedCreators = null;
      navigateTo('marketplace', { category: cat });
    });
  });

  // Search input in Header
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchBtn = document.getElementById('header-search-btn');
  function triggerHeaderSearch() {
    const q = headerSearchInput?.value.trim() || '';
    state.filters.q = q;
    state.matchedCreators = null;
    navigateTo('marketplace', { q });
  }
  headerSearchBtn?.addEventListener('click', triggerHeaderSearch);
  headerSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerHeaderSearch();
  });

  // Hero search
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroSearchBtn = document.getElementById('hero-search-btn');
  function triggerHeroSearch() {
    const q = heroSearchInput?.value.trim() || '';
    state.filters.q = q;
    state.matchedCreators = null;
    navigateTo('marketplace', { q });
  }
  heroSearchBtn?.addEventListener('click', triggerHeroSearch);
  heroSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerHeroSearch();
  });

  // Home Popular Tags
  document.querySelectorAll('.popular-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.textContent.trim();
      state.filters.q = tag;
      state.matchedCreators = null;
      navigateTo('marketplace', { q: tag });
    });
  });

  // Home Popular Category Cards
  document.querySelectorAll('.popular-cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      state.filters.category = cat;
      state.matchedCreators = null;
      navigateTo('marketplace', { category: cat });
    });
  });

  // Marketplace filter changes
  document.getElementById('budget-range-input')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('budget-display-val').textContent = `₹${val.toLocaleString()}`;
    state.filters.maxBudget = val;
    loadMarketplace();
  });

  document.getElementById('sort-dropdown')?.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    loadMarketplace();
  });

  // Category filter aside checkboxes
  document.querySelectorAll('.category-filter-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        document.querySelectorAll('.category-filter-checkbox').forEach(other => {
          if (other !== cb) other.checked = false;
        });
        state.filters.category = cb.value;
      } else {
        state.filters.category = 'All';
      }
      loadMarketplace();
    });
  });

  // AI tool checkboxes
  document.querySelectorAll('.ai-tool-filter-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(document.querySelectorAll('.ai-tool-filter-checkbox:checked')).map(el => el.value);
      state.filters.aiModels = checked;
      loadMarketplace();
    });
  });

  // Clear matched campaign filter banner
  document.getElementById('clear-matched-filter-btn')?.addEventListener('click', () => {
    state.matchedCreators = null;
    loadMarketplace();
  });

  // Modal dismiss buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-backdrop').classList.add('hidden');
    });
  });

  // Confirm escrow booking button
  document.getElementById('confirm-booking-btn')?.addEventListener('click', confirmBooking);

  // Setup brief form
  setupSmartBrief();

  // Initial routing
  const hash = window.location.hash;
  if (hash.startsWith('#profile')) {
    const id = new URLSearchParams(hash.split('?')[1]).get('id') || 'kiara-mehta';
    navigateTo('profile', { creatorId: id });
  } else if (hash === '#marketplace') {
    navigateTo('marketplace');
  } else if (hash === '#campaign') {
    navigateTo('campaign');
  } else {
    navigateTo('home');
  }
});
