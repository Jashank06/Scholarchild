import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_widgets.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});
  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.status == AuthStatus.authenticated) {
        final role = next.user?.role;
        if (role == 'parent') {
          Navigator.pushReplacementNamed(context, '/parent_home');
        } else if (role == 'school' || role == 'university') {
          Navigator.pushReplacementNamed(context, '/institution_home');
        } else if (role == 'admin') {
          Navigator.pushReplacementNamed(context, '/admin_home');
        } else {
          Navigator.pushReplacementNamed(context, '/home');
        }
      }
    });

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF020617), const Color(0xFF0F172A)]
                : [const Color(0xFFEFF6FF), const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const SizedBox(height: 20),

                // Back button
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.arrow_back_rounded, size: 20),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Lock illustration
                Container(
                  width: 140, height: 140,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.2), blurRadius: 28),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset('assets/images/otp_illustration.png', fit: BoxFit.cover),
                  ),
                ).animate().scale(begin: const Offset(0.6, 0.6), duration: 400.ms, curve: Curves.elasticOut),

                const SizedBox(height: 24),

                Text('Verify OTP', style: KushaagraTheme.displayMedium(context))
                    .animate().fadeIn(delay: 100.ms),

                const SizedBox(height: 8),

                Text(
                  'Enter the 6-digit code sent to your email',
                  style: KushaagraTheme.bodyMedium(context),
                  textAlign: TextAlign.center,
                ).animate().fadeIn(delay: 200.ms),

                // Dev OTP display
                if (authState.otp != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: KushaagraTheme.accentGold.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(KushaagraTheme.radiusFull),
                      border: Border.all(color: KushaagraTheme.accentGold.withValues(alpha: 0.3)),
                    ),
                    child: Text('Dev OTP: ${authState.otp}',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: KushaagraTheme.accentGold),
                    ),
                  ).animate().fadeIn(delay: 300.ms),
                ],

                const SizedBox(height: 36),

                // OTP Input boxes
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(6, (i) {
                    return Container(
                      width: 48, height: 56,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: TextField(
                        controller: _controllers[i],
                        focusNode: _focusNodes[i],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                        style: KushaagraTheme.displaySmall(context),
                        decoration: InputDecoration(
                          counterText: '',
                          contentPadding: EdgeInsets.zero,
                          filled: true,
                          fillColor: Theme.of(context).colorScheme.surface,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.4), width: 1),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        onChanged: (v) {
                          if (v.isNotEmpty && i < 5) {
                            _focusNodes[i + 1].requestFocus();
                          }
                          if (v.isEmpty && i > 0) {
                            _focusNodes[i - 1].requestFocus();
                          }
                          // Auto submit when all filled
                          if (_controllers.every((c) => c.text.isNotEmpty)) {
                            _verifyOtp();
                          }
                        },
                      ),
                    ).animate(delay: Duration(milliseconds: 100 * i)).fadeIn().slideY(begin: 0.3);
                  }),
                ),

                const SizedBox(height: 32),

                // Error
                if (authState.error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: KushaagraTheme.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: KushaagraTheme.error, size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(authState.error!, style: const TextStyle(color: KushaagraTheme.error, fontSize: 13))),
                      ],
                    ),
                  ).animate().shake(hz: 3, duration: 400.ms),

                // Verify button
                SizedBox(
                  width: double.infinity,
                  child: LiquidButton(
                    text: 'Verify & Login',
                    icon: Icons.check_circle_outline,
                    isLoading: authState.status == AuthStatus.loading,
                    onPressed: _verifyOtp,
                  ),
                ),

                const Spacer(),

                // Resend
                TextButton(
                  onPressed: () {
                    for (final c in _controllers) c.clear();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('OTP resent!')),
                    );
                  },
                  child: Text("Didn't receive OTP? Resend",
                    style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w500),
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _verifyOtp() {
    final otp = _controllers.map((c) => c.text).join();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the complete 6-digit OTP')),
      );
      return;
    }
    ref.read(authProvider.notifier).verifyOtp(otp);
  }
}
