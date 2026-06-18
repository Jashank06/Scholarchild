import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../models/service_provider.dart';

class ServiceProviderCard extends StatelessWidget {
  final ServiceProviderModel provider;
  final VoidCallback? onTap;
  final int index;

  const ServiceProviderCard({super.key, required this.provider, this.onTap, this.index = 0});

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
                  decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF6366F1)]), borderRadius: BorderRadius.circular(14)),
                  child: const Icon(Icons.business, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(provider.name, style: KushaagraTheme.labelLarge(context)),
                      if (provider.tagline != null) ...[
                        const SizedBox(height: 2),
                        Text(provider.tagline!, style: KushaagraTheme.bodySmall(context), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ],
                  ),
                ),
                if (provider.rating > 0)
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: KushaagraTheme.accentGold),
                      const SizedBox(width: 2),
                      Text(provider.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
              ],
            ),
            if (provider.location.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text('📍 ${provider.location}', style: KushaagraTheme.bodySmall(context)),
            ],
            if (provider.servicesOffered.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(spacing: 6, runSpacing: 6,
                children: provider.servicesOffered.map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFF3B82F6).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(100)),
                  child: Text(s, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF3B82F6))),
                )).toList(),
              ),
            ],
            if (provider.discountInfo != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10)),
                child: Row(children: [
                  const Icon(Icons.local_offer, size: 14, color: KushaagraTheme.accentGold),
                  const SizedBox(width: 6),
                  Expanded(child: Text(provider.discountInfo!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF92400E)))),
                ]),
              ),
            ],
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 60 * index)).fadeIn(duration: 400.ms).slideY(begin: 0.06, curve: Curves.easeOutCubic);
  }
}
