import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class EntityCard extends StatelessWidget {
  final String name;
  final String location;
  final List<EntityBadge> badges;
  final double rating;
  final int reviewCount;
  final bool isVerified;
  final List<Widget>? detailRows;
  final String actionLabel;
  final VoidCallback? onTap;
  final Gradient gradient;
  final Widget icon;
  final int index;

  const EntityCard({
    super.key,
    required this.name,
    this.location = '',
    this.badges = const [],
    this.rating = 0,
    this.reviewCount = 0,
    this.isVerified = false,
    this.detailRows,
    this.actionLabel = 'View Details →',
    this.onTap,
    this.gradient = KushaagraTheme.primaryGradient,
    this.icon = const Icon(Icons.school, color: Colors.white, size: 24),
    this.index = 0,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(KushaagraTheme.radiusXL),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(gradient: gradient, borderRadius: BorderRadius.circular(14)),
                  child: icon,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(child: Text(name, style: KushaagraTheme.labelLarge(context), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          if (isVerified) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.verified, size: 16, color: KushaagraTheme.success),
                          ],
                        ],
                      ),
                      if (location.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text('📍 $location', style: KushaagraTheme.bodySmall(context)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            if (badges.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(spacing: 6, runSpacing: 6, children: badges.map((b) => b).toList()),
            ],
            if (detailRows != null) ...[
              const SizedBox(height: 10),
              ...detailRows!,
            ],
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (reviewCount > 0)
                  Row(
                    children: [
                      ...List.generate(5, (i) => Icon(
                        i < rating.round() ? Icons.star : Icons.star_border,
                        size: 16, color: KushaagraTheme.accentGold,
                      )),
                      const SizedBox(width: 4),
                      Text('$reviewCount reviews', style: KushaagraTheme.bodySmall(context)),
                    ],
                  )
                else
                  Text('No reviews yet', style: KushaagraTheme.bodySmall(context)),
                Text(actionLabel, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.primary)),
              ],
            ),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 50 * index))
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.06, curve: Curves.easeOutCubic);
  }
}

class EntityBadge extends StatelessWidget {
  final String label;
  final Color? color;
  final Color? bgColor;

  const EntityBadge({super.key, required this.label, this.color, this.bgColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor ?? color?.withValues(alpha: 0.1) ?? Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color ?? Theme.of(context).colorScheme.onSurfaceVariant)),
    );
  }
}
