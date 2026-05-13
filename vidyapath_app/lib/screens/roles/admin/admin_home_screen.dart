import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../config/theme.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../providers/role_providers.dart';
import '../../../../widgets/glass_widgets.dart';

class AdminHomeScreen extends ConsumerStatefulWidget {
  const AdminHomeScreen({super.key});
  @override
  ConsumerState<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends ConsumerState<AdminHomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final statsState = ref.watch(adminStatsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF1F5F9), const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: () async {
              ref.read(authProvider.notifier).checkAuth();
              await ref.read(adminStatsProvider.notifier).fetchStats();
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── Header ───
                  _buildHeader(authState.user, isDark),
                  const SizedBox(height: 24),

                  // ─── Welcome Card ───
                  _buildWelcomeCard(),
                  const SizedBox(height: 24),

                  // ─── Stats Grid ───
                  Text('📊 Platform Statistics', style: KushaagraTheme.titleLarge(context)).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 16),
                  _buildStatsGrid(statsState),
                  const SizedBox(height: 28),

                  // ─── Quick Actions ───
                  Text('⚡ Quick Actions', style: KushaagraTheme.titleLarge(context)).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 14),
                  _buildQuickActions(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(user, bool isDark) {
    final name = user?.profile?.firstName ?? 'Admin';

    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/notifications'),
          child: Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF0F172A), Color(0xFF1E293B)]),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.25), blurRadius: 16)],
            ),
            child: const Center(
              child: Text('🛡️', style: TextStyle(fontSize: 24)),
            ),
          ),
        ).animate().scale(begin: const Offset(0.8, 0.8), duration: 400.ms, curve: Curves.elasticOut),

        const SizedBox(width: 14),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome back,', style: KushaagraTheme.bodyMedium(context)),
              Text(name, style: KushaagraTheme.displaySmall(context), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1),
        ),

        Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
                ],
              ),
              child: const Stack(
                alignment: Alignment.center,
                children: [
                  Icon(Icons.notifications_outlined),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
                ],
              ),
              child: IconButton(
                icon: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Logout'),
                      content: const Text('Are you sure you want to exit?'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                        TextButton(
                          onPressed: () {
                            ref.read(authProvider.notifier).logout();
                            Navigator.pop(context);
                            Navigator.pushReplacementNamed(context, '/auth');
                          },
                          child: const Text('Logout', style: TextStyle(color: Colors.redAccent)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ).animate().fadeIn(delay: 200.ms),
      ],
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      width: double.infinity,
      height: 160,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/admin_hero.png',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.85),
                    Colors.black.withValues(alpha: 0.2),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('System Command Center', style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 8),
                  const SizedBox(
                    width: 250,
                    child: Text('Platform overview, user management, and institution verifications.', 
                      style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1);
  }

  Widget _buildStatsGrid(AdminStatsState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)));
    }
    if (state.error != null) {
      return Center(child: Text('Error loading stats', style: TextStyle(color: Theme.of(context).colorScheme.error)));
    }

    final s = state.stats;
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: [
        _statCard('Total Users', s?.totalUsers ?? 0, '👥', const Color(0xFF2563EB)),
        _statCard('Students', s?.totalStudents ?? 0, '🧑‍🎓', const Color(0xFF059669)),
        _statCard('Scholarships', s?.totalScholarships ?? 0, '🎓', const Color(0xFFF59E0B)),
        _statCard('Institutions', s?.totalOpportunities ?? 0, '🏫', const Color(0xFF8B5CF6)), // Note: Placeholder mapping
      ],
    ).animate().fadeIn(delay: 250.ms);
  }

  Widget _statCard(String label, int value, String icon, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(icon, style: const TextStyle(fontSize: 24)),
              Text('$value', style: GoogleFonts.jetBrainsMono(fontSize: 24, fontWeight: FontWeight.w800, color: color)),
            ],
          ),
          const Spacer(),
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87)),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      ('Manage Users', '👥', 'View all platform users'),
      ('Verify Schools', '🏫', 'Approve institution accounts'),
      ('Broadcast', '📢', 'Send push notifications'),
    ];

    return Column(
      children: actions.map((a) => GlassCard(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(child: Text(a.$2, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(a.$1, style: KushaagraTheme.labelLarge(context)),
                  Text(a.$3, style: KushaagraTheme.bodySmall(context)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Theme.of(context).colorScheme.onSurfaceVariant),
          ],
        ),
      )).toList(),
    ).animate().fadeIn(delay: 350.ms);
  }
}
