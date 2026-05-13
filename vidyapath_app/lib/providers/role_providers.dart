import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';

// --- Admin Stats Provider ---

class AdminStats {
  final int totalUsers;
  final int totalStudents;
  final int totalScholarships;
  final int totalCompetitions;
  final int totalSchemes;
  final int totalApplications;
  final int totalOpportunities;

  AdminStats({
    required this.totalUsers,
    required this.totalStudents,
    required this.totalScholarships,
    required this.totalCompetitions,
    required this.totalSchemes,
    required this.totalApplications,
    required this.totalOpportunities,
  });

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      totalUsers: json['totalUsers'] ?? 0,
      totalStudents: json['totalStudents'] ?? 0,
      totalScholarships: json['totalScholarships'] ?? 0,
      totalCompetitions: json['totalCompetitions'] ?? 0,
      totalSchemes: json['totalSchemes'] ?? 0,
      totalApplications: json['totalApplications'] ?? 0,
      totalOpportunities: json['totalOpportunities'] ?? 0,
    );
  }
}

class AdminStatsState {
  final AdminStats? stats;
  final bool isLoading;
  final String? error;

  AdminStatsState({this.stats, this.isLoading = true, this.error});
}

class AdminStatsNotifier extends Notifier<AdminStatsState> {
  @override
  AdminStatsState build() {
    Future.microtask(() => fetchStats());
    return AdminStatsState();
  }

  Future<void> fetchStats() async {
    state = AdminStatsState(isLoading: true);
    try {
      final res = await ApiClient().get(ApiConfig.adminStats);
      if (res.data['success']) {
        state = AdminStatsState(
          stats: AdminStats.fromJson(res.data['stats']),
          isLoading: false,
        );
      } else {
        state = AdminStatsState(isLoading: false, error: 'Failed to load stats');
      }
    } catch (e) {
      state = AdminStatsState(isLoading: false, error: e.toString());
    }
  }
}

final adminStatsProvider = NotifierProvider<AdminStatsNotifier, AdminStatsState>(AdminStatsNotifier.new);

// --- Generic List State ---
class AdminListState<T> {
  final List<T> items;
  final bool isLoading;
  final String? error;
  AdminListState({this.items = const [], this.isLoading = true, this.error});
}

// --- Admin Users Provider ---
class AdminUsersNotifier extends Notifier<AdminListState<Map<String, dynamic>>> {
  @override
  AdminListState<Map<String, dynamic>> build() {
    Future.microtask(() => fetchUsers());
    return AdminListState();
  }

  Future<void> fetchUsers() async {
    state = AdminListState(isLoading: true);
    try {
      final res = await ApiClient().get(ApiConfig.adminUsers);
      if (res.data['success']) {
        state = AdminListState(items: List<Map<String, dynamic>>.from(res.data['data']), isLoading: false);
      } else {
        state = AdminListState(isLoading: false, error: 'Failed to load users');
      }
    } catch (e) {
      state = AdminListState(isLoading: false, error: e.toString());
    }
  }
}
final adminUsersProvider = NotifierProvider<AdminUsersNotifier, AdminListState<Map<String, dynamic>>>(AdminUsersNotifier.new);

// --- Admin Opportunities Provider ---
class AdminOpportunitiesNotifier extends Notifier<AdminListState<Map<String, dynamic>>> {
  @override
  AdminListState<Map<String, dynamic>> build() {
    Future.microtask(() => fetchOpportunities());
    return AdminListState();
  }

  Future<void> fetchOpportunities() async {
    state = AdminListState(isLoading: true);
    try {
      final res = await ApiClient().get(ApiConfig.opportunities);
      if (res.data['success']) {
        state = AdminListState(items: List<Map<String, dynamic>>.from(res.data['data']), isLoading: false);
      } else {
        state = AdminListState(isLoading: false, error: 'Failed to load opportunities');
      }
    } catch (e) {
      state = AdminListState(isLoading: false, error: e.toString());
    }
  }
}
final adminOpportunitiesProvider = NotifierProvider<AdminOpportunitiesNotifier, AdminListState<Map<String, dynamic>>>(AdminOpportunitiesNotifier.new);

// --- Admin Schools Provider ---
class AdminSchoolsNotifier extends Notifier<AdminListState<Map<String, dynamic>>> {
  @override
  AdminListState<Map<String, dynamic>> build() {
    Future.microtask(() => fetchSchools());
    return AdminListState();
  }

  Future<void> fetchSchools() async {
    state = AdminListState(isLoading: true);
    try {
      final res = await ApiClient().get(ApiConfig.adminSchools);
      if (res.data['success']) {
        state = AdminListState(items: List<Map<String, dynamic>>.from(res.data['data']), isLoading: false);
      } else {
        state = AdminListState(isLoading: false, error: 'Failed to load schools');
      }
    } catch (e) {
      state = AdminListState(isLoading: false, error: e.toString());
    }
  }
}
final adminSchoolsProvider = NotifierProvider<AdminSchoolsNotifier, AdminListState<Map<String, dynamic>>>(AdminSchoolsNotifier.new);

// --- Admin Tickets Provider ---
class AdminTicketsNotifier extends Notifier<AdminListState<Map<String, dynamic>>> {
  @override
  AdminListState<Map<String, dynamic>> build() {
    Future.microtask(() => fetchTickets());
    return AdminListState();
  }

  Future<void> fetchTickets() async {
    state = AdminListState(isLoading: true);
    try {
      final res = await ApiClient().get(ApiConfig.adminTickets);
      if (res.data['success']) {
        state = AdminListState(items: List<Map<String, dynamic>>.from(res.data['data']), isLoading: false);
      } else {
        state = AdminListState(isLoading: false, error: 'Failed to load tickets');
      }
    } catch (e) {
      state = AdminListState(isLoading: false, error: e.toString());
    }
  }
}
final adminTicketsProvider = NotifierProvider<AdminTicketsNotifier, AdminListState<Map<String, dynamic>>>(AdminTicketsNotifier.new);
