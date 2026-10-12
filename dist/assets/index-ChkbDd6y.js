(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function r(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=r(a);fetch(a.href,i)}})();const g=window.location.port==="5173"?"/api":"http://localhost:8000/api",b={async getHealth(){try{return await(await fetch(`${g}/health`)).json()}catch(t){return console.warn("Backend not reached on /api, using fallback mode",t),null}},async getStats(){try{return await(await fetch(`${g}/stats`)).json()}catch{return{total_creators:6,brands_trust:100,match_accuracy:"95%",average_rating:4.8}}},async getCreators(t={}){const e=new URLSearchParams;t.q&&e.append("q",t.q),t.category&&t.category!=="All"&&e.append("category",t.category),t.platform&&t.platform!=="All"&&e.append("platform",t.platform),t.minBudget&&e.append("minBudget",t.minBudget),t.maxBudget&&e.append("maxBudget",t.maxBudget),t.deliveryDays&&e.append("deliveryDays",t.deliveryDays),t.aiModels&&t.aiModels.length&&e.append("aiModels",t.aiModels.join(",")),t.specializations&&t.specializations.length&&e.append("specializations",t.specializations.join(",")),t.licensing&&t.licensing.length&&e.append("licensing",t.licensing.join(",")),t.sortBy&&e.append("sortBy",t.sortBy);try{const r=await fetch(`${g}/creators?${e.toString()}`);if(!r.ok)throw new Error("API error");return await r.json()}catch(r){return console.error("Error fetching creators:",r),{creators:[],total_count:0}}},async getCreatorDetail(t){try{const e=await fetch(`${g}/creators/${t}`);if(!e.ok)throw new Error("Creator not found");return await e.json()}catch(e){return console.error(`Error fetching creator ${t}:`,e),null}},async refineBrief(t){try{return await(await fetch(`${g}/brief/refine-ai`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t})})).json()}catch(e){return console.error("Error refining brief:",e),null}},async matchCampaign(t){try{return await(await fetch(`${g}/campaigns/match`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json()}catch(e){return console.error("Error matching campaign:",e),{matches:[]}}},async bookCreator(t){try{return await(await fetch(`${g}/bookings`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json()}catch(e){return console.error("Error booking creator:",e),{success:!1,message:e.message}}},async toggleFavorite(t){try{return await(await fetch(`${g}/favorites/toggle`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({creator_id:t})})).json()}catch{return{is_favorite:!1}}}},s={currentView:"home",selectedCreatorId:"kiara-mehta",filters:{q:"",category:"All",platform:"All",maxBudget:5e4,deliveryDays:null,aiModels:[],specializations:[],licensing:[],sortBy:"relevance"},favorites:new Set(["kiara-mehta"]),matchedCreators:null};function x(t,e="success"){let r=document.getElementById("toast-notification");r||(r=document.createElement("div"),r.id="toast-notification",r.className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-on-primary font-label-md transition-all duration-300 transform translate-y-10 opacity-0",document.body.appendChild(r)),r.style.backgroundColor=e==="success"?"#006948":"#ba1a1a",r.innerHTML=`
    <span class="material-symbols-outlined text-[20px]">${e==="success"?"check_circle":"error"}</span>
    <span>${t}</span>
  `,r.classList.remove("translate-y-10","opacity-0"),setTimeout(()=>{r.classList.add("translate-y-10","opacity-0")},3500)}function m(t,e={}){s.currentView=t,e.creatorId&&(s.selectedCreatorId=e.creatorId),e.category&&(s.filters.category=e.category),e.q!==void 0&&(s.filters.q=e.q),t==="profile"?window.location.hash=`#profile?id=${s.selectedCreatorId}`:window.location.hash=`#${t}`,["home","marketplace","profile","campaign"].forEach(n=>{const a=document.getElementById(`${n}-view`);a&&(n===t?a.classList.remove("hidden"):a.classList.add("hidden"))}),window.scrollTo({top:0,behavior:"smooth"}),t==="marketplace"?y():t==="profile"&&k(s.selectedCreatorId),E()}function E(){document.querySelectorAll("#category-subnav a").forEach(t=>{const e=t.getAttribute("data-category");s.currentView==="marketplace"&&s.filters.category.toLowerCase()===(e||"").toLowerCase()?(t.classList.add("text-primary","font-bold","border-b-2","border-primary"),t.classList.remove("text-on-surface-variant")):(t.classList.remove("text-primary","font-bold","border-b-2","border-primary"),t.classList.add("text-on-surface-variant"))})}async function y(){const t=document.getElementById("marketplace-cards-grid"),e=document.getElementById("marketplace-results-count"),r=document.getElementById("matched-campaign-banner");if(s.matchedCreators&&s.matchedCreators.length>0){r&&r.classList.remove("hidden"),v(s.matchedCreators,t),e&&(e.innerHTML=`Showing <span class="font-semibold text-on-surface">${s.matchedCreators.length}</span> algorithmically matched creators`);return}else r&&r.classList.add("hidden");t&&(t.innerHTML=`
      <div class="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="font-body-sm">Querying verified creators from Python & Pandas engine...</p>
      </div>
    `);const n=await b.getCreators(s.filters),a=n.creators||[];e&&(e.innerHTML=`Showing <span class="font-semibold text-on-surface">1 - ${a.length}</span> of ${n.total_count||480} verified creators`),v(a,t)}function v(t,e){var r;if(e){if(t.length===0){e.innerHTML=`
      <div class="col-span-full py-16 text-center bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30">
        <span class="material-symbols-outlined text-[48px] text-primary mb-2">person_search</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface">No creators match your active filters</h3>
        <p class="font-body-md text-on-surface-variant mt-1">Try widening your budget range or selecting different AI tools.</p>
        <button id="reset-all-filters-btn" class="mt-4 px-5 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm">Reset Filters</button>
      </div>
    `,(r=document.getElementById("reset-all-filters-btn"))==null||r.addEventListener("click",I);return}e.innerHTML=t.map(n=>{const a=s.favorites.has(n.id),i=(n.ai_models||[]).slice(0,3).map((u,f)=>`
      <span class="px-2 py-0.5 rounded-full bg-surface-container font-label-xs text-[11px] text-primary font-medium flex items-center gap-1">
        ${f===0?'<span class="material-symbols-outlined text-[12px]">auto_awesome</span>':""}${u}
      </span>
    `).join(""),l=n.match_score?`
      <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-xs text-label-xs font-bold shadow-md flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
        <span>${n.match_score}% Match</span>
      </div>
    `:"";return`
      <div class="creator-card group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer" data-id="${n.id}">
        <div class="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${n.hero_image||n.avatar}" alt="${n.name}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          ${l}

          <button class="favorite-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white ${a?"text-error":""} hover:text-error transition-colors" data-id="${n.id}" type="button">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' ${a?1:0};">favorite</span>
          </button>
          
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-10 h-10 rounded-full bg-on-background/50 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
            </div>
          </div>
          
          <div class="absolute bottom-3 right-3">
            <span class="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white font-label-xs text-label-xs font-semibold">${n.badge||"Verified"}</span>
          </div>
        </div>

        <div class="p-4 flex flex-col flex-1 justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <img class="w-9 h-9 rounded-full object-cover shrink-0" src="${n.avatar||n.hero_image}" alt="${n.name}">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">${n.name}</h3>
                  <span class="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 text-[10px]">
                    <span class="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${n.title}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 pt-0.5">
              ${i}
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-tertiary" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="font-label-sm text-label-sm text-on-surface font-bold">${n.rating}</span>
                <span class="text-outline font-body-sm text-body-sm">(${n.reviews_count||50})</span>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed/30 text-primary font-label-xs text-[11px] font-semibold">
                <span class="material-symbols-outlined text-[12px]">verified</span>ProcessProof™
              </span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-label-xs pt-0.5">
              <span>Format: ${(n.formats||["9:16 Vertical"])[0]}</span>
              <span class="text-primary font-medium flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[12px]">shield</span>Clean IP
              </span>
            </div>
          </div>

          <div class="pt-3 mt-3 flex items-center justify-between border-t border-outline-variant/30">
            <div>
              <span class="text-outline block font-label-xs">From</span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-bold">₹${(n.price_from||2e3).toLocaleString()}</span>
            </div>
            <button class="book-card-btn px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm transition-colors" data-id="${n.id}" type="button">Book</button>
          </div>
        </div>
      </div>
    `}).join(""),e.querySelectorAll(".creator-card").forEach(n=>{n.addEventListener("click",a=>{if(a.target.closest(".favorite-btn")||a.target.closest(".book-card-btn"))return;const i=n.getAttribute("data-id");m("profile",{creatorId:i})})}),e.querySelectorAll(".favorite-btn").forEach(n=>{n.addEventListener("click",async a=>{a.stopPropagation();const i=n.getAttribute("data-id"),l=await b.toggleFavorite(i);l&&l.is_favorite?(s.favorites.add(i),n.classList.add("text-error"),n.querySelector(".material-symbols-outlined").style.fontVariationSettings="'FILL' 1",x("Saved creator to favorites")):(s.favorites.delete(i),n.classList.remove("text-error"),n.querySelector(".material-symbols-outlined").style.fontVariationSettings="'FILL' 0",x("Removed from favorites"))})}),e.querySelectorAll(".book-card-btn").forEach(n=>{n.addEventListener("click",a=>{a.stopPropagation();const i=n.getAttribute("data-id");w(i)})})}}async function k(t){const e=await b.getCreatorDetail(t);if(!e)return;document.getElementById("profile-name").textContent=e.name,document.getElementById("profile-title").textContent=e.title,document.getElementById("profile-rating").textContent=e.rating,document.getElementById("profile-reviews-count").textContent=`(${e.reviews_count||120} reviews)`,document.getElementById("profile-projects").textContent=`${e.completed_projects||500}+`,document.getElementById("profile-location").textContent=e.location||"India",document.getElementById("profile-bio").textContent=e.bio||"";const r=document.getElementById("profile-avatar");r&&(r.src=e.avatar||e.hero_image);const n=document.getElementById("profile-intro-thumb");n&&(n.src=e.intro_video_thumb||e.hero_image);const a=document.getElementById("profile-tool-tags");a&&e.ai_models&&(a.innerHTML=e.ai_models.map(d=>`
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest border border-outline-variant/30 font-label-xs text-label-xs text-on-surface font-medium">
        <span class="material-symbols-outlined text-primary text-[14px]">check</span>${d}
      </span>
    `).join(""));const i=document.getElementById("profile-skills");i&&e.skills&&(i.innerHTML=e.skills.map((d,h)=>`
      <span class="px-3 py-1.5 rounded-lg ${h===0?"bg-secondary-fixed/50 text-on-secondary-fixed font-semibold":"bg-surface-container-low text-on-surface"} font-label-sm text-label-sm">${d}</span>
    `).join(""));const l=e.hardware_specs||{};document.getElementById("spec-base-models").textContent=l.base_models||"Midjourney v6, Runway Gen-3 Alpha, Kling AI",document.getElementById("spec-hardware-rig").textContent=l.rig||"Dedicated Dual RTX 4090 Station, ComfyUI Nodes",document.getElementById("spec-guarantee").textContent=l.guarantee||"100% Commercial Cleared & Enterprise Model Certified";const u=document.getElementById("profile-portfolio-grid");u&&e.portfolio&&(e.portfolio.length===0?u.innerHTML=`
        <div class="col-span-full py-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant font-body-sm">
          No public portfolio items configured for this creator yet.
        </div>
      `:(u.innerHTML=e.portfolio.map(d=>`
        <div class="group relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-container shadow-sm cursor-pointer">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${d.image}" alt="${d.title}">
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex flex-col justify-between p-3">
            <div class="flex items-start justify-between gap-1">
              <div class="flex flex-wrap gap-1">
                <span class="px-2 py-0.5 rounded bg-inverse-surface/70 backdrop-blur text-on-primary font-label-xs text-label-xs font-medium flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[12px] text-secondary-fixed">auto_awesome</span>${d.pipeline}
                </span>
                <span class="px-1.5 py-0.5 rounded bg-inverse-surface/60 backdrop-blur text-inverse-on-surface/80 font-label-xs text-label-xs">${d.aspect_ratio}</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-inverse-surface/60 backdrop-blur text-on-primary font-label-xs text-label-xs flex items-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-[12px]">visibility</span>${d.views}
              </span>
            </div>
            
            <div class="space-y-2">
              <div>
                <div class="flex items-center gap-1.5">
                  <p class="text-on-primary font-label-sm text-label-sm font-semibold leading-tight">${d.title}</p>
                  <span class="material-symbols-outlined text-secondary-fixed text-[14px]">check_circle</span>
                </div>
                <p class="text-inverse-on-surface/80 font-label-xs text-label-xs">${d.subtitle}</p>
              </div>
              
              <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                <button class="prompt-recipe-btn inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur text-on-surface font-label-xs text-label-xs font-semibold hover:bg-surface-container-lowest transition-colors" data-id="${d.id}" type="button">
                  <span class="material-symbols-outlined text-[13px] text-primary">receipt_long</span>Prompt Recipe
                </button>
                <div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-[16px] ml-0.5" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join(""),u.querySelectorAll(".prompt-recipe-btn").forEach(d=>{d.addEventListener("click",h=>{h.stopPropagation();const o=d.getAttribute("data-id"),c=e.portfolio.find(p=>p.id===o);c&&c.prompt_recipe&&B(c)})})));const f=document.getElementById("profile-hire-btn");f&&(f.onclick=()=>w(e.id))}function B(t){const e=document.getElementById("recipe-modal");if(!e)return;const r=t.prompt_recipe;document.getElementById("recipe-title").textContent=`${t.title} — Prompt Recipe`,document.getElementById("recipe-model").textContent=r.model||"Runway Gen-3 / Midjourney v6",document.getElementById("recipe-seed").textContent=r.seed||"482910482",document.getElementById("recipe-steps").textContent=`${r.steps||30} steps | CFG ${r.cfg_scale||7}`,document.getElementById("recipe-positive-prompt").textContent=r.positive_prompt,document.getElementById("recipe-negative-prompt").textContent=r.negative_prompt||"None",e.classList.remove("hidden");const n=document.getElementById("recipe-copy-btn");n&&(n.onclick=()=>{navigator.clipboard.writeText(r.positive_prompt),x("Copied Prompt Recipe to clipboard!")})}function w(t){const e=document.getElementById("booking-modal");e&&(b.getCreatorDetail(t),e.setAttribute("data-creator-id",t),e.classList.remove("hidden"))}async function L(){var i;const t=document.getElementById("booking-modal"),e=t.getAttribute("data-creator-id")||"kiara-mehta",r=((i=document.querySelector('input[name="booking-tier"]:checked'))==null?void 0:i.value)||"Standard",n=r==="Basic"?2500:r==="Premium"?12e3:6e3,a=await b.bookCreator({creator_id:e,tier:r,amount:n,client_name:"Brand Partner"});if(a&&a.success){t.classList.add("hidden"),x(`Escrow Contract Created! ${a.escrow_id}`);const l=document.getElementById("certificate-modal");l&&(document.getElementById("cert-booking-id").textContent=a.booking_id,document.getElementById("cert-escrow-id").textContent=a.escrow_id,document.getElementById("cert-amount").textContent=`₹${n.toLocaleString()}`,l.classList.remove("hidden"))}}function C(){const t=document.getElementById("enhanceAiBtn"),e=document.getElementById("campaignDescription"),r=document.getElementById("smartBriefForm");t&&e&&t.addEventListener("click",async()=>{const n=e.value.trim()||"We are a skincare brand launching a soothing vitamin C cleanser. We need 3-5 authentic lifestyle UGC creators for unboxing and texture demo.",a=await b.refineBrief(n);a&&(e.value=a.enhanced_text,document.getElementById("signal-style").textContent=a.signals.style,document.getElementById("signal-aspect").textContent=a.signals.aspect,document.getElementById("signal-audio").textContent=a.signals.audio,document.getElementById("signal-pipeline").textContent=a.signals.pipeline,x("Brief refined with AI Deconstruction!"))}),document.querySelectorAll(".platform-chip").forEach(n=>{n.addEventListener("click",()=>{n.classList.toggle("bg-primary"),n.classList.toggle("text-on-primary"),n.classList.toggle("bg-surface-container-low"),n.classList.toggle("text-on-surface-variant")})}),document.querySelectorAll(".content-type-chip").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".content-type-chip").forEach(a=>{a.classList.remove("bg-primary","text-on-primary"),a.classList.add("bg-surface-container-low","text-on-surface-variant")}),n.classList.add("bg-primary","text-on-primary"),n.classList.remove("bg-surface-container-low","text-on-surface-variant")})}),r&&r.addEventListener("submit",async n=>{var f;n.preventDefault();const a=((f=document.getElementById("campaignTitle"))==null?void 0:f.value)||"Skincare UGC Reel",i=(e==null?void 0:e.value)||"UGC video campaign",l=document.getElementById("submitBriefBtn");l&&(l.disabled=!0,l.innerHTML=`
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Matching CreativeTwins...</span>
        `);const u=await b.matchCampaign({title:a,description:i,content_type:"UGC Content",platforms:["Instagram","TikTok"]});l&&(l.disabled=!1,l.innerHTML='<span>Find Matching Creators</span><span class="material-symbols-outlined text-[20px]">arrow_forward</span>'),s.matchedCreators=u.matches,x(`Matched ${u.matches.length} creators with CreativeTwin algorithm!`),m("marketplace")})}function I(){s.filters={q:"",category:"All",platform:"All",maxBudget:5e4,deliveryDays:null,aiModels:[],specializations:[],licensing:[],sortBy:"relevance"},s.matchedCreators=null,document.querySelectorAll('#marketplace-filter-aside input[type="checkbox"]').forEach(e=>{e.checked=!1});const t=document.getElementById("budget-range-input");t&&(t.value=5e4),y(),x("Filters reset")}document.addEventListener("DOMContentLoaded",()=>{var u,f,d,h;document.querySelectorAll("[data-path]").forEach(o=>{o.addEventListener("click",c=>{c.preventDefault();const p=o.getAttribute("data-path");p==="marketplace"||p==="explore"?(s.matchedCreators=null,m("marketplace")):p==="become-a-creator"||p==="create-campaign"?m("campaign"):p==="home"&&m("home")})}),document.querySelectorAll("#category-subnav a").forEach(o=>{o.addEventListener("click",c=>{c.preventDefault();const p=o.getAttribute("data-category");s.filters.category=p,s.matchedCreators=null,m("marketplace",{category:p})})});const t=document.getElementById("header-search-input"),e=document.getElementById("header-search-btn");function r(){const o=(t==null?void 0:t.value.trim())||"";s.filters.q=o,s.matchedCreators=null,m("marketplace",{q:o})}e==null||e.addEventListener("click",r),t==null||t.addEventListener("keydown",o=>{o.key==="Enter"&&r()});const n=document.getElementById("hero-search-input"),a=document.getElementById("hero-search-btn");function i(){const o=(n==null?void 0:n.value.trim())||"";s.filters.q=o,s.matchedCreators=null,m("marketplace",{q:o})}a==null||a.addEventListener("click",i),n==null||n.addEventListener("keydown",o=>{o.key==="Enter"&&i()}),document.querySelectorAll(".popular-tag-btn").forEach(o=>{o.addEventListener("click",()=>{const c=o.textContent.trim();s.filters.q=c,s.matchedCreators=null,m("marketplace",{q:c})})}),document.querySelectorAll(".popular-cat-card").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-category");s.filters.category=c,s.matchedCreators=null,m("marketplace",{category:c})})}),(u=document.getElementById("budget-range-input"))==null||u.addEventListener("input",o=>{const c=parseInt(o.target.value);document.getElementById("budget-display-val").textContent=`₹${c.toLocaleString()}`,s.filters.maxBudget=c,y()}),(f=document.getElementById("sort-dropdown"))==null||f.addEventListener("change",o=>{s.filters.sortBy=o.target.value,y()}),document.querySelectorAll(".category-filter-checkbox").forEach(o=>{o.addEventListener("change",()=>{o.checked?(document.querySelectorAll(".category-filter-checkbox").forEach(c=>{c!==o&&(c.checked=!1)}),s.filters.category=o.value):s.filters.category="All",y()})}),document.querySelectorAll(".ai-tool-filter-checkbox").forEach(o=>{o.addEventListener("change",()=>{const c=Array.from(document.querySelectorAll(".ai-tool-filter-checkbox:checked")).map(p=>p.value);s.filters.aiModels=c,y()})}),(d=document.getElementById("clear-matched-filter-btn"))==null||d.addEventListener("click",()=>{s.matchedCreators=null,y()}),document.querySelectorAll(".modal-close-btn").forEach(o=>{o.addEventListener("click",()=>{o.closest(".modal-backdrop").classList.add("hidden")})}),(h=document.getElementById("confirm-booking-btn"))==null||h.addEventListener("click",L),C();const l=window.location.hash;if(l.startsWith("#profile")){const o=new URLSearchParams(l.split("?")[1]).get("id")||"kiara-mehta";m("profile",{creatorId:o})}else m(l==="#marketplace"?"marketplace":l==="#campaign"?"campaign":"home")});
