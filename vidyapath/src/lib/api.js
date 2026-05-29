const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
    const headers = {};
    
    // Set default headers
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth token
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      });

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON: ${response.status}`);
      }

      // Check for errors
      if (!response.ok) {
        throw new Error(data?.message || `Request failed: ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'}] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth
  async register(body) {
    const r = await this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    if (r.token) this.setToken(r.token);
    return r;
  }

  async login(body) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }

  async verifyOtp(body) {
    const r = await this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
    if (r.token) this.setToken(r.token);
    return r;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Profile
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(body) {
    return this.request('/users/profile', { method: 'PUT', body: JSON.stringify(body) });
  }

  async getGamification() {
    return this.request('/users/gamification');
  }

  async getStudentHistory() {
    return this.request('/users/history');
  }

  // Opportunities
  async getOpportunities(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/opportunities?${q}`);
  }

  async getOpportunity(id) {
    return this.request(`/opportunities/${id}`);
  }

  async toggleBookmark(id) {
    return this.request(`/opportunities/${id}/bookmark`, { method: 'POST' });
  }

  async getBookmarks() {
    return this.request('/opportunities/user/bookmarks');
  }


  // Applications
  async apply(body) {
    return this.request('/applications', { method: 'POST', body: JSON.stringify(body) });
  }

  async getApplications(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/applications?${q}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  // Schools
  async getSchools(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/schools?${q}`);
  }

  async getSchool(id) {
    return this.request(`/schools/${id}`);
  }

  async submitReview(schoolId, review) {
    return this.request(`/schools/${schoolId}/review`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getMyReviews() {
    return this.request('/schools/user/reviews');
  }

  async markReviewHelpful(schoolId, reviewId) {
    return this.request(`/schools/${schoolId}/reviews/${reviewId}/helpful`, { method: 'POST' });
  }

  async createSchool(body) {
    return this.request('/schools', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateSchool(id, body) {
    return this.request(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  async uploadDocument(formData) {
    const url = `${this.baseUrl}/documents/upload`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }

  // FileNodes
  async getFileNodes(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/file-nodes?${q}`);
  }

  async createFolder(body) {
    return this.request('/file-nodes/folder', { method: 'POST', body: JSON.stringify(body) });
  }

  async uploadFileNode(formData) {
    const url = `${this.baseUrl}/file-nodes/upload`;
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }

  async deleteFileNode(id) {
    return this.request(`/file-nodes/${id}`, { method: 'DELETE' });
  }

  // Parent
  async getChildren() {
    const me = await this.getMe();
    if (!me.user?.parentProfile?.children?.length) return { success: true, data: [] };
    const childIds = me.user.parentProfile.children.map(c => c.childId);
    const children = [];
    for (const id of childIds) {
      try {
        const r = await this.request(`/users/${id}/profile`);
        if (r.success) children.push(r.user);
      } catch (e) { }
    }
    return { success: true, data: children };
  }

  async getParentApplications() {
    return this.request('/parent/applications');
  }

  async getParentHistory() {
    return this.request('/parent/history');
  }

  async linkChild(email, relationship) {
    return this.request('/auth/link-child', { method: 'POST', body: JSON.stringify({ email, relationship }) });
  }

  async markNotificationRead(id) {
    return this.markRead(id);
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllUsers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${q}`);
  }

  async verifySchool(id) {
    return this.request(`/schools/${id}/verify`, { method: 'PUT' });
  }

  // AI Agent
  async getAgentDashboard() {
    return this.request('/agent/dashboard');
  }

  async getAgentPending(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/agent/pending?${q}`);
  }

  async getAgentScanLogs(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/agent/scan-logs?${q}`);
  }

  async approveAgentOpportunity(id) {
    return this.request(`/agent/approve/${id}`, { method: 'PUT' });
  }

  async rejectAgentOpportunity(id, reason) {
    return this.request(`/agent/reject/${id}`, { method: 'PUT', body: JSON.stringify({ reason }) });
  }

  async bulkApproveAgent(payload) {
    return this.request('/agent/bulk-approve', { method: 'POST', body: JSON.stringify(payload) });
  }

  async scanAgentExcel(formData) {
    const token = this.getToken();
    const url = `${this.baseUrl}/agent/scan-excel`;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }

  async scanAgentUrl(url) {
    return this.request('/agent/scan-url', { method: 'POST', body: JSON.stringify({ url }) });
  }

  async scanAgentLocal() {
    return this.request('/agent/scan-local', { method: 'POST' });
  }

  async scanAgentCrawler() {
    return this.request('/agent/scan-crawler', { method: 'POST' });
  }

  // School Config
  async getSchoolCategories() {
    return this.request('/school-config/categories');
  }

  async createSchoolCategory(body) {
    return this.request('/school-config/categories', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateSchoolCategory(id, body) {
    return this.request(`/school-config/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteSchoolCategory(id) {
    return this.request(`/school-config/categories/${id}`, { method: 'DELETE' });
  }

  async getSchoolFields() {
    return this.request('/school-config/fields');
  }

  async createSchoolField(body) {
    return this.request('/school-config/fields', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateSchoolField(id, body) {
    return this.request(`/school-config/fields/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteSchoolField(id) {
    return this.request(`/school-config/fields/${id}`, { method: 'DELETE' });
  }

  // Services
  async getServiceRequests() {
    return this.request('/services');
  }

  async createServiceRequest(body) {
    return this.request('/services', { method: 'POST', body: JSON.stringify(body) });
  }

  // FAQs
  async getFAQs() {
    return this.request('/faqs');
  }

  // Results
  async getResultSources() {
    return this.request('/results');
  }

  // Recommendations (AI Agent)
  async getRecommendations(count) {
    return this.request(`/agent/recommendations?limit=${count || 20}`);
  }

  // Notables
  async getNotables(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/notables?${q}`);
  }

  async getNotableCategories() {
    return this.request('/notables/categories');
  }

  async trackNotableClick(id) {
    return this.request(`/notables/${id}/click`, { method: 'POST' });
  }

  // Admin Notables
  async getAdminNotables(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/notables/admin?${q}`);
  }

  async getAdminNotable(id) {
    return this.request(`/notables/admin/${id}`);
  }

  async createNotable(body) {
    return this.request('/notables/admin', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateNotable(id, body) {
    return this.request(`/notables/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteNotable(id) {
    return this.request(`/notables/admin/${id}`, { method: 'DELETE' });
  }

  async toggleNotable(id, data) {
    return this.request(`/notables/admin/${id}/toggle`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Service Providers
  async getServiceProviders(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/service-providers?${q}`);
  }

  async getServiceProviderCities() {
    return this.request('/service-providers/cities');
  }

  async trackServiceProviderClick(id) {
    return this.request(`/service-providers/${id}/click`, { method: 'POST' });
  }

  // Admin Service Providers
  async getAdminServiceProviders(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/service-providers/admin?${q}`);
  }

  async getAdminServiceProvider(id) {
    return this.request(`/service-providers/admin/${id}`);
  }

  async createServiceProvider(body) {
    return this.request('/service-providers/admin', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateServiceProvider(id, body) {
    return this.request(`/service-providers/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteServiceProvider(id) {
    return this.request(`/service-providers/admin/${id}`, { method: 'DELETE' });
  }

  async toggleServiceProvider(id, data) {
    return this.request(`/service-providers/admin/${id}/toggle`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Logout
  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') window.location.href = '/auth';
  }
}

const api = new ApiService();
export default api;