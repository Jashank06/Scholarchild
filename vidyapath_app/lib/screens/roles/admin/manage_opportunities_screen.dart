import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../config/theme.dart';
import '../../../../widgets/glass_widgets.dart';
import '../../../../providers/role_providers.dart';

class ManageOpportunitiesScreen extends ConsumerStatefulWidget {
  const ManageOpportunitiesScreen({super.key});
  @override
  ConsumerState<ManageOpportunitiesScreen> createState() => _ManageOpportunitiesScreenState();
}

class _ManageOpportunitiesScreenState extends ConsumerState<ManageOpportunitiesScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final oppsState = ref.watch(adminOpportunitiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Opportunities', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.add_circle_outline_rounded), onPressed: () {}),
        ],
      ),
      extendBodyBehindAppBar: true,
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
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                    height: 120,
                    width: double.infinity,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset('assets/images/scholarship_general.png', fit: BoxFit.cover),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                              colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text('Scholarships', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Manage \& Approve', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 50.ms),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search scholarships, grants...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 16),
              
              Expanded(
                child: oppsState.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : oppsState.error != null
                        ? Center(child: Text(oppsState.error!, style: TextStyle(color: Theme.of(context).colorScheme.error)))
                        : oppsState.items.isEmpty
                            ? const Center(child: Text('No opportunities found'))
                            : RefreshIndicator(
                                onRefresh: () => ref.read(adminOpportunitiesProvider.notifier).fetchOpportunities(),
                                child: ListView.builder(
                                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                                  itemCount: oppsState.items.length,
                                  itemBuilder: (context, index) {
                                    final opp = oppsState.items[index];
                                    final String type = opp['type'] ?? 'Scholarship';
                                    final String status = opp['status'] ?? 'Draft';
                                    final bool isReview = status == 'review' || status == 'pending';
                                    final bool isDraft = status == 'draft';

                                    Color statusColor = Colors.green;
                                    if (isReview) statusColor = Colors.orange;
                                    if (isDraft) statusColor = Colors.grey;

                                    return GlassCard(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                width: 48, height: 48,
                                                decoration: BoxDecoration(
                                                  color: Theme.of(context).colorScheme.primaryContainer,
                                                  borderRadius: BorderRadius.circular(12),
                                                ),
                                                child: Center(child: Text(type.toLowerCase().contains('grant') ? '💡' : '🎓', style: const TextStyle(fontSize: 24))),
                                              ),
                                              const SizedBox(width: 16),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(opp['title'] ?? 'Untitled', style: KushaagraTheme.labelLarge(context)),
                                                    const SizedBox(height: 4),
                                                    Text(opp['provider']?['name'] ?? 'Unknown Provider', style: KushaagraTheme.bodySmall(context)),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 16),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              _buildBadge(type, Colors.purple),
                                              Row(
                                                children: [
                                                  _buildBadge(status, statusColor as MaterialColor),
                                                  const SizedBox(width: 8),
                                                  Icon(Icons.edit_rounded, size: 18, color: Theme.of(context).colorScheme.onSurfaceVariant),
                                                ],
                                              )
                                            ],
                                          )
                                        ],
                                      ),
                                    ).animate(delay: Duration(milliseconds: 50 * (index > 10 ? 10 : index))).fadeIn().slideY(begin: 0.1);
                                  },
                                ),
                              ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: color[700]),
      ),
    );
  }
}
