import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../providers/data_providers.dart';
import '../../models/application.dart';
import '../../widgets/glass_widgets.dart';

class ApplicationsScreen extends ConsumerStatefulWidget {
  const ApplicationsScreen({super.key});
  @override
  ConsumerState<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _tabs = ['all', 'applied', 'under_review', 'approved', 'rejected'];
  final _tabLabels = ['All', 'Applied', 'Under Review', 'Approved', 'Rejected'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) _loadApps();
    });
    _loadApps();
  }

  void _loadApps() {
    final status = _tabs[_tabController.index];
    ref.read(applicationsProvider.notifier).fetchApplications(status: status);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final apps = ref.watch(applicationsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
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
          bottom: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(25, 20, 20, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('My Applications', 
                      style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -0.5)
                    ).animate().fadeIn().slideX(begin: -0.1),
                    Text('Track your journey to success', 
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.grey)
                    ).animate().fadeIn(delay: 200.ms),
                  ],
                ),
              ),

              // Enhanced Tabs
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  indicator: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), blurRadius: 8)
                    ],
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.grey.withValues(alpha: 0.8),
                  labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700),
                  unselectedLabelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
                  dividerColor: Colors.transparent,
                  indicatorSize: TabBarIndicatorSize.tab,
                  tabs: _tabLabels.map((l) => Tab(text: l, height: 38)).toList(),
                ),
              ).animate().fadeIn(delay: 300.ms),

              const SizedBox(height: 12),

              // List
              Expanded(
                child: apps.isEmpty
                    ? const EmptyState(
                        icon: Icons.assignment_turned_in_outlined,
                        title: 'No Applications',
                        subtitle: 'Apply to opportunities to see them here!',
                      )
                    : RefreshIndicator(
                        onRefresh: () async => _loadApps(),
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                          itemCount: apps.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 15),
                          itemBuilder: (_, i) => _appCard(apps[i], i),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _appCard(ApplicationModel app, int index) {
    final oppData = app.opportunity;
    String title = 'Opportunity';
    String? orgName;
    String? rewardText;
    String? portalUrl;

    if (oppData is Map<String, dynamic>) {
      title = oppData['title'] ?? 'Opportunity';
      orgName = oppData['organizer']?['name'];
      portalUrl = oppData['application']?['externalLink'] ?? oppData['website'];
      final cashAmt = oppData['rewards']?['cashAmount'];
      if (cashAmt != null && cashAmt > 0) rewardText = '₹${cashAmt.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}';
    }

    final statusColor = _statusColor(app.status);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: statusColor.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          colors: [statusColor.withValues(alpha: 0.08), Colors.transparent],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Icon with glow
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(child: Text(app.statusEmoji, style: const TextStyle(fontSize: 26))),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, 
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, height: 1.2), 
                        maxLines: 2, 
                        overflow: TextOverflow.ellipsis
                      ),
                      if (orgName != null)
                        Text(orgName, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    // Share Logic Placeholder
                  },
                  icon: const Icon(Icons.share_rounded, size: 20, color: Colors.grey),
                ),
              ],
            ),

            const SizedBox(height: 12),
            
            // New: Applied Date & ID
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.history_rounded, size: 12, color: Colors.grey),
                      const SizedBox(width: 6),
                      Text('Applied ${app.appliedAt?.split('T')[0] ?? 'Recently'}', 
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.grey)
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Text('ID: #${app.id.substring(app.id.length - 6).toUpperCase()}', 
                  style: GoogleFonts.jetBrainsMono(fontSize: 10, color: Colors.grey.withValues(alpha: 0.6))
                ),
              ],
            ),

            const SizedBox(height: 15),

            // Premium Timeline
            Stack(
              children: [
                Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(seconds: 1),
                  height: 4,
                  width: (MediaQuery.of(context).size.width - 80) * (app.status == 'approved' ? 1.0 : app.status == 'under_review' ? 0.6 : 0.3),
                  margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [statusColor, statusColor.withValues(alpha: 0.5)]),
                    borderRadius: BorderRadius.circular(2),
                    boxShadow: [BoxShadow(color: statusColor.withValues(alpha: 0.4), blurRadius: 8)],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(3, (i) {
                    final isActive = (i == 0) || (i == 1 && (app.status == 'under_review' || app.status == 'approved')) || (i == 2 && app.status == 'approved');
                    return Container(
                      width: 20, height: 20,
                      decoration: BoxDecoration(
                        color: isActive ? statusColor : Colors.grey.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: isActive ? [BoxShadow(color: statusColor.withValues(alpha: 0.4), blurRadius: 6)] : null,
                      ),
                    );
                  }),
                ),
              ],
            ),
            
            const SizedBox(height: 20),

            Row(
              children: [
                if (rewardText != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      gradient: KushaagraTheme.goldGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(rewardText, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
                  ),
                const Spacer(),
                // Re-link Option: Visit Portal
                if (portalUrl != null)
                  ElevatedButton.icon(
                    onPressed: () => _launchURL(portalUrl!),
                    icon: const Icon(Icons.open_in_new_rounded, size: 16),
                    label: const Text('Visit Portal'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: statusColor.withValues(alpha: 0.15),
                      foregroundColor: statusColor,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      textStyle: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 13),
                    ),
                  ).animate(onPlay: (c) => c.repeat(reverse: true))
                   .shimmer(duration: 2.seconds, color: Colors.white24),
              ],
            ),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 100 * index))
     .fadeIn(duration: 500.ms)
     .scale(begin: const Offset(0.95, 0.95), curve: Curves.easeOutBack);
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'applied': return const Color(0xFF6366F1);
      case 'under_review': return const Color(0xFFF59E0B);
      case 'approved': return const Color(0xFF10B981);
      case 'rejected': return const Color(0xFFEF4444);
      default: return Colors.grey;
    }
  }
}
