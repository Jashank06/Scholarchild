import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../models/activity_log.dart';

class HistoryTimeline extends StatelessWidget {
  final List<ActivityLogModel> logs;
  const HistoryTimeline({super.key, required this.logs});

  @override
  Widget build(BuildContext context) {
    if (logs.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Text('🕐', style: TextStyle(fontSize: 32)),
              const SizedBox(height: 8),
              Text('No activity yet', style: KushaagraTheme.bodySmall(context)),
            ],
          ),
        ),
      );
    }

    return Stack(
      children: [
        Positioned(
          left: 10, top: 8, bottom: 8,
          child: Container(width: 2, color: Theme.of(context).dividerColor),
        ),
        Column(
          children: logs.asMap().entries.map((entry) {
            final idx = entry.key;
            final log = entry.value;
            final isFirst = idx == 0;
            return _timelineEntry(context, log, isFirst)
                .animate(delay: Duration(milliseconds: 80 * idx))
                .fadeIn(duration: 300.ms)
                .slideX(begin: -10, curve: Curves.easeOutCubic);
          }).toList(),
        ),
      ],
    );
  }

  Widget _timelineEntry(BuildContext context, ActivityLogModel log, bool isFirst) {
    final isCreated = log.isCreated;
    final dotColor = isCreated ? KushaagraTheme.success : KushaagraTheme.accentGold;
    final badgeBg = isCreated ? const Color(0xFFECFDF5) : const Color(0xFFFEF3C7);
    final badgeText = isCreated ? const Color(0xFF059669) : const Color(0xFFD97706);

    return Padding(
      padding: const EdgeInsets.only(left: 28, bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                left: -22, top: 4,
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.elasticOut,
                  builder: (_, val, __) => Transform.scale(
                    scale: val,
                    child: Container(
                      width: isCreated ? 16 : 10,
                      height: isCreated ? 16 : 10,
                      decoration: BoxDecoration(
                        color: dotColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: isFirst ? [
                          BoxShadow(color: dotColor.withValues(alpha: 0.3), blurRadius: 6, spreadRadius: 1),
                        ] : null,
                      ),
                    ),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isFirst ? Theme.of(context).cardColor : Theme.of(context).cardColor.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: isFirst ? 1 : 0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 20, height: 20,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: isCreated
                                  ? [const Color(0xFF34D399), const Color(0xFF10B981)]
                                  : [const Color(0xFFFBBF24), const Color(0xFFF59E0B)],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              log.userName.isNotEmpty ? log.userName[0].toUpperCase() : '?',
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(log.userName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: badgeBg, borderRadius: BorderRadius.circular(100)),
                          child: Text(isCreated ? 'Created' : 'Edited',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: badgeText)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(log.createdAt),
                      style: KushaagraTheme.bodySmall(context)?.copyWith(fontSize: 11),
                    ),
                    // Show changes for edits
                    if (!isCreated && log.changeEntries.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      ...log.changeEntries.map((change) {
                        final from = change.value['from'] ?? '(empty)';
                        final to = change.value['to'] ?? '(empty)';
                        final label = _fieldLabel(change.key);
                        return Padding(
                          padding: const EdgeInsets.only(top: 3),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 70,
                                  child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, color: Color(0xFF92400E))),
                                ),
                                Expanded(
                                  child: Text(from, style: const TextStyle(fontSize: 11, color: Color(0xFFDC2626), decoration: TextDecoration.lineThrough), overflow: TextOverflow.ellipsis),
                                ),
                                const Text(' → ', style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                                Expanded(
                                  child: Text(to, style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day} ${_month(date.month)} ${date.year}';
  }

  String _month(int m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];

  String _fieldLabel(String key) {
    const map = {
      'name': 'Name', 'type': 'Type', 'board': 'Board', 'category': 'Category',
      'address.city': 'City', 'address.state': 'State', 'address.district': 'District',
      'contact.email': 'Email', 'contact.phone': 'Phone', 'contact.website': 'Website',
      'venue.city': 'City', 'venue.state': 'State',
      'description': 'Desc', 'eligibility': 'Eligibility', 'prizes': 'Prizes', 'fees': 'Fees',
    };
    return map[key] ?? key;
  }
}
