const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'; // In prod, this will use current domain

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.serverUrl = API_BASE.replace('/api', '');
  }

  getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${this.serverUrl}${path}`;
  }

  getToken() {
    if (typeof window !== 'undefined') return localStorage.getItem('kushaagra_token');
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') localStorage.setItem('kushaagra_token', token);
  }

  removeToken() {
    if (typeof window !== 'undefined') localStorage.removeItem('kushaagra_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...options.headers };
    
    // Auto-set Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url, { ...options, headers });
      const contentType = res.headers.get('content-type');
      
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response from server:', text.substring(0, 200));
        throw new Error(`Server returned non-JSON response (${res.status}). Check if backend is running.`);
      }

      if (!res.ok) throw new Error(data.message || `API Error (${res.status})`);
      return data;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ─── Auth ───
  async register(body) { const r = await this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) }); if (r.token) this.setToken(r.token); return r; }
  async login(body) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }); }
  async verifyOtp(body) { const r = await this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }); if (r.token) this.setToken(r.token); return r; }
  async getMe() { return this.request('/auth/me'); }

  // ─── Profile ───
  async getProfile() { return this.request('/users/profile'); }
  async updateProfile(body) { return this.request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }); }
  async updatePreferences(body) { return this.request('/users/preferences', { method: 'PUT', body: JSON.stringify(body) }); }
  async getGamification() { return this.request('/users/gamification'); }
  async getStudentHistory() { return this.request('/users/history'); }

  // ─── Opportunities ───
  async getOpportunities(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/opportunities?${q}`); }
  async getOpportunity(id) { return this.request(`/opportunities/${id}`); }
  async getRecommendations(limit) { return this.request(`/opportunities/recommendations?limit=${limit || 20}`); }
  async toggleBookmark(id) { return this.request(`/opportunities/${id}/bookmark`, { method: 'POST' }); }
  async getBookmarks() { return this.request('/opportunities/user/bookmarks'); }

  // ─── Applications ───
  async apply(body) { return this.request('/applications', { method: 'POST', body: JSON.stringify(body) }); }
  async getApplications(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/applications?${q}`); }
  async getApplication(id) { return this.request(`/applications/${id}`); }
  async trackExternalClick(opportunityId) { return this.request('/applications/track-external', { method: 'POST', body: JSON.stringify({ opportunityId }) }); }

  // ─── Documents ───
  async getDocuments() { return this.request('/documents'); }
  async deleteDocument(id) { return this.request(`/documents/${id}`, { method: 'DELETE' }); }
  async uploadDocument(formData) {
    const url = `${this.baseUrl}/documents/upload`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const contentType = res.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Upload failed (${res.status}): ${text.substring(0, 100)}`);
    }

    if (!res.ok) throw new Error(data.message || `Upload Error (${res.status})`);
    return data;
  }

  // ─── Notifications ───
  async getNotifications(unread) { return this.request(`/notifications${unread ? '?unread=true' : ''}`); }
  async markRead(id) { return this.request(`/notifications/${id}/read`, { method: 'PUT' }); }
  async markAllRead() { return this.request('/notifications/read-all', { method: 'PUT' }); }

  // ─── Parent-specific ───
  async linkChild(childEmail, relationship) {
    return this.request('/auth/link-child', { method: 'POST', body: JSON.stringify({ childEmail, relationship }) });
  }
  async getChildren() {
    const me = await this.getMe();
    if (!me.user?.parentProfile?.children?.length) return { success: true, data: [] };
    const childIds = me.user.parentProfile.children.map(c => c.childId);
    // Fetch each child's profile
    const children = [];
    for (const id of childIds) {
      try {
        const r = await this.request(`/users/${id}/profile`);
        if (r.success) children.push(r.user);
      } catch (e) { /* skip */ }
    }
    return { success: true, data: children };
  }

  async getParentApplications() {
    return this.request('/parent/applications');
  }

  async getParentHistory() {
    return this.request('/parent/history');
  }

  async getFAQs() {
    return this.request('/faqs');
  }

  async createAchievement(body) {
    return this.request('/parent/achievements', { method: 'POST', body: JSON.stringify(body) });
  }

  // ─── Schools ───
  async getSchools(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/schools?${q}`); }
  async getSchool(id) { return this.request(`/schools/${id}`); }
  async submitReview(schoolId, review) { return this.request(`/schools/${schoolId}/review`, { method: 'POST', body: JSON.stringify(review) }); }
  async getMyReviews() { return this.request('/schools/user/reviews'); }
  async createSchool(body) { return this.request('/schools', { method: 'POST', body: JSON.stringify(body) }); }
  async updateSchool(id, body) { return this.request(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(body) }); }

  // ─── Services ───
  async getServiceRequests() { return this.request('/services'); }
  async createServiceRequest(body) { return this.request('/services', { method: 'POST', body: JSON.stringify(body) }); }
  async getServiceRequest(id) { return this.request(`/services/${id}`); }

  // ─── Files & Folders ───
  async getFileNodes(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/files?${q}`);
  }
  async createFolder(body) { return this.request('/files/folder', { method: 'POST', body: JSON.stringify(body) }); }
  async renameFileNode(id, name) { return this.request(`/files/${id}/rename`, { method: 'PUT', body: JSON.stringify({ name }) }); }
  async deleteFileNode(id) { return this.request(`/files/${id}`, { method: 'DELETE' }); }
  async uploadFileNode(formData) {
    const url = `${this.baseUrl}/files/upload`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Upload failed (${res.status}): ${text.substring(0, 100)}`);
    }
    if (!res.ok) throw new Error(data.message || `Upload Error (${res.status})`);
    return data;
  }

  // ─── Results & News ───
  async getResultSources(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/results?${q}`); }
  async getNews(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/news?${q}`); }

  // ─── Admin ───
  async getAdminStats() { return this.request('/admin/stats'); }
  async bulkUpload(formData) {
    const url = `${this.baseUrl}/admin/bulk-upload`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    return res.json();
  }
  async getAllUsers(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/admin/users?${q}`); }
  async verifySchool(id) { return this.request(`/schools/${id}/verify`, { method: 'PUT' }); }

  // ─── School Config (Admin) ───
  async getSchoolCategories() { return this.request('/school-config/categories'); }
  async createSchoolCategory(body) { return this.request('/school-config/categories', { method: 'POST', body: JSON.stringify(body) }); }
  async updateSchoolCategory(id, body) { return this.request(`/school-config/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }); }
  async deleteSchoolCategory(id) { return this.request(`/school-config/categories/${id}`, { method: 'DELETE' }); }

  async getSchoolFields() { return this.request('/school-config/fields'); }
  async createSchoolField(body) { return this.request('/school-config/fields', { method: 'POST', body: JSON.stringify(body) }); }
  async updateSchoolField(id, body) { return this.request(`/school-config/fields/${id}`, { method: 'PUT', body: JSON.stringify(body) }); }
  async deleteSchoolField(id) { return this.request(`/school-config/fields/${id}`, { method: 'DELETE' }); }

  // ─── AI Agent ───
  async getAgentDashboard() { return this.request('/agent/dashboard'); }
  async getAgentStats() { return this.request('/agent/stats'); }
  async getAgentPending(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/agent/pending?${q}`); }
  async getAgentOpportunity(id) { return this.request(`/agent/pending/${id}`); }
  async approveAgentOpportunity(id) { return this.request(`/agent/approve/${id}`, { method: 'PUT' }); }
  async rejectAgentOpportunity(id, reason) { return this.request(`/agent/reject/${id}`, { method: 'PUT', body: JSON.stringify({ reason }) }); }
  async editAgentOpportunity(id, data) { return this.request(`/agent/edit/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async bulkApproveAgent(payload) { return this.request('/agent/bulk-approve', { method: 'POST', body: JSON.stringify(payload) }); }
  async scanAgentUrl(url) { return this.request('/agent/scan-url', { method: 'POST', body: JSON.stringify({ url }) }); }
  async scanAgentExcel(formData) {
    const url = `${this.baseUrl}/agent/scan-excel`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) return res.json();
    throw new Error('Non-JSON response from agent scan');
  }
  async scanAgentLocal() { return this.request('/agent/scan-local', { method: 'POST' }); }
  async scanAgentCrawler() { return this.request('/agent/scan-crawler', { method: 'POST' }); }
  async getAgentScanLogs(params = {}) { const q = new URLSearchParams(params).toString(); return this.request(`/agent/scan-logs?${q}`); }

  // ─── Logout ───
  logout() { this.removeToken(); if (typeof window !== 'undefined') window.location.href = '/auth'; }
}

const api = new ApiService();
export default api;
