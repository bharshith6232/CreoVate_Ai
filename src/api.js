/**
 * Prismatch API Client
 * Connects Frontend directly to Python FastAPI & Pandas Backend
 */

const API_BASE = window.location.port === '5173' ? '/api' : 'http://localhost:8000/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      console.warn("Backend not reached on /api, using fallback mode", e);
      return null;
    }
  },

  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      return await res.json();
    } catch (e) {
      return { total_creators: 6, brands_trust: 100, match_accuracy: '95%', average_rating: 4.8 };
    }
  },

  async getCreators(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.platform && params.platform !== 'All') query.append('platform', params.platform);
    if (params.minBudget) query.append('minBudget', params.minBudget);
    if (params.maxBudget) query.append('maxBudget', params.maxBudget);
    if (params.deliveryDays) query.append('deliveryDays', params.deliveryDays);
    if (params.aiModels && params.aiModels.length) query.append('aiModels', params.aiModels.join(','));
    if (params.specializations && params.specializations.length) query.append('specializations', params.specializations.join(','));
    if (params.licensing && params.licensing.length) query.append('licensing', params.licensing.join(','));
    if (params.sortBy) query.append('sortBy', params.sortBy);

    try {
      const res = await fetch(`${API_BASE}/creators?${query.toString()}`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch (e) {
      console.error("Error fetching creators:", e);
      return { creators: [], total_count: 0 };
    }
  },

  async getCreatorDetail(creatorId) {
    try {
      const res = await fetch(`${API_BASE}/creators/${creatorId}`);
      if (!res.ok) throw new Error("Creator not found");
      return await res.json();
    } catch (e) {
      console.error(`Error fetching creator ${creatorId}:`, e);
      return null;
    }
  },

  async refineBrief(text) {
    try {
      const res = await fetch(`${API_BASE}/brief/refine-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return await res.json();
    } catch (e) {
      console.error("Error refining brief:", e);
      return null;
    }
  },

  async matchCampaign(briefData) {
    try {
      const res = await fetch(`${API_BASE}/campaigns/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(briefData)
      });
      return await res.json();
    } catch (e) {
      console.error("Error matching campaign:", e);
      return { matches: [] };
    }
  },

  async bookCreator(bookingData) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (e) {
      console.error("Error booking creator:", e);
      return { success: false, message: e.message };
    }
  },

  async toggleFavorite(creatorId) {
    try {
      const res = await fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId })
      });
      return await res.json();
    } catch (e) {
      return { is_favorite: false };
    }
  }
};
