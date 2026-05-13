import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../providers/data_providers.dart';
import '../../models/opportunity.dart';
import '../../widgets/glass_widgets.dart';

class BookmarksScreen extends ConsumerStatefulWidget {
  const BookmarksScreen({super.key});
  @override
  ConsumerState<BookmarksScreen> createState() => _BookmarksScreenState();
}

class _BookmarksScreenState extends ConsumerState<BookmarksScreen> {
  List<OpportunityModel> _bookmarks = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final items = await ref.read(opportunitiesProvider.notifier).fetchBookmarks();
    if (mounted) setState(() { _bookmarks = items; _loading = false; });
  }

  Future<void> _removeBookmark(int index) async {
    final opp = _bookmarks[index];
    setState(() => _bookmarks.removeAt(index));
    await ref.read(opportunitiesProvider.notifier).toggleBookmark(opp.id);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookmarks'),
        actions: [
          if (_bookmarks.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(KushaagraTheme.radiusFull),
                  ),
                  child: Text(
                    '${_bookmarks.length} saved',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF)],
          ),
        ),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _bookmarks.isEmpty
                ? const EmptyState(
                    icon: Icons.bookmark_border_rounded,
                    title: 'No Bookmarks Yet',
                    subtitle: 'Tap the bookmark icon on any opportunity to save it here for later',
                  )
                : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: _bookmarks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) => _bookmarkCard(_bookmarks[i], i),
                    ),
                  ),
      ),
    );
  }

  Widget _bookmarkCard(OpportunityModel opp, int index) {
    return Dismissible(
      key: ValueKey(opp.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _removeBookmark(index),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        decoration: BoxDecoration(
          color: KushaagraTheme.error.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.bookmark_remove, color: KushaagraTheme.error, size: 24),
            const SizedBox(height: 4),
            Text('Remove', style: TextStyle(color: KushaagraTheme.error, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
      child: GlassCard(
        onTap: () => Navigator.pushNamed(context, '/opportunity', arguments: opp.id),
        child: Row(
          children: [
            // Type icon
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(child: Text(opp.typeEmoji, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(opp.title, style: KushaagraTheme.labelLarge(context), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (opp.organizer?.name != null) ...[
                        Icon(Icons.business, size: 13, color: Theme.of(context).colorScheme.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(opp.organizer!.name, style: KushaagraTheme.bodySmall(context), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (opp.rewards?.cashAmount != null && opp.rewards!.cashAmount! > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            gradient: KushaagraTheme.goldGradient,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(opp.rewards!.displayAmount, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      const Spacer(),
                      if (opp.daysLeft >= 0) DeadlineChip(daysLeft: opp.daysLeft),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // Match score
            if (opp.matchScore != null)
              MatchScoreRing(score: opp.matchScore!, size: 40, strokeWidth: 3),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 50 * index)).fadeIn().slideX(begin: 0.05);
  }
}
