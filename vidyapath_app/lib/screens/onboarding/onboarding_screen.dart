import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../widgets/glass_widgets.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  final _pages = const [
    _OnboardingPage(
      icon: Icons.search_rounded,
      title: 'Discover Opportunities',
      subtitle:
          'Find scholarships, competitions & government schemes tailored for you using AI-powered matching.',
      gradient: LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF7C3AED)]),
      backgroundImage: 'assets/images/Discover_Oppurnities.png',
    ),
    _OnboardingPage(
      icon: Icons.rocket_launch_rounded,
      title: 'Apply in Seconds',
      subtitle:
          'Upload your documents once, apply to hundreds of opportunities with a single tap.',
      gradient: LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFF97316)]),
      backgroundImage: 'assets/images/Apply_In_Seconds.png',
    ),
    _OnboardingPage(
      icon: Icons.emoji_events_rounded,
      title: 'Track & Win',
      subtitle:
          'Monitor your applications, earn badges, level up, and never miss a deadline.',
      gradient: LinearGradient(colors: [Color(0xFF10B981), Color(0xFF2563EB)]),
      backgroundImage: 'assets/images/Track.png',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Single PageView for both Background and Content
          PageView.builder(
            controller: _pageController,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemCount: _pages.length,
            itemBuilder: (_, i) => _buildPage(_pages[i]),
          ),

          SafeArea(
            child: Column(
              children: [
                // Skip button
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () =>
                        Navigator.pushReplacementNamed(context, '/auth'),
                    child: Text(
                      'Skip',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        shadows: [
                          const Shadow(blurRadius: 10, color: Colors.black45)
                        ],
                      ),
                    ),
                  ),
                ),

                const Spacer(),

                // Dots & buttons
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Dots
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(3, (i) {
                          final isActive = i == _currentPage;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: isActive ? 28 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: isActive
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.3),
                              borderRadius:
                                  BorderRadius.circular(KushaagraTheme.radiusFull),
                              boxShadow: [
                                if (isActive)
                                  const BoxShadow(
                                      blurRadius: 8, color: Colors.black26)
                              ],
                            ),
                          );
                        }),
                      ),

                      const SizedBox(height: 32),

                      // Button
                      SizedBox(
                        width: double.infinity,
                        child: LiquidButton(
                          text: _currentPage == 2 ? 'Get Started' : 'Next',
                          icon: _currentPage == 2
                              ? Icons.arrow_forward_rounded
                              : null,
                          onPressed: () {
                            if (_currentPage == 2) {
                              Navigator.pushReplacementNamed(context, '/auth');
                            } else {
                              _pageController.nextPage(
                                duration: const Duration(milliseconds: 500),
                                curve: Curves.easeInOut,
                              );
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPage(_OnboardingPage page) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage(page.backgroundImage),
          fit: BoxFit.cover,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon with gradient bg
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: page.gradient,
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: (page.gradient as LinearGradient)
                      .colors
                      .first
                      .withValues(alpha: 0.4),
                  blurRadius: 40,
                ),
              ],
            ),
            child: Icon(page.icon, size: 48, color: Colors.white),
          )
              .animate()
              .scale(
                  begin: const Offset(0.6, 0.6),
                  duration: 500.ms,
                  curve: Curves.elasticOut)
              .fadeIn(),

          const SizedBox(height: 48),

          Text(
            page.title,
            style: GoogleFonts.outfit(
              fontSize: 38,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -1,
              shadows: [const Shadow(blurRadius: 20, color: Colors.black54)],
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.3),

          const SizedBox(height: 16),

          Text(
            page.subtitle,
            style: GoogleFonts.inter(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.9),
              height: 1.5,
              shadows: [const Shadow(blurRadius: 10, color: Colors.black45)],
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 400.ms, duration: 400.ms).slideY(begin: 0.2),
        ],
      ),
    );
  }
}

class _OnboardingPage {
  final IconData icon;
  final String title, subtitle;
  final Gradient gradient;
  final String backgroundImage;

  const _OnboardingPage({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.backgroundImage,
  });
}
