import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../models/notable.dart';

class NotableCard extends StatelessWidget {
  final NotableModel notable;
  final VoidCallback? onTap;
  final int index;

  const NotableCard({super.key, required this.notable, this.onTap, this.index = 0});

  @override
  Widget build(BuildContext context) {
    final isFeatured = notable.featured;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: isFeatured ? KushaagraTheme.goldGradient : null,
          color: isFeatured ? null : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(KushaagraTheme.radiusXL),
          border: isFeatured ? null : Border.all(color: Theme.of(context).dividerColor),
          boxShadow: isFeatured ? [BoxShadow(color: KushaagraTheme.accentGold.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 8))] : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (notable.image != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(KushaagraTheme.radiusXL)),
                child: Image.network(notable.image!, height: 160, width: double.infinity, fit: BoxFit.cover),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (notable.category != null || notable.featured)
                    Row(
                      children: [
                        if (notable.featured)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(100)),
                            child: const Text('Featured', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                          ),
                        if (notable.category != null) ...[
                          if (notable.featured) const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: KushaagraTheme.accentGold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(100)),
                            child: Text(notable.category!, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: isFeatured ? Colors.white70 : KushaagraTheme.accentGold)),
                          ),
                        ],
                      ],
                    ),
                  const SizedBox(height: 8),
                  Text(notable.title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: isFeatured ? Colors.white : null), maxLines: 2, overflow: TextOverflow.ellipsis),
                  if (notable.description != null) ...[
                    const SizedBox(height: 6),
                    Text(notable.description!, style: TextStyle(fontSize: 13, color: isFeatured ? Colors.white70 : null, fontFamily: 'Inter'), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                  if (notable.link != null) ...[
                    const SizedBox(height: 10),
                    Text(notable.linkLabel ?? 'Learn More →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isFeatured ? Colors.white : Theme.of(context).colorScheme.primary)),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 60 * index)).fadeIn(duration: 400.ms).slideY(begin: 0.06, curve: Curves.easeOutCubic);
  }
}
