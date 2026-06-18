import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../models/review.dart';
import 'star_rating.dart';

class ReviewCard extends StatelessWidget {
  final ReviewModel review;
  final List<_ReviewCategory> categories;
  final VoidCallback? onHelpful;
  final VoidCallback? onReport;

  const ReviewCard({
    super.key,
    required this.review,
    this.categories = const [],
    this.onHelpful,
    this.onReport,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    review.userName.isNotEmpty ? review.userName[0].toUpperCase() : '?',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review.userName, style: KushaagraTheme.labelLarge(context)),
                    if (review.reviewType != null)
                      Text(review.reviewType!, style: KushaagraTheme.bodySmall(context)),
                  ],
                ),
              ),
              Column(
                children: [
                  StarRating(rating: review.overallRating, size: 16),
                  const SizedBox(height: 2),
                  Text(review.overallRating.toStringAsFixed(1),
                    style: TextStyle(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.primary, fontSize: 20)),
                ],
              ),
            ],
          ),
          // Title
          if (review.title != null && review.title!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(review.title!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          ],
          // Comment
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment!, style: KushaagraTheme.bodyMedium(context)),
          ],
          // Category ratings grid
          if (categories.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: categories.map((cat) {
                final rating = (review.ratings?[cat.key] as num?)?.toDouble() ?? 0;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(cat.emoji, style: const TextStyle(fontSize: 12)),
                      const SizedBox(width: 4),
                      Text(cat.label, style: KushaagraTheme.bodySmall(context)?.copyWith(fontSize: 11)),
                      const SizedBox(width: 6),
                      Text(rating > 0 ? rating.toStringAsFixed(1) : '—',
                        style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.primary, fontSize: 11)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
          // Pros & Cons
          if (review.pros.isNotEmpty || review.cons.isNotEmpty) ...[
            const SizedBox(height: 12),
            if (review.pros.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('👍 PROS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF059669))),
                      ...review.pros.map((p) => Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text('• $p', style: const TextStyle(fontSize: 13, color: Color(0xFF065F46))),
                      )),
                    ],
                  ),
                ),
              ),
            if (review.cons.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('👎 CONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFDC2626))),
                    ...review.cons.map((c) => Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text('• $c', style: const TextStyle(fontSize: 13, color: Color(0xFF991B1B))),
                    )),
                  ],
                ),
              ),
          ],
          // Helpful button
          if (onHelpful != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                _actionChip(context, '👍 Helpful (${review.helpfulCount})', onHelpful!),
                const SizedBox(width: 8),
                if (onReport != null) _actionChip(context, '🚩 Report', onReport!),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _actionChip(BuildContext context, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(100),
        ),
        child: Text(label, style: KushaagraTheme.bodySmall(context)),
      ),
    );
  }
}

class _ReviewCategory {
  final String key;
  final String label;
  final String emoji;
  const _ReviewCategory({required this.key, required this.label, required this.emoji});
}
