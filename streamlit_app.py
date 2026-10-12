"""
Prismatch - AI-Native Creator Marketplace
Interactive Streamlit Application powered by Pandas
"""

import streamlit as st
import pandas as pd
import json
from backend.engine import engine

st.set_page_config(
    page_title="Prismatch - AI Creator Marketplace",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for Emerald / AI-Native Branding
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    h1, h2, h3 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #131b2e;
    }
    .metric-card {
        background: #ffffff;
        border: 1px solid #dae2fd;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        text-align: center;
    }
    .metric-value {
        font-size: 26px;
        font-weight: 700;
        color: #006948;
    }
    .metric-label {
        font-size: 13px;
        color: #3d4a42;
    }
    .creator-card {
        background: #ffffff;
        border: 1px solid #eaedff;
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        transition: transform 0.2s;
    }
    .tag-pill {
        display: inline-block;
        background: #eaedff;
        color: #006948;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 999px;
        margin-right: 4px;
        margin-bottom: 4px;
    }
    .badge-level {
        display: inline-block;
        background: #006948;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 6px;
    }
    .recipe-box {
        background: #f8f9ff;
        border-left: 4px solid #006948;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        margin-top: 8px;
    }
</style>
""", unsafe_allow_html=True)

# Top Header Bar
col_logo, col_title = st.columns([1, 8])
with col_logo:
    st.image("https://lh3.googleusercontent.com/aida-public/AB6AXuCrD3-qfSe13tO4aAkqNobKCwQO-jSxjhrMPDUiIELV-E41V_I9DjVoUWUezOqRxHF0VdNJ3fnbp4PianRmDiL7AGoTXzZdUrbNaSJ3ecr3aHsKes7KTssB7Exis7A5QtMpeagMoIsvNrKzAgWppmP_xhRsAOOhl7lJ4qZJ_Ta5FUiGQOHrlVYxOS-at8pN5iZBk3EcXZWXJ6Ks7pqHudmLfB52k_Zm1os_gUBKjdrteWnbT7_J4yTFXQ", width=64)
with col_title:
    st.title("Prismatch — AI-Native Creator Marketplace")
    st.caption("Powered by Python, Pandas & Algorithmic CreativeTwin Matching")

# Platform KPI Metric Strip
stats = engine.get_stats()
m1, m2, m3, m4, m5 = st.columns(5)
with m1:
    st.markdown(f'<div class="metric-card"><div class="metric-value">{stats["total_creators"]}+</div><div class="metric-label">Verified Creators</div></div>', unsafe_allow_html=True)
with m2:
    st.markdown(f'<div class="metric-card"><div class="metric-value">{stats["brands_trust"]}+</div><div class="metric-label">Brands Trust Us</div></div>', unsafe_allow_html=True)
with m3:
    st.markdown(f'<div class="metric-card"><div class="metric-value">{stats["match_accuracy"]}</div><div class="metric-label">Match Accuracy</div></div>', unsafe_allow_html=True)
with m4:
    st.markdown(f'<div class="metric-card"><div class="metric-value">{stats["average_rating"]} ★</div><div class="metric-label">Average Rating</div></div>', unsafe_allow_html=True)
with m5:
    st.markdown(f'<div class="metric-card"><div class="metric-value">{stats["total_bookings"]}</div><div class="metric-label">Escrow Contracts</div></div>', unsafe_allow_html=True)

st.write("")

# Navigation Tabs
tab_market, tab_brief, tab_match, tab_proof, tab_dataframe = st.tabs([
    "🔍 Marketplace & Creators",
    "📝 Smart Brief Builder",
    "🎯 CreativeTwin Matching",
    "🛡️ ProcessProof™ & Escrow Ledger",
    "📊 Pandas Raw DataFrame"
])

# -------------------------------------------------------------
# TAB 1: Marketplace & Creator Studio
# -------------------------------------------------------------
with tab_market:
    st.subheader("Browse Verified AI Creators")
    
    col_filters, col_results = st.columns([1, 3])
    
    with col_filters:
        st.markdown("#### Filters")
        search_q = st.text_input("Search", placeholder="e.g. Kiara, Reels, ComfyUI, 3D")
        
        category_options = ["All"] + list(engine.creators_df["category"].unique())
        selected_cat = st.selectbox("Category", category_options)
        
        platform_options = ["All", "Instagram", "YouTube", "TikTok", "LinkedIn", "Twitter/X"]
        selected_plat = st.selectbox("Platform", platform_options)
        
        budget_range = st.slider("Budget Max (₹)", min_value=1000, max_value=20000, value=15000, step=500)
        
        ai_tool_filter = st.multiselect(
            "AI Models & Tools",
            ["Runway Gen-3", "Midjourney v6", "Kling AI", "Luma Dream Machine", "Stable Diffusion / ComfyUI", "ElevenLabs"]
        )
        
        sort_choice = st.selectbox(
            "Sort By",
            ["Relevance", "Rating (High to Low)", "Price (Low to High)", "Most Orders"]
        )
        sort_map = {
            "Relevance": "relevance",
            "Rating (High to Low)": "rating",
            "Price (Low to High)": "price_asc",
            "Most Orders": "orders"
        }
    
    with col_results:
        # Run Pandas filtering
        filtered_res = engine.filter_creators(
            query=search_q if search_q else None,
            category=selected_cat if selected_cat != "All" else None,
            platform=selected_plat if selected_plat != "All" else None,
            max_budget=budget_range,
            ai_models=ai_tool_filter if ai_tool_filter else None,
            sort_by=sort_map[sort_choice]
        )
        
        creators_list = filtered_res["creators"]
        st.write(f"Showing **{len(creators_list)}** of **{filtered_res['total_count']}** creators")
        
        # Grid of Creator Cards
        for c in creators_list:
            with st.container():
                c_col1, c_col2, c_col3 = st.columns([1, 3, 1])
                with c_col1:
                    st.image(c.get("avatar", c.get("hero_image")), use_container_width=True)
                with c_col2:
                    st.markdown(f"### {c['name']} <span class='badge-level'>{c.get('badge', 'Verified')}</span>", unsafe_allow_html=True)
                    st.markdown(f"**{c.get('title')}** • 📍 *{c.get('location')}*")
                    st.write(f"★ **{c.get('rating')}** ({c.get('reviews_count')} reviews) • **{c.get('completed_projects')}+** projects")
                    
                    # Tags
                    tag_html = "".join([f"<span class='tag-pill'>{t}</span>" for t in c.get("ai_models", [])[:4]])
                    st.markdown(tag_html, unsafe_allow_html=True)
                    
                    st.caption(c.get("bio", "")[:180] + "...")
                
                with c_col3:
                    st.metric("Starting At", f"₹{c.get('price_from'):,}")
                    st.caption(f"⚡ Turnaround: {c.get('delivery_days')} days")
                    
                    if st.button(f"View Profile", key=f"view_{c['id']}"):
                        st.session_state["selected_creator"] = c["id"]
                st.divider()

    # Detailed Profile Inspector if selected
    if "selected_creator" in st.session_state:
        selected_c = engine.get_creator_by_id(st.session_state["selected_creator"])
        if selected_c:
            st.markdown(f"## 👤 Creator Profile: {selected_c['name']}")
            p_tab1, p_tab2, p_tab3 = st.tabs(["Overview & Specs", "Portfolio & Prompt Recipes", "Services & Escrow Booking"])
            
            with p_tab1:
                st.write(selected_c.get("bio"))
                st.markdown("#### Hardware & Generation Specs")
                specs = selected_c.get("hardware_specs", {})
                st.json(specs)
            
            with p_tab2:
                portfolio = selected_c.get("portfolio", [])
                if portfolio:
                    for item in portfolio:
                        st.markdown(f"#### 🎬 {item.get('title')} — {item.get('subtitle')}")
                        pi_col1, pi_col2 = st.columns([1, 2])
                        with pi_col1:
                            st.image(item.get("image"), use_container_width=True)
                        with pi_col2:
                            st.write(f"**Pipeline**: `{item.get('pipeline')}` | **Format**: `{item.get('aspect_ratio')}` | **Views**: {item.get('views')}")
                            recipe = item.get("prompt_recipe", {})
                            st.markdown(f"""
                            <div class="recipe-box">
                                <b>Positive Prompt:</b> {recipe.get('positive_prompt')}<br>
                                <b>Model:</b> {recipe.get('model')} | <b>Seed:</b> {recipe.get('seed')} | <b>Steps:</b> {recipe.get('steps')}
                            </div>
                            """, unsafe_allow_html=True)
                        st.divider()
                else:
                    st.info("No public portfolio projects listed yet.")
            
            with p_tab3:
                services = selected_c.get("services", [])
                for s in services:
                    s_c1, s_c2 = st.columns([3, 1])
                    with s_c1:
                        st.markdown(f"### {s.get('tier')} Package: {s.get('title')}")
                        st.write(", ".join(s.get("features", [])))
                        st.caption(f"Delivery: {s.get('delivery_days')} days | Revisions: {s.get('revisions')}")
                    with s_c2:
                        st.markdown(f"### ₹{s.get('price'):,}")
                        if st.button(f"Hire {selected_c['name']} ({s.get('tier')})", key=f"book_{selected_c['id']}_{s.get('tier')}"):
                            b_res = engine.create_booking({
                                "creator_id": selected_c["id"],
                                "tier": s.get("tier"),
                                "amount": s.get("price"),
                                "client_name": "Streamlit Demo User"
                            })
                            st.success(f"🎉 Booking Confirmed! Escrow ID: {b_res['escrow_id']}")
                            st.json(b_res)

# -------------------------------------------------------------
# TAB 2: Smart Brief Builder
# -------------------------------------------------------------
with tab_brief:
    st.subheader("Smart Campaign Brief Builder (AI Assisted)")
    st.write("Describe your campaign and let Python NLP deconstruct your signals in real time.")
    
    b_title = st.text_input("Campaign Title", "Instagram Reels for Organic Vitamin C Cleanser")
    
    raw_desc = st.text_area(
        "Campaign Description",
        "We are an organic D2C skincare brand launching a soothing vitamin C foaming facial cleanser. We need 3-5 authentic lifestyle UGC creators to record unboxing, texture demo, and a 3-day glow result reel with cheerful natural home aesthetic.",
        height=120
    )
    
    if st.button("✨ Refine with Brief AI", type="secondary"):
        st.session_state["refined_brief"] = engine.refine_brief_ai(raw_desc)
    
    if "refined_brief" in st.session_state:
        ref_data = st.session_state["refined_brief"]
        st.success("Brief Enhanced!")
        st.write(ref_data["enhanced_text"])
        
        st.markdown("#### ⚡ Extracted AI Signals (Deconstructed)")
        sig = ref_data["signals"]
        s_c1, s_c2, s_c3, s_c4 = st.columns(4)
        s_c1.metric("Style", sig["style"])
        s_c2.metric("Aspect Ratio", sig["aspect"])
        s_c3.metric("Audio", sig["audio"].split()[0])
        s_c4.metric("Pipeline", sig["pipeline"])
    
    col_b1, col_b2 = st.columns(2)
    with col_b1:
        b_platform = st.multiselect("Platforms", ["Instagram", "YouTube", "TikTok", "LinkedIn"], default=["Instagram", "TikTok"])
        b_type = st.selectbox("Content Type", ["Reels / Short Video", "UGC Content", "Product Photography", "3D Staging", "Graphic Design"])
    with col_b2:
        b_budget = st.selectbox("Budget Tier", ["₹1,000 - ₹5,000", "₹5,000 - ₹15,000", "₹15,000 - ₹50,000", "₹50,000+"])
        b_timeline = st.selectbox("Timeline", ["Urgent (< 3 days)", "Standard (1-2 weeks)", "Flexible (1 month)"])
    
    if st.button("🚀 Find Matching Creators (CreativeTwin)", type="primary"):
        matches = engine.match_creators({
            "title": b_title,
            "description": raw_desc,
            "platform": b_platform[0] if b_platform else "Instagram",
            "content_type": b_type
        })
        st.session_state["matches"] = matches
        st.info(f"Matched {len(matches)} creators! Click the 'CreativeTwin Matching' tab to see ranked results.")

# -------------------------------------------------------------
# TAB 3: CreativeTwin Matching Engine
# -------------------------------------------------------------
with tab_match:
    st.subheader("🎯 CreativeTwin Algorithmic Match Results")
    
    if "matches" not in st.session_state:
        st.session_state["matches"] = engine.match_creators({
            "title": "Skincare Reels Campaign",
            "description": "Authentic UGC lifestyle video",
            "content_type": "UGC Content"
        })
    
    matches = st.session_state["matches"]
    
    # Match Distribution Chart using Pandas & Streamlit
    match_df = pd.DataFrame([{
        "Creator": m["name"],
        "Match Score (%)": m["match_score"],
        "Category": m["category"],
        "Price (₹)": m["price_from"]
    } for m in matches])
    
    st.bar_chart(match_df.set_index("Creator")["Match Score (%)"])
    
    st.markdown("### Top Ranked Creators for Your Campaign")
    for m in matches:
        with st.container():
            m_c1, m_c2, m_c3 = st.columns([1, 3, 1])
            with m_c1:
                st.image(m.get("avatar", m.get("hero_image")), width=110)
            with m_c2:
                st.markdown(f"### {m['name']} — <span style='color:#006948; font-weight:700;'>{m['match_score']}% Match</span>", unsafe_allow_html=True)
                st.write(f"**{m.get('title')}** • Rating: **{m.get('rating')}★**")
                st.markdown("**Why this match?**")
                for reason in m.get("why_matched", []):
                    st.write(f"- {reason}")
            with m_c3:
                st.metric("Price", f"₹{m.get('price_from'):,}")
                if st.button(f"Book {m['name']}", key=f"book_match_{m['id']}"):
                    b_res = engine.create_booking({
                        "creator_id": m["id"],
                        "tier": "Standard",
                        "amount": m.get("price_from", 2500),
                        "client_name": "Matched Campaign Client"
                    })
                    st.success(f"Escrow Protected Booking Created! ID: {b_res['escrow_id']}")
            st.divider()

# -------------------------------------------------------------
# TAB 4: ProcessProof & Escrow Ledger
# -------------------------------------------------------------
with tab_proof:
    st.subheader("🛡️ ProcessProof™ Verification & Escrow Ledger")
    st.write("All creator workflows, seed-locking parameters, and commercial escrow transactions are audited in this ledger.")
    
    col_l1, col_l2 = st.columns([2, 1])
    with col_l1:
        st.markdown("#### Live Escrow Ledger (Pandas DataFrame)")
        st.dataframe(engine.bookings_df, use_container_width=True)
    with col_l2:
        st.markdown("#### Audited Trust Criteria")
        st.success("✅ C2PA Generative Metadata Verification Active")
        st.success("✅ 100% Commercial Indemnification Guaranteed")
        st.success("✅ Milestone-based Escrow Release Protected")

# -------------------------------------------------------------
# TAB 5: Pandas Raw DataFrame
# -------------------------------------------------------------
with tab_dataframe:
    st.subheader("📊 Direct Pandas DataFrame Inspection (`engine.creators_df`)")
    st.write("Full tabular representation stored and operated on in memory via Pandas:")
    st.dataframe(engine.creators_df, use_container_width=True)
    
    st.markdown("#### Pandas Statistical Summary")
    st.write(engine.creators_df.describe())
    
    # Download CSV button
    csv_data = engine.creators_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        "📥 Download creators.csv",
        data=csv_data,
        file_name="prismatch_creators.csv",
        mime="text/csv"
    )
