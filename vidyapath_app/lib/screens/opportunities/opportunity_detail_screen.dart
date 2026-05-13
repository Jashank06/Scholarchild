import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../providers/data_providers.dart';
import '../../models/opportunity.dart';
import '../../widgets/glass_widgets.dart';

class OpportunityDetailScreen extends ConsumerStatefulWidget {
  final String opportunityId;
  const OpportunityDetailScreen({super.key, required this.opportunityId});
  @override
  ConsumerState<OpportunityDetailScreen> createState() => _OpportunityDetailScreenState();
}

class _OpportunityDetailScreenState extends ConsumerState<OpportunityDetailScreen> {
  OpportunityModel? _opp;
  bool _loading = true;
  bool _bookmarked = false;
  bool _applying = false;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    final opp = await ref.read(opportunitiesProvider.notifier).fetchDetail(widget.opportunityId);
    if (mounted) setState(() { _opp = opp; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_loading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator(color: Theme.of(context).colorScheme.primary)),
      );
    }

    if (_opp == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Not Found')),
        body: const EmptyState(icon: Icons.error_outline, title: 'Opportunity Not Found', subtitle: 'This may have been removed'),
      );
    }

    final opp = _opp!;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFEFF6FF), const Color(0xFFF8FAFC)],
          ),
        ),
        child: CustomScrollView(
          slivers: [
            // ─── App Bar ───
            SliverAppBar(
              expandedHeight: 180,
              pinned: true,
              backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(gradient: KushaagraTheme.primaryGradient),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(opp.typeEmoji, style: const TextStyle(fontSize: 48)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(KushaagraTheme.radiusFull),
                        ),
                        child: Text(opp.typeLabel, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
              actions: [
                // Bookmark button
                IconButton(
                  onPressed: () async {
                    final result = await ref.read(opportunitiesProvider.notifier).toggleBookmark(opp.id);
                    setState(() => _bookmarked = result);
                  },
                  icon: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 250),
                    child: Icon(
                      _bookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                      key: ValueKey(_bookmarked),
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(opp.title, style: KushaagraTheme.displayMedium(context))
                        .animate().fadeIn().slideY(begin: 0.1),
                    const SizedBox(height: 8),

                    // Organizer
                    Row(
                      children: [
                        Icon(Icons.business, size: 16, color: Theme.of(context).colorScheme.onSurfaceVariant),
                        const SizedBox(width: 6),
                        Text(opp.organizer?.name ?? '', style: KushaagraTheme.bodyMedium(context)),
                        if (opp.organizer?.level != null) ...[
                          const SizedBox(width: 8),
                          Text(opp.organizer!.levelLabel, style: KushaagraTheme.bodySmall(context)),
                        ],
                      ],
                    ).animate().fadeIn(delay: 100.ms),

                    const SizedBox(height: 20),

                    // ─── Stats Row ───
                    Row(
                      children: [
                        if (opp.matchScore != null)
                          Expanded(child: _infoBox('Match', '${opp.matchScore}%', Icons.track_changes, KushaagraTheme.primaryBlue)),
                        if (opp.rewards?.cashAmount != null && opp.rewards!.cashAmount! > 0)
                          Expanded(child: _infoBox('Reward', opp.rewards!.displayAmount, Icons.monetization_on, KushaagraTheme.accentGold)),
                        if (opp.daysLeft >= 0)
                          Expanded(child: _infoBox('Deadline', '${opp.daysLeft}d', Icons.schedule, opp.isDeadlineSoon ? KushaagraTheme.error : KushaagraTheme.success)),
                        Expanded(child: _infoBox('Views', '${opp.stats?.totalViews ?? 0}', Icons.visibility, KushaagraTheme.info)),
                      ],
                    ).animate().fadeIn(delay: 150.ms),

                    const SizedBox(height: 24),

                    // ─── Description ───
                    _sectionTitle('Description'),
                    const SizedBox(height: 8),
                    GlassCard(
                      child: Text(opp.description, style: KushaagraTheme.bodyLarge(context).copyWith(height: 1.7)),
                    ).animate().fadeIn(delay: 200.ms),

                    const SizedBox(height: 20),

                    // ─── Eligibility ───
                    if (opp.eligibility != null) ...[
                      _sectionTitle('Eligibility'),
                      const SizedBox(height: 8),
                      GlassCard(
                        child: Column(
                          children: [
                            if (opp.eligibility!.grades.isNotEmpty)
                              _eligRow('Grades', opp.eligibility!.grades.map((g) => 'Class $g').join(', ')),
                            if (opp.eligibility!.states.isNotEmpty)
                              _eligRow('States', opp.eligibility!.states.join(', ')),
                            if (opp.eligibility!.categories.isNotEmpty)
                              _eligRow('Categories', opp.eligibility!.categories.join(', ')),
                            if (opp.eligibility!.maxFamilyIncome != null)
                              _eligRow('Max Income', '₹${opp.eligibility!.maxFamilyIncome}'),
                            if (opp.eligibility!.minPercentage != null)
                              _eligRow('Min %', '${opp.eligibility!.minPercentage}%'),
                            if (opp.eligibility!.gender != 'all')
                              _eligRow('Gender', opp.eligibility!.gender.toUpperCase()),
                          ],
                        ),
                      ).animate().fadeIn(delay: 250.ms),
                      const SizedBox(height: 20),
                    ],

                    // ─── Tags ───
                    if (opp.tags.isNotEmpty) ...[
                      _sectionTitle('Tags'),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: opp.tags.map((t) => Chip(label: Text('#$t'))).toList(),
                      ).animate().fadeIn(delay: 300.ms),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),

      // ─── Apply Button ───
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4))],
        ),
        child: SizedBox(
          width: double.infinity,
          child: opp.application?.mode == 'external' && opp.application?.externalLink != null
              ? LiquidButton(
                  text: 'Apply on Website',
                  icon: Icons.open_in_new,
                  onPressed: () async {
                    final url = Uri.tryParse(opp.application!.externalLink!);
                    if (url != null) await launchUrl(url, mode: LaunchMode.externalApplication);
                  },
                )
              : LiquidButton(
                  text: _applying ? 'Applying...' : 'Apply Now',
                  icon: Icons.send_rounded,
                  isLoading: _applying,
                  onPressed: () async {
                    setState(() => _applying = true);
                    final success = await ref.read(applicationsProvider.notifier).apply(opp.id);
                    setState(() => _applying = false);
                    if (success && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('🎉 Application submitted!')),
                      );
                    }
                  },
                ),
        ),
      ),
    );
  }

  Widget _infoBox(String label, String value, IconData icon, Color color) {
    return GlassCard(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Column(
        children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(title, style: KushaagraTheme.titleLarge(context));
  }

  Widget _eligRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(Icons.check_circle, size: 18, color: KushaagraTheme.success),
          const SizedBox(width: 10),
          Text('$label: ', style: KushaagraTheme.labelLarge(context)),
          Expanded(child: Text(value, style: KushaagraTheme.bodyMedium(context))),
        ],
      ),
    );
  }
}
