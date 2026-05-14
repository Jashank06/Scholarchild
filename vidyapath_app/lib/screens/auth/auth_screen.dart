import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_widgets.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});
  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> with SingleTickerProviderStateMixin {
  bool _isLogin = true;
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  String _selectedRole = 'student';
  int? _selectedGrade;
  String? _selectedBoard;
  String? _selectedState;

  final _boards = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'];
  final _grades = List.generate(12, (i) => i + 1);
  final _states = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
    'Uttar Pradesh', 'Madhya Pradesh', 'Delhi', 'West Bengal', 'Kerala',
    'Punjab', 'Haryana', 'Telangana', 'Andhra Pradesh', 'Bihar',
    'Odisha', 'Jharkhand', 'Assam', 'Goa', 'Chhattisgarh',
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Navigate on auth state change
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (next.status == AuthStatus.otpSent) {
        Navigator.pushNamed(context, '/otp');
      } else if (next.status == AuthStatus.authenticated) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    });

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: const AssetImage('assets/images/auth_background.png'),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              isDark
                  ? Colors.black.withValues(alpha: 0.6)
                  : Colors.white.withValues(alpha: 0.4),
              BlendMode.darken,
            ),
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                // Spacer to push form down for Login, or keep at top for Register
                SizedBox(height: _isLogin ? 320 : 32),

                if (!_isLogin) ...[
                  // Logo (Only for Register)
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: KushaagraTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: KushaagraTheme.primaryBlue.withValues(alpha: 0.35),
                          blurRadius: 28,
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Image.asset(
                        'assets/images/App_Logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ).animate().scale(
                      begin: const Offset(0.7, 0.7),
                      duration: 400.ms,
                      curve: Curves.elasticOut),
                ],

                const SizedBox(height: 28),

                // ─── Glass Card Form ───
                GlassCard(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Toggle Login/Register
                      Container(
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(KushaagraTheme.radiusMedium),
                        ),
                        child: Row(
                          children: [
                            _tabButton('Login', _isLogin, () => setState(() => _isLogin = true)),
                            _tabButton('Register', !_isLogin, () => setState(() => _isLogin = false)),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Role selector (register only)
                      if (!_isLogin) ...[
                        Text('I am a', style: KushaagraTheme.labelLarge(context)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _roleChip('Student', 'student', Icons.person),
                            const SizedBox(width: 8),
                            _roleChip('Parent', 'parent', Icons.family_restroom),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Name fields
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _firstNameController,
                                decoration: const InputDecoration(hintText: 'First Name', prefixIcon: Icon(Icons.person_outline)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _lastNameController,
                                decoration: const InputDecoration(hintText: 'Last Name'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                      ],

                      // Email
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          hintText: 'Email Address',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Phone (Register Only)
                      if (!_isLogin) ...[
                        const SizedBox(height: 14),
                        TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(10)
                          ],
                          decoration: const InputDecoration(
                            hintText: 'Phone Number (Optional)',
                            prefixIcon: Icon(Icons.phone_outlined),
                            prefixText: '+91 ',
                          ),
                        ),
                      ],

                      // Student-specific fields
                      if (!_isLogin && _selectedRole == 'student') ...[
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<int>(
                                value: _selectedGrade,
                                decoration: const InputDecoration(hintText: 'Grade'),
                                items: _grades.map((g) => DropdownMenuItem(value: g, child: Text('Grade $g'))).toList(),
                                onChanged: (v) => setState(() => _selectedGrade = v),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: _selectedBoard,
                                decoration: const InputDecoration(hintText: 'Board'),
                                items: _boards.map((b) => DropdownMenuItem(value: b, child: Text(b))).toList(),
                                onChanged: (v) => setState(() => _selectedBoard = v),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        DropdownButtonFormField<String>(
                          value: _selectedState,
                          decoration: const InputDecoration(hintText: 'State', prefixIcon: Icon(Icons.location_on_outlined)),
                          items: _states.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                          onChanged: (v) => setState(() => _selectedState = v),
                        ),
                      ],

                      const SizedBox(height: 24),

                      // Error
                      if (authState.error != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: KushaagraTheme.error.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: KushaagraTheme.error.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: KushaagraTheme.error, size: 18),
                              const SizedBox(width: 8),
                              Expanded(child: Text(authState.error!, style: const TextStyle(color: KushaagraTheme.error, fontSize: 13))),
                            ],
                          ),
                        ).animate().shake(hz: 3, duration: 400.ms),

                      // Submit button
                      SizedBox(
                        width: double.infinity,
                        child: LiquidButton(
                          text: _isLogin ? 'Send OTP' : 'Create Account',
                          icon: Icons.arrow_forward_rounded,
                          isLoading: authState.status == AuthStatus.loading,
                          onPressed: _submit,
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.15, curve: Curves.easeOut),

                const SizedBox(height: 20),

                // Toggle text
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _isLogin ? "Don't have an account? " : 'Already have an account? ',
                      style: KushaagraTheme.bodyMedium(context).copyWith(
                        color: isDark ? Colors.white70 : Colors.black54,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _isLogin = !_isLogin),
                      child: Text(
                        _isLogin ? 'Register' : 'Login',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF2563EB), // Vibrant Blue
                          decoration: TextDecoration.underline,
                          decorationColor: const Color(0xFF2563EB).withValues(alpha: 0.3),
                        ),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 400.ms),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Text(
                    'Kushaagra is not a government entity. We aggregate data from official portals like scholarships.gov.in.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: isDark ? Colors.white54 : Colors.black45,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _tabButton(String text, bool isActive, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? Theme.of(context).colorScheme.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(KushaagraTheme.radiusMedium),
          ),
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: isActive ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleChip(String label, String role, IconData icon) {
    final isSelected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected
                ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.1)
                : Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(KushaagraTheme.radiusMedium),
            border: Border.all(
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.outline,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20,
                color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 8),
              Text(label, style: GoogleFonts.inter(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant,
              )),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email')),
      );
      return;
    }
    final phone = _phoneController.text.trim();

    if (_isLogin) {
      ref.read(authProvider.notifier).login(email: email);
    } else {
      ref.read(authProvider.notifier).register(
        email: email,
        phone: phone.isNotEmpty ? phone : null,
        role: _selectedRole,
        firstName: _firstNameController.text.trim().isNotEmpty ? _firstNameController.text.trim() : null,
        lastName: _lastNameController.text.trim().isNotEmpty ? _lastNameController.text.trim() : null,
        grade: _selectedGrade,
        board: _selectedBoard,
        userState: _selectedState,
      );
    }
  }
}
