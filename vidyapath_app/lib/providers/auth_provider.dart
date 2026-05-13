import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../models/user.dart';

enum AuthStatus { initial, loading, authenticated, otpSent, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;
  final String? userId;
  final String? otp;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.error,
    this.userId,
    this.otp,
  });

  AuthState copyWith({AuthStatus? status, UserModel? user, String? error, String? userId, String? otp}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
      userId: userId ?? this.userId,
      otp: otp ?? this.otp,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  ApiClient get _api => ApiClient();

  Future<void> checkAuth() async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      if (!await _api.hasToken()) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return;
      }
      final res = await _api.get(ApiConfig.me);
      final user = UserModel.fromJson(res.data['user']);
      state = state.copyWith(status: AuthStatus.authenticated, user: user);
    } catch (e) {
      await _api.removeToken();
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login({String? email, String? phone}) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final body = <String, dynamic>{};
      if (email != null && email.isNotEmpty) body['email'] = email;
      if (phone != null && phone.isNotEmpty) body['phone'] = phone;

      final res = await _api.post(ApiConfig.login, data: body);
      state = state.copyWith(
        status: AuthStatus.otpSent,
        userId: res.data['userId'],
        otp: res.data['otp'],
      );
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, error: _extractError(e));
    }
  }

  Future<void> register({
    required String email, String? phone, required String role,
    String? firstName, String? lastName, int? grade, String? userState, String? board,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final body = <String, dynamic>{
        'email': email, 'role': role,
        if (phone != null) 'phone': phone,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (grade != null) 'grade': grade,
        if (userState != null) 'state': userState,
        if (board != null) 'board': board,
      };

      final res = await _api.post(ApiConfig.register, data: body);
      if (res.data['token'] != null) await _api.setToken(res.data['token']);
      state = state.copyWith(
        status: AuthStatus.otpSent,
        userId: res.data['user']?['id'],
        otp: res.data['otp'],
      );
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, error: _extractError(e));
    }
  }

  Future<void> verifyOtp(String otp) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final res = await _api.post(ApiConfig.verifyOtp, data: {'userId': state.userId, 'otp': otp});
      if (res.data['token'] != null) await _api.setToken(res.data['token']);
      final user = UserModel.fromJson(res.data['user']);
      state = state.copyWith(status: AuthStatus.authenticated, user: user);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, error: _extractError(e));
    }
  }

  Future<void> refreshUser() async {
    try {
      final res = await _api.get(ApiConfig.me);
      final user = UserModel.fromJson(res.data['user']);
      state = state.copyWith(user: user);
    } catch (_) {}
  }

  Future<void> updateProfilePicture(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath, filename: 'avatar.jpg'),
      });
      
      final res = await _api.uploadFile('/users/profile/avatar', formData);
      if (res.data['user'] != null) {
        final user = UserModel.fromJson(res.data['user']);
        state = state.copyWith(user: user);
      }
    } catch (e) {
      state = state.copyWith(error: _extractError(e));
    }
  }

  Future<void> logout() async {
    await _api.removeToken();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  String _extractError(dynamic e) {
    try {
      if (e is DioException && e.response?.data != null) {
        return e.response!.data['message'] ?? 'Network error';
      }
    } catch (_) {}
    return e.toString().replaceAll('Exception: ', '').split('\n').first;
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
