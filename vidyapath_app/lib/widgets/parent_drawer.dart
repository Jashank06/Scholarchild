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

class ParentDrawer extends ConsumerWidget {
  const ParentDrawer({super.key});

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
                ? const Color(0xFF0F172A).withOpacity(0.88) 
                : Colors.white.withOpacity(0.9),
            borderRadius: const BorderRadius.only(topRight: Radius.circular(50), bottomRight: Radius.circular(50)),
            border: Border(right: BorderSide(color: isDark ? Colors.white10 : Colors.black12, width: 1.5)),
          ),
          child: Stack(
            children: [
              // Decorative Glows
              _buildGlow(context, isDark, top: -100, right: -50, color: const Color(0xFF6366F1)),
              _buildGlow(context, isDark, bottom: -50, left: -50, color: const Color(0xFFF59E0B)),

              SafeArea(
                child: Column(
                  children: [
                    _buildHeader(context, user, isDark),
                    const SizedBox(height: 10),
                    const Divider(height: 1, indent: 30, endIndent: 30),
                    const SizedBox(height: 10),

                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        children: [
                          _drawerItem(context, ref, Icons.dashboard_rounded, 'Parent Dashboard', 0, isDark, currentIndex, const Color(0xFF6366F1)),
                          _drawerItem(context, ref, Icons.face_rounded, 'My Children', 1, isDark, currentIndex, const Color(0xFF8B5CF6)),
                          _drawerItem(context, ref, Icons.explore_rounded, 'Explore Resources', 2, isDark, currentIndex, const Color(0xFFF59E0B)),
                          
                          _sectionTitle(isDark, 'MANAGEMENT', const Color(0xFF6366F1)),
                          
                          _drawerItem(context, ref, Icons.notifications_active_rounded, 'Alerts & Notifications', -1, isDark, currentIndex, const Color(0xFFEF4444), route: '/notifications'),
                          _drawerItem(context, ref, Icons.folder_special_rounded, 'Files & Folders', -1, isDark, currentIndex, const Color(0xFF10B981), route: '/documents'),
                          _drawerItem(context, ref, Icons.history_rounded, 'Application Activity', 1, isDark, currentIndex, const Color(0xFF3B82F6)),

                          _sectionTitle(isDark, 'EXPLORE', const Color(0xFFF59E0B)),

                          _drawerItem(context, ref, Icons.school_rounded, 'Schools', -1, isDark, currentIndex, const Color(0xFF667eea), route: '/schools'),
                          _drawerItem(context, ref, Icons.account_balance_rounded, 'Institutions', -1, isDark, currentIndex, const Color(0xFF0083B0), route: '/institutions'),
                          _drawerItem(context, ref, Icons.event_rounded, 'Events', -1, isDark, currentIndex, const Color(0xFFF5576C), route: '/events'),
                          _drawerItem(context, ref, Icons.star_rounded, 'Notables', -1, isDark, currentIndex, const Color(0xFFF59E0B), route: '/notables'),
                          _drawerItem(context, ref, Icons.business_rounded, 'Service Providers', -1, isDark, currentIndex, const Color(0xFF6366F1), route: '/service-providers'),
                          
                          _sectionTitle(isDark, 'PREFERENCES', const Color(0xFF7C3AED)),
                          
                          _drawerItem(context, ref, Icons.person_rounded, 'Guardian Profile', 3, isDark, currentIndex, const Color(0xFF6366F1)),
                          _drawerItem(context, ref, Icons.support_agent_rounded, 'Help & Support', -1, isDark, currentIndex, const Color(0xFF06B6D4), route: '/services'),
                          
                          const SizedBox(height: 20),
                          _drawerItem(context, ref, Icons.logout_rounded, 'Sign Out', -1, isDark, currentIndex, Colors.redAccent, onAction: () async {
                            await ref.read(authProvider.notifier).logout();
                            if (context.mounted) Navigator.pushReplacementNamed(context, '/auth');
                          }),
                        ],
                      ),
                    ),
                    
                    _buildVersionInfo(isDark),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGlow(BuildContext context, bool isDark, {double? top, double? bottom, double? left, double? right, required Color color}) {
    return Positioned(
      top: top, bottom: bottom, left: left, right: right,
      child: Container(
        width: 250, height: 250,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withOpacity(isDark ? 0.08 : 0.05),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, user, bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(25, 40, 25, 20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4F46E5)]),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withOpacity(0.3), blurRadius: 15, spreadRadius: 2)],
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
                        errorWidget: (context, url, error) => Center(child: Text(user.initials, style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1)))),
                      )
                    : Center(child: Text(user?.initials ?? '?', style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1)))),
              ),
            ),
          ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),

          const SizedBox(width: 18),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user?.fullName ?? 'Guardian Name', 
                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                  maxLines: 1, overflow: TextOverflow.ellipsis
                ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.2),
                
                Text(user?.email ?? 'parent@kushaagra.com', 
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.w500),
                  maxLines: 1, overflow: TextOverflow.ellipsis
                ).animate().fadeIn(delay: 300.ms).slideX(begin: 0.2),
                
                const SizedBox(height: 6),
                
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('FAMILY GUARDIAN', 
                    style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1), letterSpacing: 1)
                  ),
                ).animate().fadeIn(delay: 400.ms),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(bool isDark, String label, Color color) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(15, 25, 0, 10),
      child: Row(
        children: [
          Container(width: 12, height: 2, decoration: BoxDecoration(color: color.withOpacity(0.5), borderRadius: BorderRadius.circular(1))),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: isDark ? Colors.blueGrey.shade400 : Colors.blueGrey.shade700, letterSpacing: 2)),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms);
  }

  Widget _drawerItem(BuildContext context, WidgetRef ref, IconData icon, String label, int targetIndex, bool isDark, int currentIndex, Color activeColor, {String? route, VoidCallback? onAction}) {
    final isSelected = targetIndex >= 0 && currentIndex == targetIndex;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: GlassCard(
        onTap: onAction ?? () {
          if (targetIndex >= 0) {
            ref.read(shellIndexProvider.notifier).set(targetIndex);
          }
          Navigator.pop(context);
          if (route != null) Navigator.pushNamed(context, route);
        },
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        borderRadius: 20,
        gradient: isSelected 
            ? LinearGradient(
                colors: [activeColor.withOpacity(0.15), activeColor.withOpacity(0.05), Colors.transparent],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ) 
            : null,
        child: Row(
          children: [
            Icon(icon, color: isSelected ? activeColor : (isDark ? Colors.white60 : Colors.black54), size: 22),
            const SizedBox(width: 15),
            Text(label, style: GoogleFonts.outfit(
              fontSize: 15, 
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? activeColor : (isDark ? Colors.white.withOpacity(0.9) : Colors.black87),
              letterSpacing: 0.2,
            )),
            const Spacer(),
            if (isSelected)
              Container(width: 5, height: 5, decoration: BoxDecoration(color: activeColor, shape: BoxShape.circle))
            else
              Icon(Icons.chevron_right_rounded, size: 18, color: isDark ? Colors.white10 : Colors.black12),
          ],
        ),
      ),
    ).animate().fadeIn().slideX(begin: 0.1);
  }

  Widget _buildVersionInfo(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(25),
      child: Column(
        children: [
          const Divider(),
          const SizedBox(height: 15),
          Text('Kushaagra Parent v1.0.1', 
            style: GoogleFonts.inter(fontSize: 11, color: Colors.grey.withOpacity(0.6), fontWeight: FontWeight.w700, letterSpacing: 0.5)
          ),
        ],
      ),
    ).animate().fadeIn(delay: 600.ms);
  }
}
