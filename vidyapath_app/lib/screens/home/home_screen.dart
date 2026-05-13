import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../core/network/api_client.dart';
import '../../providers/data_providers.dart';
import '../../models/opportunity.dart';
import '../../widgets/glass_widgets.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with TickerProviderStateMixin {
  List<OpportunityModel> _recommendations = [];
  bool _loadingRecs = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final recs = await ref.read(opportunitiesProvider.notifier).fetchRecommendations(limit: 8);
    if (mounted) setState(() { _recommendations = recs; _loadingRecs = false; });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: _loadData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ─── Header ───
                  _buildHeader(user, isDark),
                  const SizedBox(height: 20),

                  // ─── Hero Banner ───
                  _buildHeroBanner(),
                  const SizedBox(height: 24),

                  // ─── Quick Stats ───
                  _buildQuickStats(user),
                  const SizedBox(height: 28),

                  // ─── Categories ───
                  Text('Browse by Category', style: KushaagraTheme.titleLarge(context))
                      .animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 14),
                  _buildCategories(),
                  const SizedBox(height: 28),

                  // ─── Recommendations ───
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recommended for You', style: KushaagraTheme.titleLarge(context)),
                      TextButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          ref.read(selectedCategoryProvider.notifier).set(null);
                          ref.read(shellIndexProvider.notifier).set(1);
                        },
                        child: Text('See All', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 8),
                  _buildRecommendations(),
                  const SizedBox(height: 28),

                  // ─── Daily Insight ───
                  _buildDailyTip(),
                  const SizedBox(height: 28),

                  // ─── Community Pulse ───
                  _buildCommunityPulse(),
                  const SizedBox(height: 28),

                  // ─── Deadline Alert ───
                  _buildDeadlineAlerts(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDailyTip() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF8B5CF6).withValues(alpha: 0.15), blurRadius: 20),
        ],
      ),
      child: GlassCard(
        padding: const EdgeInsets.all(22),
        gradient: LinearGradient(
          colors: [
            const Color(0xFF8B5CF6).withValues(alpha: 0.1),
            const Color(0xFFD8B4FE).withValues(alpha: 0.05),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Icon(Icons.lightbulb_rounded, color: Color(0xFF8B5CF6), size: 28),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Scholarship Tip of the Day', 
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF8B5CF6))
                  ),
                  const SizedBox(height: 4),
                  Text('Always proofread your essay twice. Small errors can make a big difference!', 
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.grey)
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 500.ms).slideX(begin: 0.1);
  }

  Widget _buildCommunityPulse() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          _statBadge('🚀 1,240 Applications today', const Color(0xFF10B981)),
          const SizedBox(width: 12),
          _statBadge('💎 45 Premium Scholarships', const Color(0xFFF59E0B)),
          const SizedBox(width: 12),
          _statBadge('🌍 12 New Partners added', const Color(0xFF3B82F6)),
        ],
      ),
    );
  }

  Widget _statBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Text(text, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: color)),
        ],
      ),
    ).animate().fadeIn().scale(delay: 600.ms);
  }

  Widget _buildHeader(user, bool isDark) {
    final greeting = _getGreeting();
    final name = user?.profile?.firstName ?? 'Student';

    return Row(
      children: [
        // Menu Button
        IconButton(
          onPressed: () {
            HapticFeedback.lightImpact();
            Scaffold.of(context).openDrawer();
          },
          icon: Icon(Icons.menu_rounded, color: isDark ? Colors.white : Colors.black87, size: 28),
        ),
        const SizedBox(width: 8),
        
        // Avatar with Lottie background pulse
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/profile'),
          child: Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              gradient: KushaagraTheme.primaryGradient,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.2), blurRadius: 12)],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: user?.avatar != null
                  ? CachedNetworkImage(
                      imageUrl: ApiClient().getImageUrl(user!.avatar!),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                      errorWidget: (context, url, error) => Center(
                        child: Text(
                          user.initials,
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    )
                  : Center(
                      child: Text(
                        user?.initials ?? '?',
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ),
            ),
          ),
        ).animate().scale(begin: const Offset(0.8, 0.8), duration: 400.ms, curve: Curves.elasticOut),

        const SizedBox(width: 14),

        // Greeting
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(greeting, style: KushaagraTheme.bodyMedium(context)),
              Text(name, style: KushaagraTheme.displaySmall(context)),
            ],
          ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1),
        ),

        // Actions: Notifications & Logout
        Row(
          children: [
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/notifications'),
              child: Container(
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
                    Positioned(
                      top: 10, right: 10,
                      child: Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(color: KushaagraTheme.error, shape: BoxShape.circle),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to logout?'),
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
              child: Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
                  ],
                ),
                child: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
              ),
            ),
          ],
        ).animate().fadeIn(delay: 200.ms),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      height: 190,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/student_hero.png',
              fit: BoxFit.cover,
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
             .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.1, 1.1), duration: 10.seconds, curve: Curves.linear),
            
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.1),
                    Colors.black.withValues(alpha: 0.85),
                  ],
                ),
              ),
            ),
            Positioned(
              bottom: 24,
              left: 20,
              right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: KushaagraTheme.primaryBlue.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('NEW', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)),
                  ).animate().shimmer(delay: 2.seconds),
                  const SizedBox(height: 8),
                  Text(
                    'Discover Your Path',
                    style: GoogleFonts.outfit(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Unlock thousands of scholarships today.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.1);
  }

  Widget _buildQuickStats(user) {
    final xp = user?.gamification?.xp ?? 0;
    final level = user?.gamification?.level ?? 1;
    final streak = user?.gamification?.streakDays ?? 0;
    final score = user?.calculatedScore ?? 0;

    return Row(
      children: [
        _statCard('XP', '$xp', '⚡', KushaagraTheme.primaryGradient, Colors.blueAccent),
        const SizedBox(width: 10),
        _statCard('Level', '$level', '🏆', KushaagraTheme.goldGradient, Colors.amberAccent),
        const SizedBox(width: 10),
        _statCard('Streak', '${streak}d', '🔥', const LinearGradient(colors: [Color(0xFFF97316), Color(0xFFEF4444)]), Colors.orangeAccent),
        const SizedBox(width: 10),
        _statCard('Profile', '$score%', '📊', const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF2563EB)]), Colors.tealAccent),
      ],
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1, duration: 600.ms);
  }

  Widget _statCard(String label, String value, String icon, Gradient gradient, Color glowColor) {
    return Expanded(
      child: Container(
        height: 105,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
          boxShadow: [
            BoxShadow(
              color: glowColor.withValues(alpha: 0.2),
              blurRadius: 20,
              spreadRadius: -5,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
          child: Stack(
            children: [
              // Animated Border Base
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: glowColor.withValues(alpha: 0.3), width: 1.5),
                  borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      glowColor.withValues(alpha: 0.1),
                      Colors.transparent,
                    ],
                  ),
                ),
              ).animate(onPlay: (c) => c.repeat())
               .shimmer(duration: 2.seconds, color: glowColor.withValues(alpha: 0.4)),

              // Content
              GlassCard(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ShaderMask(
                      shaderCallback: (b) => gradient.createShader(b),
                      child: Text(
                        value,
                        style: GoogleFonts.outfit(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -1,
                        ),
                      ).animate()
                       .scale(duration: 600.ms, curve: Curves.elasticOut)
                       .shimmer(delay: 1.seconds, duration: 2.seconds),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(icon, style: const TextStyle(fontSize: 14)),
                        const SizedBox(width: 4),
                        Text(
                          label,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: Theme.of(context).colorScheme.onSurface,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ).animate(onPlay: (c) => c.repeat(reverse: true))
       .moveY(begin: 0, end: -4, duration: 2.seconds, curve: Curves.easeInOutSine),
    );
  }

  Widget _buildCategories() {
    final categories = [
      ('🎓', 'Scholarships', const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF7C3AED)])),
      ('🏆', 'Competitions', const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFF97316)])),
      ('🏛️', 'Schemes', const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)])),
      ('📚', 'Academic', const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4338CA)])),
      ('💻', 'Coding', const LinearGradient(colors: [Color(0xFF06B6D4), Color(0xFF0891B2)])),
      ('🎨', 'Arts', const LinearGradient(colors: [Color(0xFFEC4899), Color(0xFFBE185D)])),
    ];

    return SizedBox(
      height: 140, // Increased height to prevent overflow
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final cat = categories[i];
          return Container(
            width: 115, // Slightly wider for better spacing
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: cat.$3.colors.map((c) => c.withValues(alpha: 0.15)).toList(),
              ),
              borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
              border: Border.all(color: cat.$3.colors.first.withValues(alpha: 0.3), width: 1.5),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
              child: GlassCard(
                onTap: () {
                  HapticFeedback.lightImpact();
                  final label = cat.$2.toLowerCase();
                  
                  // Map specific labels to Types, others to Categories
                  if (label == 'scholarships') {
                    ref.read(selectedTypeProvider.notifier).set('scholarship');
                    ref.read(selectedCategoryProvider.notifier).set(null);
                  } else if (label == 'competitions') {
                    ref.read(selectedTypeProvider.notifier).set('competition');
                    ref.read(selectedCategoryProvider.notifier).set(null);
                  } else if (label == 'schemes') {
                    ref.read(selectedTypeProvider.notifier).set('scheme');
                    ref.read(selectedCategoryProvider.notifier).set(null);
                  } else {
                    ref.read(selectedTypeProvider.notifier).set(null);
                    ref.read(selectedCategoryProvider.notifier).set(cat.$2);
                  }
                  
                  ref.read(shellIndexProvider.notifier).set(1);
                },
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    cat.$3.colors.first.withValues(alpha: 0.2),
                    cat.$3.colors.last.withValues(alpha: 0.1),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: cat.$3,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: cat.$3.colors.first.withValues(alpha: 0.4),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: Text(cat.$1, style: const TextStyle(fontSize: 28)),
                    ),
                    const SizedBox(height: 12),
                    Text(cat.$2, 
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurface,
                        shadows: [
                          Shadow(color: cat.$3.colors.first.withValues(alpha: 0.5), blurRadius: 4),
                        ],
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                    ),
                  ],
                ),
              ),
            ),
          ).animate(delay: Duration(milliseconds: 100 * i))
           .fadeIn(duration: 400.ms)
           .slideY(begin: 0.2, curve: Curves.easeOutBack)
           .shimmer(delay: 2.seconds, duration: 1.5.seconds, color: Colors.white.withValues(alpha: 0.2));
        },
      ),
    );
  }

  Widget _buildRecommendations() {
    if (_loadingRecs) {
      return SizedBox(
        height: 200,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: 3,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (_, __) => ShimmerBox(width: 260, height: 200, borderRadius: KushaagraTheme.radiusLarge),
        ),
      );
    }

    if (_recommendations.isEmpty) {
      final user = ref.read(authProvider).user;
      if (user?.calculatedScore != null && user!.calculatedScore < 100) {
        return Padding(
          padding: const EdgeInsets.only(top: 10),
          child: GlassCard(
            padding: const EdgeInsets.all(22),
            gradient: LinearGradient(
              colors: [
                KushaagraTheme.primaryBlue.withValues(alpha: 0.15),
                Colors.white.withValues(alpha: 0.05),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: KushaagraTheme.primaryBlue.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Text('🎯', style: TextStyle(fontSize: 26)),
                ),
                const SizedBox(width: 18),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Complete Your Profile', 
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)
                      ),
                      Text('Unlock personalized recommendations', 
                        style: GoogleFonts.inter(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    ref.read(shellIndexProvider.notifier).set(3);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: KushaagraTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: Text('Complete', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ).animate().fadeIn().scale(curve: Curves.easeOutBack),
        );
      }
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 210,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _recommendations.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, i) {
          final opp = _recommendations[i];
          return _recommendationCard(opp, i);
        },
      ),
    );
  }

  Widget _recommendationCard(OpportunityModel opp, int index) {
    final cardColor = opp.type == 'scholarship' ? const Color(0xFF6366F1) : const Color(0xFFF59E0B);

    return Container(
      width: 280,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
        boxShadow: [
          BoxShadow(
            color: cardColor.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: GlassCard(
        onTap: () => Navigator.pushNamed(context, '/opportunity', arguments: opp.id),
        padding: const EdgeInsets.all(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cardColor.withValues(alpha: 0.15),
            Colors.transparent,
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: cardColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: cardColor.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Text(opp.typeEmoji, style: const TextStyle(fontSize: 16)),
                      const SizedBox(width: 6),
                      Text(
                        opp.type.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: cardColor,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (opp.matchScore != null)
                  MatchScoreRing(score: opp.matchScore!, size: 48, strokeWidth: 4),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              opp.title,
              style: KushaagraTheme.labelLarge(context).copyWith(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                height: 1.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.business_rounded, size: 14, color: Colors.grey),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    opp.organizer?.name ?? 'Institution',
                    style: KushaagraTheme.bodySmall(context).copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                if (opp.rewards?.cashAmount != null && opp.rewards!.cashAmount! > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: KushaagraTheme.goldGradient,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(color: Colors.amber.withValues(alpha: 0.3), blurRadius: 10),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.auto_awesome, size: 14, color: Colors.white),
                        const SizedBox(width: 6),
                        Text(
                          opp.rewards!.displayAmount,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                      ],
                    ),
                  ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 2.seconds),
                const Spacer(),
                if (opp.daysLeft >= 0)
                  DeadlineChip(daysLeft: opp.daysLeft),
              ],
            ),
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 150 * index))
     .fadeIn(duration: 500.ms)
     .slideX(begin: 0.2, curve: Curves.easeOutCubic);
  }

  Widget _buildDeadlineAlerts() {
    final urgent = _recommendations.where((o) => o.isDeadlineSoon).toList();
    if (urgent.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('⏰', style: TextStyle(fontSize: 24)),
            const SizedBox(width: 10),
            Text('Action Required!', 
              style: KushaagraTheme.titleLarge(context).copyWith(
                color: const Color(0xFFEF4444),
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              )
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('${urgent.length} URGENT', 
                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFFEF4444))
              ),
            ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 1.seconds, color: Colors.white24),
          ],
        ).animate().fadeIn(delay: 400.ms),
        const SizedBox(height: 16),
        ...urgent.take(3).toList().asMap().entries.map((entry) {
          final i = entry.key;
          final opp = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge),
              boxShadow: [
                BoxShadow(color: const Color(0xFFEF4444).withValues(alpha: 0.05), blurRadius: 10),
              ],
            ),
            child: GlassCard(
              onTap: () => Navigator.pushNamed(context, '/opportunity', arguments: opp.id),
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFEF4444).withValues(alpha: 0.12),
                  const Color(0xFFEF4444).withValues(alpha: 0.02),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 50, height: 50,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(child: Text(opp.typeEmoji, style: const TextStyle(fontSize: 24))),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(opp.title, 
                          style: KushaagraTheme.labelLarge(context).copyWith(fontWeight: FontWeight.w800), 
                          maxLines: 1, 
                          overflow: TextOverflow.ellipsis
                        ),
                        const SizedBox(height: 2),
                        Text(opp.organizer?.name ?? 'Institution', 
                          style: KushaagraTheme.bodySmall(context).copyWith(fontWeight: FontWeight.w600)
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  DeadlineChip(daysLeft: opp.daysLeft),
                ],
              ),
            ),
          ).animate(delay: Duration(milliseconds: 500 + (i * 100).toInt()))
           .fadeIn()
           .slideY(begin: 0.2);
        }),
      ],
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  }
}
