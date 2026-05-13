import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../models/user.dart';

class ParentState {
  final bool isLoading;
  final List<LinkedChild> children;
  final String? error;

  const ParentState({this.isLoading = false, this.children = const [], this.error});

  ParentState copyWith({bool? isLoading, List<LinkedChild>? children, String? error}) {
    return ParentState(
      isLoading: isLoading ?? this.isLoading,
      children: children ?? this.children,
      error: error,
    );
  }
}

class ParentNotifier extends Notifier<ParentState> {
  @override
  ParentState build() => const ParentState();

  ApiClient get _api => ApiClient();

  Future<void> fetchParentData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.get(ApiConfig.parentApplications);
      final List data = res.data['data'] ?? [];
      final children = data.map((c) => LinkedChild.fromJson(c)).toList();
      state = state.copyWith(isLoading: false, children: children);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final parentProvider = NotifierProvider<ParentNotifier, ParentState>(ParentNotifier.new);
