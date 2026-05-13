import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../config/theme.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../models/user.dart';
import '../../../../widgets/glass_widgets.dart';

class InstitutionHomeScreen extends ConsumerStatefulWidget {
  const InstitutionHomeScreen({super.key});
  @override
  ConsumerState<InstitutionHomeScreen> createState() => _InstitutionHomeScreenState();
}

class _InstitutionHomeScreenState extends ConsumerState<InstitutionHomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final inst = user?.institutionProfile;
    final verStatus = inst?.verificationStatus ?? 'pending';
    final List managedStudents = []; // TBD from backend

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFECFDF5), const Color(0xFFF8FAFC)],
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
                  _buildWelcomeCard(inst, managedStudents.length, verStatus),
                  const SizedBox(height: 16),

                  // ─── Verification Alert ───
                  if (verStatus != 'approved') _buildVerificationAlert(),
                  const SizedBox(height: 24),

                  // ─── Quick Stats ───
                  _buildQuickStats(inst, managedStudents.length, user?.role),
                  const SizedBox(height: 28),

                  // ─── Students Section ───
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('👨‍🎓 Recent Students', style: KushaagraTheme.titleLarge(context)),
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 8),
                  _buildStudentsList(managedStudents),
                  const SizedBox(height: 28),

                  // ─── Quick Actions ───
                  Text('⚡ Management Tools', style: KushaagraTheme.titleLarge(context)).animate().fadeIn(delay: 300.ms),
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
    final inst = user?.institutionProfile;
    final name = inst?.institutionName ?? 'Institution';

    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/notifications'),
          child: Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF059669), Color(0xFF10B981)]),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.25), blurRadius: 16)],
            ),
            child: const Center(
              child: Text('🏫', style: TextStyle(fontSize: 24)),
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

  Widget _buildWelcomeCard(InstitutionProfile? inst, int studentsCount, String verStatus) {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/institution_hero.png',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.85),
                    Colors.black.withValues(alpha: 0.3),
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
                  Text('Academic Hub 📚', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 8),
                  const SizedBox(
                    width: 250,
                    child: Text('Manage students, track applications, and post opportunities for your institution.', 
                      style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _statPill('$studentsCount Students', Icons.people_alt_rounded),
                      const SizedBox(width: 8),
                      _statPill(verStatus.toUpperCase(), Icons.verified_user_rounded),
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1);
  }

  Widget _statPill(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(text, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildVerificationAlert() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB).withValues(alpha: 0.8),
        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('⏳', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Verification in Progress', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF92400E))),
                const SizedBox(height: 4),
                const Text(
                  'Your institution is being reviewed by the Kushaagra board. Some features like public scholarship posting will be live after approval.',
                  style: TextStyle(fontSize: 13, color: Color(0xFFB45309), fontWeight: FontWeight.w600, height: 1.4),
                ),
              ],
            ),
          )
        ],
      ),
    ).animate().fadeIn(delay: 150.ms);
  }

  Widget _buildQuickStats(InstitutionProfile? inst, int studentCount, String? role) {
    final board = '—'; // TBD from backend
    return Row(
      children: [
        _statCard('👩‍🎓 Enrolled', '$studentCount', const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)])),
        const SizedBox(width: 10),
        _statCard('📚 Board', board, const LinearGradient(colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)])),
        const SizedBox(width: 10),
        _statCard('🏛️ Type', (role ?? '').toUpperCase(), const LinearGradient(colors: [Color(0xFFF43F5E), Color(0xFFE11D48)])),
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
              child: Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
            ),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentsList(List students) {
    if (students.isEmpty) {
      return GlassCard(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            children: [
              const Text('👩‍🎓', style: TextStyle(fontSize: 40)),
              const SizedBox(height: 12),
              Text('No students enrolled yet', style: KushaagraTheme.labelLarge(context)),
              const SizedBox(height: 4),
              Text('Verify and enroll students to track them', style: KushaagraTheme.bodySmall(context)),
            ],
          ),
        ),
      ).animate().fadeIn(delay: 250.ms);
    }

    return Column(
      children: students.take(3).map((s) => GlassCard(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(child: Text('🧑‍🎓', style: TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Student ${s['studentId']?.toString().substring(0, 6) ?? 'ID'}', style: KushaagraTheme.labelLarge(context)),
                  Text('Grade: ${s['grade'] ?? 'N/A'}', style: KushaagraTheme.bodySmall(context)),
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
      ('Manage Students', '👩‍🎓', 'Verify and enroll'),
      ('Post Scholarship', '🎓', 'Create new funding'),
      ('Institution Profile', '🏫', 'Update details'),
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
}
