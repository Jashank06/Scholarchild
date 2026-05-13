import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/glass_widgets.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _pickImage(BuildContext context, WidgetRef ref) async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => GlassCard(
        margin: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library, color: KushaagraTheme.primaryBlue),
              title: const Text('Pick from Gallery'),
              onTap: () async {
                Navigator.pop(context);
                final picker = ImagePicker();
                final image = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
                if (image != null) {
                  await ref.read(authProvider.notifier).updateProfilePicture(image.path);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: KushaagraTheme.primaryBlue),
              title: const Text('Take a Photo'),
              onTap: () async {
                Navigator.pop(context);
                try {
                  final picker = ImagePicker();
                  final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 70);
                  if (image != null) {
                    await ref.read(authProvider.notifier).updateProfilePicture(image.path);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Camera is not supported on this device. Please use Gallery.')),
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617), const Color(0xFF1E1B4B)]
                : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF), const Color(0xFFFDE68A)],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              child: Column(
                children: [
                  // ─── Luxury Profile Header ───
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      gradient: LinearGradient(
                        colors: [
                          Colors.white.withValues(alpha: isDark ? 0.05 : 0.7),
                          Colors.white.withValues(alpha: isDark ? 0.02 : 0.4),
                        ],
                      ),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    child: Column(
                      children: [
                        // Avatar with Rotating Glow
                        GestureDetector(
                          onTap: () => _pickImage(context, ref),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Outer Rotating Glow
                              Container(
                                width: 120, height: 120,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: KushaagraTheme.primaryBlue.withValues(alpha: 0.2),
                                      blurRadius: 30,
                                      spreadRadius: 5,
                                    ),
                                  ],
                                ),
                              ).animate(onPlay: (c) => c.repeat())
                               .shimmer(duration: 3.seconds, color: KushaagraTheme.primaryBlue.withValues(alpha: 0.3)),

                              // Avatar
                              Container(
                                width: 100, height: 100,
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  gradient: KushaagraTheme.primaryGradient,
                                  shape: BoxShape.circle,
                                ),
                                child: Container(
                                  decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(50),
                                    child: user?.profile?.avatar != null
                                        ? CachedNetworkImage(
                                            imageUrl: ApiClient().getImageUrl(user!.profile!.avatar!),
                                            fit: BoxFit.cover,
                                            placeholder: (context, url) => const Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                                            errorWidget: (context, url, error) => Center(
                                              child: Text(user.initials,
                                                style: GoogleFonts.outfit(fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white),
                                              ),
                                            ),
                                          )
                                        : Center(
                                            child: Text(user?.initials ?? '?',
                                              style: GoogleFonts.outfit(fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white),
                                            ),
                                          ),
                                  ),
                                ),
                              ),
                              // Camera Icon
                              Positioned(
                                bottom: 0, right: 0,
                                child: Container(
                                  width: 32, height: 32,
                                  decoration: BoxDecoration(
                                    color: KushaagraTheme.accentGold,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 3),
                                    boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
                                  ),
                                  child: const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                        ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),

                        const SizedBox(height: 20),

                        Text(user?.fullName ?? 'Anonymous', 
                          style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5)
                        ),
                        Text(user?.email ?? '', 
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.grey)
                        ),

                        const SizedBox(height: 24),

                        // Animated Completion Bar
                        _profileCompletionBar(context, user?.calculatedScore ?? 0),

                        const SizedBox(height: 20),

                        // Tags
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          alignment: WrapAlignment.center,
                          children: [
                            if (user?.role != null) _infoChip(context, '👤 ${user!.role.toUpperCase()}', const Color(0xFF6366F1)),
                            if (user?.profile?.grade != null) _infoChip(context, '📚 Grade ${user!.profile!.grade}', const Color(0xFF10B981)),
                            if (user?.profile?.board != null) _infoChip(context, '🏫 ${user!.profile!.board}', const Color(0xFFF59E0B)),
                          ],
                        ),
                      ],
                    ),
                  ).animate().fadeIn().slideY(begin: 0.1),

                  const SizedBox(height: 20),

                  // ─── Gamification Hub ───
                  Row(
                    children: [
                      _gameStat('Level', '${user?.gamification?.level ?? 1}', const Color(0xFF6366F1)),
                      const SizedBox(width: 12),
                      _gameStat('XP', '${user?.gamification?.xp ?? 0}', const Color(0xFFF59E0B)),
                      const SizedBox(width: 12),
                      _gameStat('Streak', '${user?.gamification?.streakDays ?? 0}🔥', const Color(0xFFEF4444)),
                    ],
                  ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.1),

                  const SizedBox(height: 20),

                  // Badges Shimmer Section
                  if (user?.gamification?.badges != null && user!.gamification!.badges.isNotEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: isDark ? 0.05 : 0.8),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ACHIEVEMENT BADGES', 
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)
                          ),
                          const SizedBox(height: 15),
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: user.gamification!.badges.map((b) => 
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [KushaagraTheme.accentGold.withValues(alpha: 0.2), Colors.transparent]
                                  ),
                                  borderRadius: BorderRadius.circular(15),
                                  border: Border.all(color: KushaagraTheme.accentGold.withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(b.badgeIcon, style: const TextStyle(fontSize: 20)),
                                    const SizedBox(width: 8),
                                    Text(b.badgeName, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
                                  ],
                                ),
                              ).animate(onPlay: (c) => c.repeat())
                               .shimmer(delay: 2.seconds, duration: 1.5.seconds, color: Colors.white24)
                            ).toList(),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: 20),

                  // ─── Actions List ───
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: isDark ? 0.05 : 0.8),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    child: Column(
                      children: [
                        _menuItem(context, Icons.edit_rounded, 'Edit Profile', () => Navigator.pushNamed(context, '/edit-profile')),
                        _menuItem(context, Icons.folder_special_rounded, 'My Documents', () => Navigator.pushNamed(context, '/documents')),
                        _menuItem(context, Icons.notifications_active_rounded, 'Notifications', () => Navigator.pushNamed(context, '/notifications')),
                        _menuItem(context, Icons.support_agent_rounded, 'Help & Support', () => Navigator.pushNamed(context, '/services')),
                        // Dark Mode Toggle
                        ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                            child: Icon(isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: Colors.blue, size: 20),
                          ),
                          title: Text('Dark Theme', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15)),
                          trailing: Switch.adaptive(
                            value: isDark,
                            activeColor: Colors.blue,
                            onChanged: (v) {
                              ref.read(themeModeProvider.notifier).toggle(v ? ThemeMode.dark : ThemeMode.light);
                            },
                          ),
                        ),
                        _menuItem(context, Icons.logout_rounded, 'Logout', () async {
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) Navigator.pushReplacementNamed(context, '/auth');
                        }, isLast: true, color: Colors.redAccent),
                      ],
                    ),
                  ).animate().fadeIn(delay: 400.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _profileCompletionBar(BuildContext context, int score) {
    final color = score >= 80 ? const Color(0xFF10B981) : score >= 50 ? const Color(0xFFF59E0B) : const Color(0xFF6366F1);

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('PROFILE COMPLETION', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1)),
            Text('$score%', style: GoogleFonts.jetBrainsMono(fontSize: 14, fontWeight: FontWeight.w900, color: color)),
          ],
        ),
        const SizedBox(height: 10),
        Stack(
          children: [
            Container(
              height: 12,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: score / 100),
              duration: const Duration(seconds: 2),
              curve: Curves.elasticOut,
              builder: (_, value, __) => FractionallySizedBox(
                widthFactor: value.clamp(0.0, 1.0),
                child: Container(
                  height: 12,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.6)]),
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
                  ),
                ).animate(onPlay: (c) => c.repeat())
                 .shimmer(duration: 2.seconds, color: Colors.white30),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _gameStat(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(value, style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: color)),
            const SizedBox(height: 4),
            Text(label.toUpperCase(), 
              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: color.withValues(alpha: 0.7), letterSpacing: 1)
            ),
          ],
        ),
      ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
    );
  }

  Widget _menuItem(BuildContext context, IconData icon, String title, VoidCallback onTap, {bool isLast = false, Color? color}) {
    return Column(
      children: [
        ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (color ?? Colors.blue).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color ?? Colors.blue, size: 20),
          ),
          title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15, color: color)),
          trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
          onTap: onTap,
        ),
        if (!isLast)
          Divider(height: 1, indent: 70, endIndent: 20, color: Colors.grey.withValues(alpha: 0.1)),
      ],
    );
  }

  Widget _infoChip(BuildContext context, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Text(text, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
    );
  }
}
