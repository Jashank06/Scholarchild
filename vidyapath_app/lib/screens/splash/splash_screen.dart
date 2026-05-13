import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  late VideoPlayerController _videoController;
  bool _isVideoInitialized = false;
  bool _showLogo = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    _videoController = VideoPlayerController.asset('assets/images/Splash_Screen.mp4')
      ..initialize().then((_) {
        setState(() {
          _isVideoInitialized = true;
        });
        _videoController.play();
        _videoController.setLooping(false);
        _videoController.setVolume(1.0); // Ensure sound is audible
        
        // Wait for video to reach near end before showing logo (approx 3s)
        Future.delayed(const Duration(milliseconds: 3200), () {
          if (mounted) {
            setState(() => _showLogo = true);
            _handleNavigation();
          }
        });
      });
  }

  Future<void> _handleNavigation() async {
    // Show logo for 2.5 seconds before navigating
    await Future.delayed(const Duration(milliseconds: 2500));
    if (!mounted) return;

    final authState = ref.read(authProvider);
    if (authState.status == AuthStatus.authenticated) {
      final role = authState.user?.role;
      if (role == 'parent') {
        Navigator.of(context).pushReplacementNamed('/parent_home');
      } else if (role == 'school' || role == 'university') {
        Navigator.of(context).pushReplacementNamed('/institution_home');
      } else if (role == 'admin') {
        Navigator.of(context).pushReplacementNamed('/admin_home');
      } else {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } else {
      Navigator.of(context).pushReplacementNamed('/onboarding');
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ─── Video Layer (Blurred Background to fill black bars) ───
          if (_isVideoInitialized)
            Stack(
              fit: StackFit.expand,
              children: [
                // Blurred Background
                Opacity(
                  opacity: 0.5,
                  child: ImageFiltered(
                    imageFilter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: FittedBox(
                      fit: BoxFit.cover,
                      child: SizedBox(
                        width: _videoController.value.size.width,
                        height: _videoController.value.size.height,
                        child: VideoPlayer(_videoController),
                      ),
                    ),
                  ),
                ),
                
                // Sharp Foreground (Original Video)
                AnimatedOpacity(
                  duration: const Duration(milliseconds: 1000),
                  opacity: _showLogo ? 0.3 : 1.0,
                  child: Center(
                    child: FittedBox(
                      fit: BoxFit.contain,
                      child: SizedBox(
                        width: _videoController.value.size.width,
                        height: _videoController.value.size.height,
                        child: VideoPlayer(_videoController),
                      ),
                    ),
                  ),
                ),
              ],
            ),

          // ─── Logo Reveal ───
          if (_showLogo)
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
              child: Container(
                color: Colors.black.withValues(alpha: 0.4),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo with intense glow
                      Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.blue.withValues(alpha: 0.4),
                              blurRadius: 60,
                              spreadRadius: 10,
                            ),
                          ],
                        ),
                        child: Image.asset('assets/images/App_Logo.png'),
                      ).animate().scale(duration: 800.ms, curve: Curves.elasticOut).shimmer(delay: 1.seconds),

                      const SizedBox(height: 30),

                      // App Name
                      Text(
                        'KUSHAAGRA',
                        style: GoogleFonts.outfit(
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 10,
                          shadows: [
                            const Shadow(color: Colors.black, blurRadius: 20),
                            Shadow(color: Colors.blue.withValues(alpha: 0.5), blurRadius: 40),
                          ],
                        ),
                      ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.3),

                      const SizedBox(height: 10),

                      // Subtitle
                      Text(
                        'IGNITING POTENTIAL',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white70,
                          letterSpacing: 6,
                        ),
                      ).animate().fadeIn(delay: 700.ms),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
