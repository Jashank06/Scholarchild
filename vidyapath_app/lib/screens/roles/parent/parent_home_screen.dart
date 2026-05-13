import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../config/theme.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../models/user.dart';
import '../../../../widgets/glass_widgets.dart';

class ParentHomeScreen extends ConsumerStatefulWidget {
  const ParentHomeScreen({super.key});
  @override
  ConsumerState<ParentHomeScreen> createState() => _ParentHomeScreenState();
}

class _ParentHomeScreenState extends ConsumerState<ParentHomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final children = user?.parentProfile?.children ?? [];

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFEEF2FF), const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: () async => ref.read(authProvider.notifier).checkAuth(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── Header ───
                  _buildHeader(user, isDark),
                  const SizedBox(height: 24),

                  // ─── Welcome Card ───
                  _buildWelcomeCard(user, children.length),
                  const SizedBox(height: 24),

                  // ─── Quick Stats ───
                  _buildQuickStats(user),
                  const SizedBox(height: 28),

                  // ─── Children Section ───
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('👶 My Children', style: KushaagraTheme.titleLarge(context)),
                      TextButton(
                        onPressed: () {},
                        child: Text('Manage', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 8),
                  _buildChildrenList(children),
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

  Widget _buildHeader(UserModel? user, bool isDark) {
    final greeting = _getGreeting();
    final name = user?.profile?.firstName ?? 'Parent';

    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/notifications'),
          child: Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)]),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: const Color(0xFF4F46E5).withValues(alpha: 0.25), blurRadius: 16)],
            ),
            child: Center(
              child: Text(
                user?.initials ?? '?',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ),
        ).animate().scale(begin: const Offset(0.8, 0.8), duration: 400.ms, curve: Curves.elasticOut),

        const SizedBox(width: 14),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(greeting, style: KushaagraTheme.bodyMedium(context)),
              Text(name, style: KushaagraTheme.displaySmall(context)),
            ],
          ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1),
        ),

        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(Icons.notifications_outlined, color: Theme.of(context).colorScheme.onSurface),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms),
      ],
    );
  }

  Widget _buildWelcomeCard(UserModel? user, int childrenCount) {
    return Container(
      width: double.infinity,
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF4F46E5).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/parent_hero.png',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.8),
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
                  Text('Family Guardian 🛡️', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: 250,
                    child: Text('You are managing $childrenCount child profiles. Your family\'s educational future starts here.', 
                      style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5)
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

  Widget _buildQuickStats(UserModel? user) {
    final children = user?.parentProfile?.children.length ?? 0;
    
    return Row(
      children: [
        _statCard('👶 Children', '$children', const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)])),
        const SizedBox(width: 10),
        _statCard('📋 Apps', '0', const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)])),
        const SizedBox(width: 10),
        _statCard('🔖 Saved', '0', const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xDDF59E0B)])),
      ],
    ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.15);
  }

  Widget _statCard(String label, String value, Gradient gradient) {
    return Expanded(
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            ShaderMask(
              shaderCallback: (b) => gradient.createShader(b),
              child: Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildChildrenList(List<LinkedChild> children) {
    if (children.isEmpty) {
      return GlassCard(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            children: [
              const Text('👨‍👩‍👧‍👦', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              Text('No children linked yet', style: KushaagraTheme.labelLarge(context)),
              const SizedBox(height: 4),
              Text('Link a student account to track progress', style: KushaagraTheme.bodySmall(context)),
            ],
          ),
        ),
      ).animate().fadeIn(delay: 250.ms);
    }

    return Column(
      children: children.map((c) => GlassCard(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFEEF2FF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(child: Text('🧑‍🎓', style: TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Child Name', style: KushaagraTheme.labelLarge(context)),
                  Text(c.relationship, style: KushaagraTheme.bodySmall(context)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Theme.of(context).colorScheme.onSurfaceVariant),
          ],
        ),
      )).toList(),
    ).animate().fadeIn(delay: 250.ms);
  }

  Widget _buildQuickActions() {
    final actions = [
      ('Browse Schools', '🏫', 'Find top institutions'),
      ('Scholarships', '🎓', 'Find funding'),
      ('Govt. Schemes', '🏛️', 'State programs'),
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
                color: Theme.of(context).colorScheme.surface,
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
          ],
        ),
      )).toList(),
    ).animate().fadeIn(delay: 350.ms);
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  }
}
