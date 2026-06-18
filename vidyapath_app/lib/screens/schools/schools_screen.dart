import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../widgets/glass_widgets.dart';
import '../../widgets/schools/add_school_sheet.dart';
import 'school_detail_screen.dart';

class SchoolsScreen extends ConsumerStatefulWidget {
  const SchoolsScreen({super.key});
  @override
  ConsumerState<SchoolsScreen> createState() => _SchoolsScreenState();
}

class _SchoolsScreenState extends ConsumerState<SchoolsScreen> {
  List<Map<String, dynamic>> _schools = [];
  bool _loading = true;
  final _searchController = TextEditingController();

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load({String? search}) async {
    setState(() => _loading = true);
    try {
      final params = <String, dynamic>{};
      if (search != null && search.isNotEmpty) params['search'] = search;
      final res = await ApiClient().get(ApiConfig.schools, queryParams: params);
      _schools = List<Map<String, dynamic>>.from(res.data['data'] ?? []);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _openAdd() => showModalBottomSheet(
    context: context, isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => AddSchoolSheet(onDone: _load),
  );

  void _openDetail(String id) => Navigator.push(context, MaterialPageRoute(
    builder: (_) => SchoolDetailScreen(schoolId: id),
  ));

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Schools Directory 🏫')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAdd, icon: const Icon(Icons.add),
        label: const Text('Add School'),
        backgroundColor: KushaagraTheme.primaryBlue,
      ).animate().scale(duration: 300.ms),
      body: Container(
        decoration: BoxDecoration(gradient: LinearGradient(
          begin: Alignment.topCenter, end: Alignment.bottomCenter,
          colors: isDark ? [const Color(0xFF0F172A), const Color(0xFF020617)] : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF)],
        )),
        child: Column(children: [
          Padding(padding: const EdgeInsets.fromLTRB(20, 8, 20, 12), child: GlassCard(padding: EdgeInsets.zero, child: TextField(
            controller: _searchController, onChanged: (v) => _load(search: v),
            decoration: InputDecoration(hintText: 'Search schools...', prefixIcon: Icon(Icons.search, color: Theme.of(context).colorScheme.primary), border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
          )).animate().fadeIn()),
          Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _schools.isEmpty
              ? const EmptyState(icon: Icons.school_outlined, title: 'No Schools Found', subtitle: 'Add the first school!')
              : RefreshIndicator(onRefresh: () => _load(search: _searchController.text), child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 20), itemCount: _schools.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) => _schoolCard(_schools[i], i).animate(delay: Duration(milliseconds: 50 * i)).fadeIn().slideY(begin: 0.08),
                )),
          ),
        ]),
      ),
    );
  }

  Widget _schoolCard(Map<String, dynamic> school, int index) {
    final name = school['name'] ?? 'Unknown';
    final city = school['address']?['city'] ?? '';
    final state = school['address']?['state'] ?? '';
    final board = school['board'] as String?;
    final type = school['type'] as String?;
    final ratings = school['ratings'] as Map<String, dynamic>?;
    final overall = (ratings?['overall'] as num?)?.toDouble() ?? 0;
    final total = (ratings?['totalReviews'] as num?)?.toInt() ?? 0;
    final isVerified = school['isVerified'] ?? false;

    return GlassCard(
      onTap: () => _openDetail(school['_id']),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(gradient: KushaagraTheme.primaryGradient, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.school, color: Colors.white, size: 24)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Flexible(child: Text(name, style: KushaagraTheme.labelLarge(context), maxLines: 1, overflow: TextOverflow.ellipsis)), if (isVerified) const Padding(padding: EdgeInsets.only(left: 6), child: Icon(Icons.verified, size: 16, color: KushaagraTheme.primaryBlue))]),
            if (type != null || board != null) Padding(padding: const EdgeInsets.only(top: 2), child: Wrap(spacing: 6, children: [
              if (type != null) _chip(type, KushaagraTheme.primaryBlue),
              if (board != null) _chip(board, const Color(0xFF6B7280)),
            ])),
          ])),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          if (city.isNotEmpty || state.isNotEmpty) ...[Icon(Icons.location_on_outlined, size: 14, color: Theme.of(context).colorScheme.onSurfaceVariant), const SizedBox(width: 4), Text([city, state].where((s) => s.isNotEmpty).join(', '), style: KushaagraTheme.bodySmall(context))],
          const Spacer(),
          if (overall > 0) Row(mainAxisSize: MainAxisSize.min, children: [
            ...List.generate(5, (i) => Icon(i < overall.round() ? Icons.star : Icons.star_border, size: 16, color: KushaagraTheme.accentGold)),
            const SizedBox(width: 4), Text('($total)', style: KushaagraTheme.bodySmall(context)),
          ]) else Text('No reviews', style: KushaagraTheme.bodySmall(context)),
        ]),
      ]),
    );
  }

  Widget _chip(String text, Color color) => Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(100)), child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)));
}

