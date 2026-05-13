import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../config/theme.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../providers/parent_provider.dart';
import '../../../../providers/data_providers.dart';
import '../../../../models/user.dart';

class ParentHomeScreen extends ConsumerStatefulWidget {
  const ParentHomeScreen({super.key});
  @override
  ConsumerState<ParentHomeScreen> createState() => _ParentHomeScreenState();
}

class _ParentHomeScreenState extends ConsumerState<ParentHomeScreen> {
  String? _expandedChildId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(parentProvider.notifier).fetchParentData());
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final parentState = ref.watch(parentProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final children = parentState.children;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      ),
      child: Material(
        color: Colors.transparent,
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: () async {
              await ref.read(authProvider.notifier).checkAuth();
              await ref.read(parentProvider.notifier).fetchParentData();
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
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
                  _buildQuickStats(children, user),
                  const SizedBox(height: 32),

                  // ─── Children Section ───
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('👶 My Children', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Theme.of(context).colorScheme.onSurface)),
                      GestureDetector(
                        onTap: () {},
                        child: Text('Manage Profiles →', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w800, fontSize: 13)),
                      ),
                    ],
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 14),
                  
                  if (parentState.isLoading)
                    const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
                  else
                    _buildChildrenList(children, isDark),
                  
                  const SizedBox(height: 32),

                  // ─── Quick Actions ───
                  Text('⚡ Smart Explorer', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Theme.of(context).colorScheme.onSurface)).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 16),
                  _buildQuickActions(isDark),
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
        // Sidebar Menu Toggle
        Builder(
          builder: (context) => IconButton(
            onPressed: () {
              HapticFeedback.lightImpact();
              Scaffold.of(context).openDrawer();
            },
            icon: Icon(Icons.menu_rounded, color: isDark ? Colors.white : Colors.black87, size: 28),
          ),
        ),
        const SizedBox(width: 8),

        // Profile Avatar
        GestureDetector(
          onTap: () => ref.read(shellIndexProvider.notifier).set(3),
          child: Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4F46E5)]),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: Center(
              child: Text(
                user?.initials ?? 'J',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
              ),
            ),
          ),
        ).animate().scale(curve: Curves.easeOutBack),

        const SizedBox(width: 14),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(greeting, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[500])),
              Text(name, style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900, color: Theme.of(context).colorScheme.onSurface, letterSpacing: -0.5)),
            ],
          ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1),
        ),

        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
          ),
          child: Icon(Icons.notifications_active_outlined, color: Theme.of(context).colorScheme.primary),
        ).animate().fadeIn(delay: 200.ms),
      ],
    );
  }

  Widget _buildWelcomeCard(UserModel? user, int childrenCount) {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
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
                    Colors.black.withOpacity(0.9),
                    Colors.black.withOpacity(0.3),
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
                  Text('Family Guardian 🛡️', style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5)),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: 250,
                    child: Text('Supervising $childrenCount child profile${childrenCount != 1 ? 's' : ''}. Your family\'s future starts here.', 
                      style: GoogleFonts.outfit(color: Colors.white.withOpacity(0.7), fontSize: 14, fontWeight: FontWeight.w500, height: 1.4)
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1);
  }

  Widget _buildQuickStats(List<LinkedChild> children, UserModel? user) {
    final totalApps = children.fold(0, (sum, c) => sum + c.applications.length);
    final badges = user?.gamification?.badges.length ?? 0;
    
    return Row(
      children: [
        _statCard('Children', '${children.length}', '👶', const Color(0xFF6366F1), const Color(0xFF4F46E5)),
        const SizedBox(width: 12),
        _statCard('Total Apps', '$totalApps', '📋', const Color(0xFFF59E0B), const Color(0xFFD97706)),
        const SizedBox(width: 12),
        _statCard('Badges', '$badges', '🏅', const Color(0xFF10B981), const Color(0xFF059669)),
      ],
    ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.2);
  }

  Widget _statCard(String label, String value, String icon, Color c1, Color c2) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [c1, c2]),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [BoxShadow(color: c1.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
              child: Text(icon, style: const TextStyle(fontSize: 18)),
            ),
            const SizedBox(height: 12),
            Text(value, style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
            Text(label, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white.withOpacity(0.8), letterSpacing: 0.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildChildrenList(List<LinkedChild> children, bool isDark) {
    if (children.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100]!),
        ),
        child: Center(
          child: Column(
            children: [
              const Text('👨‍👩‍👧‍👦', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              Text('No children linked yet', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text('Link a student account to track progress', style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    return Column(
      children: children.map((c) {
        final isExpanded = _expandedChildId == c.childId;
        return Column(
          children: [
            GestureDetector(
              onTap: () => setState(() => _expandedChildId = isExpanded ? null : c.childId),
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: isExpanded ? Border.all(color: Theme.of(context).colorScheme.primary, width: 2) : null,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56, height: 56,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFEEF2FF), Color(0xFFE0E7FF)]),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Center(child: Text('🧑‍🎓', style: TextStyle(fontSize: 28))),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.name ?? 'Child Account', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900)),
                          Text(
                            c.grade != null ? 'Grade ${c.grade} • ${c.board ?? "CBSE"}' : c.relationship.toUpperCase(), 
                            style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.grey[500])
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded, 
                      color: isExpanded ? Theme.of(context).colorScheme.primary : Colors.grey
                    ),
                  ],
                ),
              ),
            ),
            if (isExpanded)
              Container(
                margin: const EdgeInsets.only(bottom: 20, left: 10, right: 10),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111827) : const Color(0xFFF1F5F9),
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Application History', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 16),
                    if (c.applications.isEmpty)
                      const Text('No applications found for this child.')
                    else
                      ...c.applications.map((app) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Container(
                              width: 36, height: 36,
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                              child: const Center(child: Text('📝', style: TextStyle(fontSize: 16))),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(app.opportunityTitle ?? 'Scholarship App', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
                                  Text('Status: ${app.status.toUpperCase()}', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey[600])),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )).toList(),
                  ],
                ),
              ).animate().fadeIn().slideY(begin: -0.1),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildQuickActions(bool isDark) {
    final actions = [
      ('Scholarships', '🎓', 'Find funding opportunities', const Color(0xFFE0E7FF), const Color(0xFF6366F1)),
      ('Competitions', '🏆', 'Global academic contests', const Color(0xFFFFEDD5), const Color(0xFFF59E0B)),
      ('Institutions', '🏫', 'Explore top schools', const Color(0xFFD1FAE5), const Color(0xFF10B981)),
      ('Govt. Schemes', '🏛️', 'Official welfare programs', const Color(0xFFEDE9FE), const Color(0xFF8B5CF6)),
    ];

    return Column(
      children: actions.asMap().entries.map((entry) {
        final i = entry.key;
        final a = entry.value;
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
          ),
          child: Row(
            children: [
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  color: a.$4.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(child: Text(a.$2, style: const TextStyle(fontSize: 26))),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a.$1, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900)),
                    Text(a.$3, style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[500], fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
              Icon(Icons.add_circle_outline_rounded, color: a.$5.withOpacity(0.5)),
            ],
          ),
        ).animate().fadeIn(delay: (350 + (i * 100)).ms).slideX(begin: 0.1);
      }).toList(),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  }
}
