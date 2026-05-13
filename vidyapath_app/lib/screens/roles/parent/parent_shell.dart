import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../config/theme.dart';
import '../../../providers/data_providers.dart';
import '../../../widgets/parent_drawer.dart';
import 'parent_home_screen.dart';
import 'manage_children_screen.dart';
import '../../opportunities/opportunities_screen.dart';
import '../../profile/profile_screen.dart';

class ParentShell extends ConsumerStatefulWidget {
  const ParentShell({super.key});
  @override
  ConsumerState<ParentShell> createState() => _ParentShellState();
}

class _ParentShellState extends ConsumerState<ParentShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Widget> _screens = const [
    ParentHomeScreen(),
    ManageChildrenScreen(),
    OpportunitiesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentIndex = ref.watch(shellIndexProvider);

    return Scaffold(
      key: _scaffoldKey,
      extendBody: true,
      drawer: const ParentDrawer(),
      body: IndexedStack(
        index: currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
            child: Container(
              height: 80,
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF0F172A).withOpacity(0.8)
                    : Colors.white.withOpacity(0.75),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withOpacity(0.1)
                      : Colors.white.withOpacity(0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Premium Sliding Selection Indicator
                  AnimatedAlign(
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.elasticOut,
                    alignment: Alignment(
                      -1 + (currentIndex * (2 / (_screens.length - 1))).toDouble(),
                      0,
                    ),
                    child: FractionallySizedBox(
                      widthFactor: 1 / _screens.length,
                      child: Center(
                        child: Container(
                          width: 55,
                          height: 55,
                          decoration: BoxDecoration(
                            gradient: _getTabGradient(currentIndex),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: _getTabColor(currentIndex).withOpacity(0.3),
                                blurRadius: 15,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Navigation Icons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _navItem(0, Icons.grid_view_rounded, 'Home', currentIndex),
                      _navItem(1, Icons.face_rounded, 'Children', currentIndex),
                      _navItem(2, Icons.explore_rounded, 'Explore', currentIndex),
                      _navItem(3, Icons.person_rounded, 'Profile', currentIndex),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ).animate().slideY(begin: 1, duration: 600.ms, curve: Curves.easeOutCubic),
    );
  }

  Color _getTabColor(int index) {
    switch (index) {
      case 0: return const Color(0xFF6366F1); // Indigo
      case 1: return const Color(0xFF8B5CF6); // Purple
      case 2: return const Color(0xFFF59E0B); // Amber
      case 3: return const Color(0xFF10B981); // Emerald
      default: return Colors.blue;
    }
  }

  Gradient _getTabGradient(int index) {
    final color = _getTabColor(index);
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [color, color.withOpacity(0.7)],
    );
  }

  Widget _navItem(int index, IconData icon, String label, int currentIndex) {
    final isSelected = currentIndex == index;
    final activeColor = Colors.white;
    final inactiveColor = Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.5);

    return Expanded(
      child: GestureDetector(
        onTap: () => ref.read(shellIndexProvider.notifier).set(index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? activeColor : inactiveColor,
              size: isSelected ? 28 : 24,
            ).animate(target: isSelected ? 1 : 0)
             .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), curve: Curves.elasticOut, duration: 600.ms)
             .shimmer(color: Colors.white24),
            
            const SizedBox(height: 4),
            AnimatedOpacity(
              duration: const Duration(milliseconds: 300),
              opacity: isSelected ? 1 : 0,
              child: Text(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? activeColor : Colors.transparent,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
