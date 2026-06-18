import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/review.dart';
import '../../models/activity_log.dart';
import '../../widgets/entity_header.dart';
import '../../widgets/rating_breakdown.dart';
import '../../widgets/review_card.dart';
import '../../widgets/history_timeline.dart';
import '../../widgets/star_rating.dart';
import '../../widgets/schools/school_review_sheet.dart';
import '../../widgets/schools/add_school_sheet.dart';

class SchoolDetailScreen extends StatefulWidget {
  final String schoolId;
  const SchoolDetailScreen({super.key, required this.schoolId});

  @override
  State<SchoolDetailScreen> createState() => _SchoolDetailScreenState();
}

class _SchoolDetailScreenState extends State<SchoolDetailScreen> {
  Map<String, dynamic>? _school;
  List<ReviewModel> _reviews = [];
  List<ActivityLogModel> _history = [];
  bool _loading = true;
  ReviewModel? _userReview;

  static const _categories = [
    _RC(key: 'academics', label: 'Academics', emoji: '📚'),
    _RC(key: 'infrastructure', label: 'Infrastructure', emoji: '🏗️'),
    _RC(key: 'faculty', label: 'Faculty', emoji: '👨‍🏫'),
    _RC(key: 'extracurricular', label: 'Extracurricular', emoji: '🎨'),
    _RC(key: 'safety', label: 'Safety', emoji: '🛡️'),
    _RC(key: 'communication', label: 'Communication', emoji: '📢'),
    _RC(key: 'valueForMoney', label: 'Value for Money', emoji: '💰'),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('${ApiConfig.schools}/${widget.schoolId}');
      final data = res.data;
      setState(() {
        _school = data['school'] ?? data['data']?['school'] ?? data;
        _reviews = (data['reviews'] as List?)?.map((r) => ReviewModel.fromJson(r, entityIdKey: 'schoolId')).toList() ?? [];
        _userReview = _reviews.cast<ReviewModel?>().firstWhere((r) => r?.userId == _currentUserId, orElse: () => null);
      });

      // Load history
      final hRes = await ApiClient().get('${ApiConfig.schools}/${widget.schoolId}/history');
      _history = (hRes.data['data'] as List?)?.map((h) => ActivityLogModel.fromJson(h)).toList() ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  String? get _currentUserId => null; // TODO: get from auth provider

  void _showSheet(Widget sheet) => showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => sheet,
  );

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_school == null) return Scaffold(appBar: AppBar(title: const Text('School')), body: const Center(child: Text('Not found')));

    final school = _school!;
    final name = school['name'] ?? '';
    final city = school['address']?['city'] ?? '';
    final state = school['address']?['state'] ?? '';
    final district = school['address']?['district'] ?? '';
    final board = school['board'] as String?;
    final type = school['type'] as String?;
    final isVerified = school['isVerified'] ?? false;
    final ratings = school['ratings'] as Map<String, dynamic>?;
    final overall = (ratings?['overall'] as num?)?.toDouble() ?? 0;
    final total = (ratings?['totalReviews'] as num?)?.toInt() ?? 0;
    final contact = school['contact'] as Map<String, dynamic>?;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(title: Text(name, style: const TextStyle(color: Colors.white))),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  EntityHeader(
                    name: name,
                    location: [city, district, state].where((s) => s.isNotEmpty).join(', '),
                    rating: overall,
                    reviewCount: total,
                    gradient: const LinearGradient(colors: [Color(0xFF667eea), Color(0xFF764ba2)]),
                    badges: [
                      if (board != null) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(100)), child: Text(board, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
                      if (type != null) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(100)), child: Text(type, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
                      if (isVerified) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: KushaagraTheme.success, borderRadius: BorderRadius.circular(100)), child: const Text('✓ Verified', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
                    ],
                    contactRow: [
                      if (contact?['phone'] != null) Text('📞 ${contact!['phone']}', style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13)),
                      if (contact?['email'] != null) Text('✉️ ${contact!['email']}', style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13)),
                    ],
                  ).animate().fadeIn(),

                  const SizedBox(height: 16),
                  Row(children: [
                    Expanded(child: _actionBtn(context, _userReview != null ? '✏️ Edit Review' : '⭐ Write a Review', _userReview != null ? KushaagraTheme.success : const Color(0xFF667eea), () => _showSheet(SchoolReviewSheet(schoolId: widget.schoolId, schoolName: name, existingReview: _userReview, onDone: _load)))),
                    const SizedBox(width: 10),
                    Expanded(child: _actionBtn(context, '📝 Edit Info', const Color(0xFF7C3AED), () => _showSheet(AddSchoolSheet(schoolId: widget.schoolId, existingData: school, onDone: _load)))),
                  ]).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 20),
                  if (_reviews.isEmpty)
                    const Padding(padding: EdgeInsets.all(40), child: Text('No reviews yet', textAlign: TextAlign.center))
                  else
                    ..._reviews.map((r) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ReviewCard(review: r),
                    )),

                  const SizedBox(height: 20),
                  if (total > 0)
                    RatingBreakdown(
                      overallRating: overall,
                      totalReviews: total,
                      categories: _categories.map((c) => RatingCategory(
                        key: c.key, label: c.label, emoji: c.emoji,
                        rating: (ratings?[c.key] as num?)?.toDouble() ?? 0,
                      )).toList(),
                    ),

                  const SizedBox(height: 20),
                  Text('📜 Activity History', style: KushaagraTheme.displaySmall(context)),
                  const SizedBox(height: 12),
                  HistoryTimeline(logs: _history),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(BuildContext context, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(100)),
        child: Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
      ),
    );
  }
}

class _RC {
  final String key, label, emoji;
  const _RC({required this.key, required this.label, required this.emoji});
}
