import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../providers/data_providers.dart';
import '../../widgets/glass_widgets.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    ref.read(notificationsProvider.notifier).fetch();
  }

  @override
  Widget build(BuildContext context) {
    final notifications = ref.watch(notificationsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (notifications.any((n) => !n.isRead))
            TextButton(
              onPressed: () => ref.read(notificationsProvider.notifier).markAllRead(),
              child: Text('Mark all read', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13)),
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
        child: notifications.isEmpty
            ? const EmptyState(
                icon: Icons.notifications_none,
                title: 'No Notifications',
                subtitle: 'You\'re all caught up!',
              )
            : RefreshIndicator(
                onRefresh: () async => ref.read(notificationsProvider.notifier).fetch(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final notif = notifications[i];
                    return Dismissible(
                      key: ValueKey(notif.id),
                      direction: DismissDirection.endToStart,
                      onDismissed: (_) => ref.read(notificationsProvider.notifier).markRead(notif.id),
                      background: Container(
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.only(right: 20),
                        decoration: BoxDecoration(
                          color: KushaagraTheme.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
                        ),
                        child: const Icon(Icons.check_circle, color: KushaagraTheme.success),
                      ),
                      child: GlassCard(
                        onTap: () => ref.read(notificationsProvider.notifier).markRead(notif.id),
                        gradient: !notif.isRead ? LinearGradient(
                          colors: [
                            Theme.of(context).colorScheme.primary.withValues(alpha: 0.06),
                            Colors.transparent,
                          ],
                        ) : null,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(notif.icon ?? '🔔', style: const TextStyle(fontSize: 28)),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(notif.title, style: KushaagraTheme.labelLarge(context)),
                                      ),
                                      if (!notif.isRead)
                                        Container(
                                          width: 8, height: 8,
                                          decoration: const BoxDecoration(
                                            color: KushaagraTheme.primaryBlue,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(notif.message, style: KushaagraTheme.bodySmall(context), maxLines: 2, overflow: TextOverflow.ellipsis),
                                  if (notif.createdAt != null) ...[
                                    const SizedBox(height: 6),
                                    Text(
                                      _formatTime(notif.createdAt!),
                                      style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: Duration(milliseconds: 50 * i)).fadeIn().slideX(begin: 0.05);
                  },
                ),
              ),
      ),
    );
  }

  String _formatTime(String iso) {
    try {
      final dt = DateTime.parse(iso);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
