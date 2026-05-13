import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../widgets/glass_widgets.dart';
import '../../widgets/kushaagra_drawer.dart';

class ServicesScreen extends ConsumerStatefulWidget {
  const ServicesScreen({super.key});
  @override
  ConsumerState<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends ConsumerState<ServicesScreen> {
  List<Map<String, dynamic>> _requests = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get(ApiConfig.services);
      _requests = List<Map<String, dynamic>>.from(res.data['data'] ?? []);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showCreateDialog() {
    final subjectController = TextEditingController();
    final descController = TextEditingController();
    String selectedType = 'help';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (ctx, setSheetState) => Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
              decoration: BoxDecoration(
                color: isDark ? KushaagraTheme.surfaceDark : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2)))),
                    const SizedBox(height: 20),
                    Text('New Support Request', style: KushaagraTheme.titleLarge(ctx)),
                    const SizedBox(height: 20),

                    // Type selector
                    Text('Type', style: KushaagraTheme.labelLarge(ctx)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _typeChip(ctx, 'help', '🆘 Help', selectedType, (v) => setSheetState(() => selectedType = v)),
                        const SizedBox(width: 8),
                        _typeChip(ctx, 'complaint', '📢 Complaint', selectedType, (v) => setSheetState(() => selectedType = v)),
                        const SizedBox(width: 8),
                        _typeChip(ctx, 'feedback', '💬 Feedback', selectedType, (v) => setSheetState(() => selectedType = v)),
                      ],
                    ),

                    const SizedBox(height: 16),

                    TextField(
                      controller: subjectController,
                      decoration: const InputDecoration(
                        hintText: 'Subject',
                        prefixIcon: Icon(Icons.subject),
                      ),
                    ),

                    const SizedBox(height: 12),

                    TextField(
                      controller: descController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'Describe your issue or feedback...',
                        alignLabelWithHint: true,
                      ),
                    ),

                    const SizedBox(height: 20),

                    SizedBox(
                      width: double.infinity,
                      child: LiquidButton(
                        text: 'Submit Request',
                        icon: Icons.send_rounded,
                        onPressed: () async {
                          if (subjectController.text.isEmpty || descController.text.isEmpty) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(content: Text('Please fill all fields')),
                            );
                            return;
                          }
                          try {
                            await ApiClient().post(ApiConfig.services, data: {
                              'type': selectedType,
                              'subject': subjectController.text,
                              'description': descController.text,
                            });
                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text('✅ Request submitted successfully!'),
                                  backgroundColor: KushaagraTheme.success,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              );
                              _load();
                            }
                          } catch (e) {
                            if (ctx.mounted) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                SnackBar(content: Text('Failed: ${e.toString().split('\n').first}'), backgroundColor: KushaagraTheme.error),
                              );
                            }
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      drawer: const KushaagraDrawer(),
      appBar: AppBar(
        title: const Text('Help & Support'),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded),
            onPressed: () {
              HapticFeedback.lightImpact();
              Scaffold.of(context).openDrawer();
            },
          ),
        ),
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
            : Column(
                children: [
                  // Quick action cards
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                    child: Row(
                      children: [
                        Expanded(child: _quickAction('🆘', 'Get Help', () => _showCreateDialog())),
                        const SizedBox(width: 10),
                        Expanded(child: _quickAction('📢', 'Report', () => _showCreateDialog())),
                        const SizedBox(width: 10),
                        Expanded(child: _quickAction('💬', 'Feedback', () => _showCreateDialog())),
                      ],
                    ).animate().fadeIn(),
                  ),

                  const SizedBox(height: 20),

                  // Previous requests
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        Text('Your Requests', style: KushaagraTheme.titleLarge(context)),
                        const Spacer(),
                        if (_requests.isNotEmpty)
                          Text('${_requests.length} total', style: KushaagraTheme.bodySmall(context)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  Expanded(
                    child: _requests.isEmpty
                        ? const EmptyState(
                            icon: Icons.support_agent,
                            title: 'No Requests Yet',
                            subtitle: 'Need help? Tap the buttons above to create a support request',
                          )
                        : RefreshIndicator(
                            onRefresh: _load,
                            child: ListView.separated(
                              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                              itemCount: _requests.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (_, i) => _requestCard(_requests[i], i),
                            ),
                          ),
                  ),
                ],
              ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateDialog,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Request'),
      ),
    );
  }

  Widget _quickAction(String emoji, String label, VoidCallback onTap) {
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Text(label, style: KushaagraTheme.labelLarge(context)),
        ],
      ),
    );
  }

  Widget _requestCard(Map<String, dynamic> req, int index) {
    final status = req['status'] ?? 'open';
    final statusColor = status == 'resolved' ? KushaagraTheme.success
        : status == 'in_progress' ? KushaagraTheme.accentGold
        : KushaagraTheme.primaryBlue;
    final typeEmoji = req['type'] == 'complaint' ? '📢' : req['type'] == 'feedback' ? '💬' : '🆘';

    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(typeEmoji, style: const TextStyle(fontSize: 22)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(req['subject'] ?? 'No subject', style: KushaagraTheme.labelLarge(context), maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  status.toString().replaceAll('_', ' ').toUpperCase(),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            req['description'] ?? '',
            style: KushaagraTheme.bodySmall(context),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (req['response'] != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: KushaagraTheme.success.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: KushaagraTheme.success.withValues(alpha: 0.2)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.support_agent, size: 16, color: KushaagraTheme.success),
                  const SizedBox(width: 8),
                  Expanded(child: Text(req['response'], style: KushaagraTheme.bodySmall(context).copyWith(color: KushaagraTheme.success))),
                ],
              ),
            ),
          ],
        ],
      ),
    ).animate(delay: Duration(milliseconds: 50 * index)).fadeIn().slideY(begin: 0.08);
  }

  Widget _typeChip(BuildContext ctx, String value, String label, String selected, ValueChanged<String> onSelect) {
    final isSelected = selected == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onSelect(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? Theme.of(ctx).colorScheme.primary.withValues(alpha: 0.1)
                : Theme.of(ctx).colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? Theme.of(ctx).colorScheme.primary : Theme.of(ctx).colorScheme.outline,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Center(
            child: Text(label, style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              color: isSelected ? Theme.of(ctx).colorScheme.primary : Theme.of(ctx).colorScheme.onSurfaceVariant,
            )),
          ),
        ),
      ),
    );
  }
}
