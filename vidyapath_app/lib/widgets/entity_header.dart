import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class EntityHeader extends StatelessWidget {
  final String name;
  final String location;
  final List<Widget> badges;
  final double rating;
  final int reviewCount;
  final List<Widget>? contactRow;
  final Gradient gradient;

  const EntityHeader({
    super.key,
    required this.name,
    this.location = '',
    this.badges = const [],
    this.rating = 0,
    this.reviewCount = 0,
    this.contactRow,
    this.gradient = KushaagraTheme.primaryGradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(KushaagraTheme.radiusXL),
      ),
      child: Stack(
        children: [
          Positioned(top: -40, right: -40, child: Container(width: 160, height: 160, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), shape: BoxShape.circle))),
          Positioned(bottom: -20, left: 80, child: Container(width: 100, height: 100, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), shape: BoxShape.circle))),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
                        if (location.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text('📍 $location', style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.85))),
                        ],
                        if (badges.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Wrap(spacing: 8, runSpacing: 6, children: badges),
                        ],
                      ],
                    ),
                  ),
                  if (reviewCount > 0)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: rating),
                          duration: 800.ms,
                          builder: (_, val, __) => Text(val.toStringAsFixed(1), style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.white)),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(5, (i) => Icon(
                            i < rating.round() ? Icons.star : Icons.star_border,
                            size: 18, color: Colors.white70,
                          )),
                        ),
                        const SizedBox(height: 4),
                        Text('$reviewCount reviews', style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7))),
                      ],
                    ),
                ],
              ),
              if (contactRow != null) ...[
                const SizedBox(height: 16),
                Wrap(spacing: 16, runSpacing: 8, children: contactRow!),
              ],
            ],
          ),
        ],
      ),
    ).animate().scaleXY(begin: 0.95, end: 1.0, duration: 400.ms, curve: Curves.easeOutCubic).fadeIn();
  }
}
