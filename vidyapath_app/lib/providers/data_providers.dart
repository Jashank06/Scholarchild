import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import '../core/network/api_client.dart';
import '../models/opportunity.dart';
import '../models/application.dart';

// ═══════════════════════════════════════
// 🎯 OPPORTUNITIES
// ═══════════════════════════════════════

class OpportunitiesState {
  final List<OpportunityModel> items;
  final bool isLoading;
  final String? error;
  final int total;
  final int page;

  const OpportunitiesState({
    this.items = const [], this.isLoading = false,
    this.error, this.total = 0, this.page = 1,
  });

  OpportunitiesState copyWith({List<OpportunityModel>? items, bool? isLoading, String? error, int? total, int? page}) {
    return OpportunitiesState(
      items: items ?? this.items, isLoading: isLoading ?? this.isLoading,
      error: error, total: total ?? this.total, page: page ?? this.page,
    );
  }
}

class OpportunitiesNotifier extends Notifier<OpportunitiesState> {
  @override
  OpportunitiesState build() => const OpportunitiesState();

  ApiClient get _api => ApiClient();

  Future<void> fetchOpportunities({
    String? type, String? category, int? grade,
    String? searchState, String? search, String? sort,
    int page = 1, bool refresh = false,
  }) async {
    if (state.isLoading) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final params = <String, dynamic>{'page': page.toString(), 'limit': '20'};
      if (type != null) params['type'] = type;
      if (category != null) params['category'] = category;
      if (grade != null) params['grade'] = grade.toString();
      if (searchState != null) params['state'] = searchState;
      if (search != null && search.isNotEmpty) params['search'] = search;
      if (sort != null) params['sort'] = sort;

      final res = await _api.get(ApiConfig.opportunities, queryParams: params);
      final list = (res.data['data'] as List).map((j) => OpportunityModel.fromJson(j)).toList();
      final total = res.data['pagination']?['total'] ?? list.length;

      state = state.copyWith(
        items: refresh || page == 1 ? list : [...state.items, ...list],
        total: total, page: page, isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<List<OpportunityModel>> fetchRecommendations({int limit = 10}) async {
    try {
      final res = await _api.get(ApiConfig.recommendations, queryParams: {'limit': limit.toString()});
      final data = res.data['data'] as List;
      return data.map((j) {
        if (j is Map<String, dynamic> && j.containsKey('opportunity')) {
          final opp = OpportunityModel.fromJson(j['opportunity'] as Map<String, dynamic>);
          return OpportunityModel(
            id: opp.id, type: opp.type, title: opp.title,
            description: opp.description, category: opp.category,
            shortDescription: opp.shortDescription, coverImage: opp.coverImage,
            organizer: opp.organizer, tags: opp.tags, eligibility: opp.eligibility,
            rewards: opp.rewards, dates: opp.dates, application: opp.application,
            stats: opp.stats, matchScore: j['matchScore'] as int?,
          );
        }
        return OpportunityModel.fromJson(j as Map<String, dynamic>);
      }).toList();
    } catch (_) {
      return [];
    }
  }

  Future<OpportunityModel?> fetchDetail(String id) async {
    try {
      final res = await _api.get(ApiConfig.opportunityDetail(id));
      return OpportunityModel.fromJson(res.data['data']);
    } catch (_) {
      return null;
    }
  }

  Future<bool> toggleBookmark(String id) async {
    try {
      final res = await _api.post(ApiConfig.bookmarkToggle(id));
      return res.data['bookmarked'] ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<List<OpportunityModel>> fetchBookmarks() async {
    try {
      final res = await _api.get(ApiConfig.userBookmarks);
      return (res.data['data'] as List).map((j) => OpportunityModel.fromJson(j)).toList();
    } catch (_) {
      return [];
    }
  }
}

final opportunitiesProvider = NotifierProvider<OpportunitiesNotifier, OpportunitiesState>(OpportunitiesNotifier.new);

// ═══════════════════════════════════════
// 📝 APPLICATIONS
// ═══════════════════════════════════════

class ApplicationsNotifier extends Notifier<List<ApplicationModel>> {
  @override
  List<ApplicationModel> build() => [];

  ApiClient get _api => ApiClient();

  Future<void> fetchApplications({String? status}) async {
    try {
      final params = <String, dynamic>{};
      if (status != null && status != 'all') params['status'] = status;
      final res = await _api.get(ApiConfig.applications, queryParams: params);
      state = (res.data['data'] as List).map((j) => ApplicationModel.fromJson(j)).toList();
    } catch (_) {}
  }

  Future<bool> apply(String opportunityId) async {
    try {
      await _api.post(ApiConfig.applications, data: {'opportunityId': opportunityId});
      await fetchApplications();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final applicationsProvider = NotifierProvider<ApplicationsNotifier, List<ApplicationModel>>(ApplicationsNotifier.new);

// ═══════════════════════════════════════
// 🔔 NOTIFICATIONS
// ═══════════════════════════════════════

class NotificationsNotifier extends Notifier<List<NotificationModel>> {
  @override
  List<NotificationModel> build() => [];

  ApiClient get _api => ApiClient();
  int unreadCount = 0;

  Future<void> fetch() async {
    try {
      final res = await _api.get(ApiConfig.notifications);
      state = (res.data['data'] as List).map((j) => NotificationModel.fromJson(j)).toList();
      unreadCount = res.data['unreadCount'] ?? 0;
    } catch (_) {}
  }

  Future<void> markRead(String id) async {
    try {
      await _api.put(ApiConfig.markNotificationRead(id));
      state = [for (final n in state) n.id == id
          ? NotificationModel(id: n.id, type: n.type, title: n.title, message: n.message, link: n.link, icon: n.icon, isRead: true, createdAt: n.createdAt)
          : n];
      unreadCount = state.where((n) => !n.isRead).length;
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      await _api.put(ApiConfig.markAllRead);
      state = [for (final n in state)
          NotificationModel(id: n.id, type: n.type, title: n.title, message: n.message, link: n.link, icon: n.icon, isRead: true, createdAt: n.createdAt)];
      unreadCount = 0;
    } catch (_) {}
  }
}

final notificationsProvider = NotifierProvider<NotificationsNotifier, List<NotificationModel>>(NotificationsNotifier.new);

// ═══════════════════════════════════════
// 🌙 THEME
// ═══════════════════════════════════════

class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.system;
  void toggle(ThemeMode mode) => state = mode;
}

final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);

// ═══════════════════════════════════════
// 📱 SHELL NAVIGATION
// ═══════════════════════════════════════

class ShellIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;
  void set(int index) => state = index;
}

final shellIndexProvider = NotifierProvider<ShellIndexNotifier, int>(ShellIndexNotifier.new);

class SelectedCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  void set(String? cat) => state = cat;
}

final selectedCategoryProvider = NotifierProvider<SelectedCategoryNotifier, String?>(SelectedCategoryNotifier.new);

class SelectedTypeNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  void set(String? type) => state = type;
}

final selectedTypeProvider = NotifierProvider<SelectedTypeNotifier, String?>(SelectedTypeNotifier.new);
