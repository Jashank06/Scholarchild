import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/data_providers.dart';
import '../core/network/api_client.dart';
import 'glass_widgets.dart';

class KushaagraDrawer extends ConsumerWidget {
  const KushaagraDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentIndex = ref.watch(shellIndexProvider);

    return Drawer(
      width: MediaQuery.of(context).size.width * 0.88,
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: Container(
          decoration: BoxDecoration(
            color: isDark 
                ? const Color(0xFF0F172A).withValues(alpha: 0.88) 
                : Colors.white.withValues(alpha: 0.9),
            borderRadius: const BorderRadius.only(topRight: Radius.circular(50), bottomRight: Radius.circular(50)),
            border: Border(right: BorderSide(color: isDark ? Colors.white10 : Colors.black12, width: 1.5)),
          ),
          child: Stack(
            children: [
              // Decorative Glow 1
              Positioned(
                top: -100, right: -50,
                child: Container(
                  width: 300, height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: KushaagraTheme.primaryBlue.withValues(alpha: isDark ? 0.08 : 0.05),
                  ),
                ),
              ),
              
              // Decorative Glow 2
              Positioned(
                bottom: -50, left: -50,
                child: Container(
                  width: 250, height: 250,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF7C3AED).withValues(alpha: isDark ? 0.08 : 0.05),
                  ),
                ),
              ),

              SafeArea(
                child: Column(
                  children: [
                    // Premium Header Section
                    _buildHeader(context, user, isDark),

                    const SizedBox(height: 10),
                    const Divider(height: 1, indent: 30, endIndent: 30),
                    const SizedBox(height: 10),

                    // Menu Items with staggered animations
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        children: [
                          _drawerItem(context, ref, Icons.grid_view_rounded, 'Dashboard', () {
                            ref.read(shellIndexProvider.notifier).set(0);
                            if (Navigator.canPop(context)) Navigator.pop(context);
                            if (ModalRoute.of(context)?.settings.name != '/home') {
                              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                            }
                          }, isDark, isSelected: currentIndex == 0, index: 0, color: KushaagraTheme.primaryBlue),
                          
                          _drawerItem(context, ref, Icons.explore_rounded, 'Explore Opportunities', () {
                            ref.read(shellIndexProvider.notifier).set(1);
                            if (Navigator.canPop(context)) Navigator.pop(context);
                            if (ModalRoute.of(context)?.settings.name != '/home') {
                              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                            }
                          }, isDark, isSelected: currentIndex == 1, index: 1, color: const Color(0xFF8B5CF6)),

                          _drawerItem(context, ref, Icons.rocket_launch_rounded, 'My Applications', () {
                            ref.read(shellIndexProvider.notifier).set(2);
                            if (Navigator.canPop(context)) Navigator.pop(context);
                            if (ModalRoute.of(context)?.settings.name != '/home') {
                              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                            }
                          }, isDark, isSelected: currentIndex == 2, index: 2, color: const Color(0xFFF97316)),

                          Padding(
                            padding: const EdgeInsets.fromLTRB(15, 25, 0, 10),
                            child: Row(
                              children: [
                                Container(width: 12, height: 2, decoration: BoxDecoration(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.5), borderRadius: BorderRadius.circular(1))),
                                const SizedBox(width: 8),
                                Text('RESOURCES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.blueGrey.shade400 : Colors.blueGrey.shade700, letterSpacing: 2)),
                              ],
                            ),
                          ).animate().fadeIn(delay: 400.ms),

                          _drawerItem(context, ref, Icons.notifications_active_rounded, 'Notifications', () {
                            Navigator.pop(context);
                            Navigator.pushNamed(context, '/notifications');
                          }, isDark, index: 3, color: const Color(0xFFF59E0B)),
                          
                          _drawerItem(context, ref, Icons.bookmarks_rounded, 'Bookmarks', () {
                            Navigator.pop(context);
                            Navigator.pushNamed(context, '/bookmarks');
                          }, isDark, index: 4, color: const Color(0xFFEC4899)),
                          
                          _drawerItem(context, ref, Icons.folder_shared_rounded, 'My Documents', () {
                            Navigator.pop(context);
                            Navigator.pushNamed(context, '/documents');
                          }, isDark, index: 5, color: const Color(0xFF10B981)),
                          
                          _drawerItem(context, ref, Icons.school_rounded, 'Partner Schools', () {
                            Navigator.pop(context);
                            Navigator.pushNamed(context, '/schools');
                          }, isDark, index: 6, color: const Color(0xFF3B82F6)),
                          
                          Padding(
                            padding: const EdgeInsets.fromLTRB(15, 25, 0, 10),
                            child: Row(
                              children: [
                                Container(width: 12, height: 2, decoration: BoxDecoration(color: const Color(0xFF7C3AED).withValues(alpha: 0.5), borderRadius: BorderRadius.circular(1))),
                                const SizedBox(width: 8),
                                Text('ACCOUNT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.blueGrey.shade400 : Colors.blueGrey.shade700, letterSpacing: 2)),
                              ],
                            ),
                          ).animate().fadeIn(delay: 600.ms),

                          _drawerItem(context, ref, Icons.person_rounded, 'My Profile', () {
                            ref.read(shellIndexProvider.notifier).set(3);
                            if (Navigator.canPop(context)) Navigator.pop(context);
                            if (ModalRoute.of(context)?.settings.name != '/home') {
                              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                            }
                          }, isDark, isSelected: currentIndex == 3, index: 7, color: const Color(0xFF6366F1)),
                          
                          _drawerItem(context, ref, Icons.support_agent_rounded, 'Help & Support', () {
                            Navigator.pop(context);
                            if (ModalRoute.of(context)?.settings.name != '/services') {
                              Navigator.pushNamed(context, '/services');
                            }
                          }, isDark, isSelected: ModalRoute.of(context)?.settings.name == '/services', index: 8, color: const Color(0xFF06B6D4)),
                          
                          _drawerItem(context, ref, Icons.logout_rounded, 'Sign Out', () async {
                            await ref.read(authProvider.notifier).logout();
                            if (context.mounted) Navigator.pushReplacementNamed(context, '/auth');
                          }, isDark, color: Colors.redAccent, index: 9),
                        ],
                      ),
                    ),
                    
                    // Version Info
                    Container(
                      padding: const EdgeInsets.all(25),
                      child: Column(
                        children: [
                          const Divider(),
                          const SizedBox(height: 15),
                          Text('Kushaagra Premium v1.0.4', 
                            style: GoogleFonts.inter(fontSize: 11, color: Colors.grey.withValues(alpha: 0.6), fontWeight: FontWeight.w700, letterSpacing: 0.5)
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 800.ms),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, user, bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(25, 40, 25, 20),
      child: Row(
        children: [
          // Avatar with ring
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              gradient: KushaagraTheme.primaryGradient,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.3), blurRadius: 15, spreadRadius: 2)],
            ),
            child: Container(
              width: 68, height: 68,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(21),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(21),
                child: user?.avatar != null
                    ? CachedNetworkImage(
                        imageUrl: ApiClient().getImageUrl(user!.avatar!),
                        fit: BoxFit.cover,
                        placeholder: (context, url) => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                        errorWidget: (context, url, error) => Center(child: Text(user.initials, style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: KushaagraTheme.primaryBlue))),
                      )
                    : Center(child: Text(user?.initials ?? '?', style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: KushaagraTheme.primaryBlue))),
              ),
            ),
          ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),

          const SizedBox(width: 18),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user?.fullName ?? 'Student Name', 
                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                  maxLines: 1, overflow: TextOverflow.ellipsis
                ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.2),
                
                const SizedBox(height: 2),
                
                Text(user?.email ?? 'student@kushaagra.com', 
                  style: GoogleFonts.inter(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.w500),
                  maxLines: 1, overflow: TextOverflow.ellipsis
                ).animate().fadeIn(delay: 300.ms).slideX(begin: 0.2),
                
                const SizedBox(height: 8),
                
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: KushaagraTheme.primaryBlue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.2)),
                  ),
                  child: Text('PREMIUM MEMBER', 
                    style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w900, color: KushaagraTheme.primaryBlue, letterSpacing: 1)
                  ),
                ).animate().fadeIn(delay: 400.ms),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _drawerItem(BuildContext context, WidgetRef ref, IconData icon, String label, VoidCallback onTap, bool isDark, {bool isSelected = false, Color? color, required int index}) {
    final activeColor = color ?? KushaagraTheme.primaryBlue;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        borderRadius: 18,
        gradient: isSelected 
            ? LinearGradient(
                colors: [activeColor.withValues(alpha: 0.15), activeColor.withValues(alpha: 0.05), Colors.transparent],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ) 
            : null,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? activeColor.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, 
                color: isSelected ? activeColor : (color ?? (isDark ? Colors.white60 : Colors.black54)), 
                size: 22
              ),
            ),
            const SizedBox(width: 15),
            Text(label, style: GoogleFonts.outfit(
              fontSize: 15, 
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? activeColor : (color ?? (isDark ? Colors.white.withValues(alpha: 0.9) : Colors.black87)),
              letterSpacing: 0.2,
            )),
            const Spacer(),
            if (isSelected)
              Container(
                width: 5, height: 5,
                decoration: BoxDecoration(color: activeColor, shape: BoxShape.circle),
              ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(1, 1), end: const Offset(1.5, 1.5), duration: 800.ms)
            else
              Icon(Icons.chevron_right_rounded, size: 18, color: isDark ? Colors.white10 : Colors.black12),
          ],
        ),
      ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.1, curve: Curves.easeOutCubic),
    );
  }
}
