import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// API Configuration
class ApiConfig {
  static const String baseUrl = 'http://148.135.136.17:5050/api';
  static const String localUrl = 'http://localhost:5050/api';
  static String get activeUrl => baseUrl;

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyOtp = '/auth/verify-otp';
  static const String me = '/auth/me';
  static const String userProfile = '/users/profile';
  static const String userPreferences = '/users/preferences';
  static const String gamification = '/users/gamification';
  static const String opportunities = '/opportunities';
  static const String recommendations = '/opportunities/recommendations';
  static String opportunityDetail(String id) => '/opportunities/$id';
  static String bookmarkToggle(String id) => '/opportunities/$id/bookmark';
  static const String userBookmarks = '/opportunities/user/bookmarks';
  static const String applications = '/applications';
  static String applicationDetail(String id) => '/applications/$id';
  static const String documents = '/documents';
  static const String uploadDocument = '/documents/upload';
  static String deleteDocument(String id) => '/documents/$id';
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';
  static const String markAllRead = '/notifications/read-all';
  static const String schools = '/schools';
  static String schoolDetail(String id) => '/schools/$id';
  static const String services = '/services';
  static const String publicStats = '/public-stats';

  // Admin Routes
  static const String adminStats = '/admin/stats';
  static const String adminUsers = '/admin/users';
  static const String adminSchools = '/schools'; 
  static const String adminTickets = '/services';

  // Parent Routes
  static const String parentApplications = '/parent/applications';
  static const String parentChildren = '/parent/children';
}

/// Dio-based HTTP client with JWT interceptor & error handling
class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;
  static const String _tokenKey = 'kushaagra_token';

  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.activeUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) => handler.next(error),
    ));
  }

  Future<String?> getToken() async {
    try { 
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    } catch (_) { return null; }
  }
  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }
  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }
  Future<bool> hasToken() async => (await getToken())?.isNotEmpty == true;

  Future<Response> get(String path, {Map<String, dynamic>? queryParams}) =>
      _dio.get(path, queryParameters: queryParams);
  Future<Response> post(String path, {dynamic data}) => _dio.post(path, data: data);
  Future<Response> put(String path, {dynamic data}) => _dio.put(path, data: data);
  Future<Response> delete(String path) => _dio.delete(path);

  Future<Response> uploadFile(String path, FormData formData) =>
      _dio.post(path, data: formData,
        options: Options(headers: {'Content-Type': 'multipart/form-data'}));

  String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    final serverUrl = ApiConfig.activeUrl.replaceAll('/api', '');
    return '$serverUrl$path';
  }
}
