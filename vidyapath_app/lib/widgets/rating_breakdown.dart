import 'package:flutter/material.dart';
import '../../config/theme.dart';

class RatingBreakdown extends StatelessWidget {
  final double overallRating;
  final int totalReviews;
  final List<RatingCategory> categories;

  const RatingBreakdown({
    super.key,
    required this.overallRating,
    required this.totalReviews,
    required this.categories,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Overall score center
        Center(
          child: Column(
            children: [
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: overallRating),
                duration: const Duration(milliseconds: 800),
                curve: Curves.easeOutCubic,
                builder: (_, val, __) => Text(
                  val.toStringAsFixed(1),
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.w900,
                    color: Theme.of(context).colorScheme.onSurface,
                    fontFamily: 'Outfit',
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) => Icon(
                  i < overallRating.round() ? Icons.star : Icons.star_border,
                  size: 24,
                  color: KushaagraTheme.accentGold,
                )),
              ),
              const SizedBox(height: 4),
              Text('Based on $totalReviews reviews',
                style: KushaagraTheme.bodySmall(context)),
            ],
          ),
        ),
        const SizedBox(height: 24),
        // Category bars
        ...categories.map((cat) => _categoryBar(context, cat)),
      ],
    );
  }

  Widget _categoryBar(BuildContext context, RatingCategory cat) {
    final percentage = (cat.rating / 5) * 100;
    final color = cat.rating >= 4
        ? KushaagraTheme.success
        : cat.rating >= 3
            ? KushaagraTheme.accentGold
            : KushaagraTheme.error;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${cat.emoji} ${cat.label}', style: KushaagraTheme.bodySmall(context)),
              Text(
                cat.rating > 0 ? cat.rating.toStringAsFixed(1) : '—',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: percentage / 100),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOutCubic,
              builder: (_, val, __) => LinearProgressIndicator(
                value: val,
                backgroundColor: color.withValues(alpha: 0.15),
                valueColor: AlwaysStoppedAnimation(color),
                minHeight: 8,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class RatingCategory {
  final String key;
  final String label;
  final String emoji;
  final double rating;
  const RatingCategory({required this.key, required this.label, required this.emoji, required this.rating});
}
