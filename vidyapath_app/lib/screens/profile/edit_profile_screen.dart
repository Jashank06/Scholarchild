import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/glass_widgets.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});
  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  late TextEditingController _firstNameCtrl;
  late TextEditingController _lastNameCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _schoolNameCtrl;
  late TextEditingController _incomeCtrl;
  late TextEditingController _percentageCtrl;

  String? _selectedGender;
  int? _selectedGrade;
  String? _selectedBoard;
  String? _selectedState;
  String? _selectedCategory;

  bool _saving = false;

  final _genders = ['male', 'female', 'other'];
  final _grades = List.generate(12, (i) => i + 1);
  final _boards = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'];
  final _categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Other'];
  final _states = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
    'Uttar Pradesh', 'Madhya Pradesh', 'Delhi', 'West Bengal', 'Kerala',
    'Punjab', 'Haryana', 'Telangana', 'Andhra Pradesh', 'Bihar',
    'Odisha', 'Jharkhand', 'Assam', 'Goa', 'Chhattisgarh',
    'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir',
  ];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    final profile = user?.profile;

    _firstNameCtrl = TextEditingController(text: profile?.firstName ?? '');
    _lastNameCtrl = TextEditingController(text: profile?.lastName ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
    _schoolNameCtrl = TextEditingController(text: profile?.schoolName ?? '');
    _incomeCtrl = TextEditingController(text: profile?.familyIncome?.toString() ?? '');
    _percentageCtrl = TextEditingController(text: profile?.previousGradePercentage?.toString() ?? '');

    _selectedGender = profile?.gender;
    _selectedGrade = profile?.grade;
    _selectedBoard = profile?.board;
    _selectedState = profile?.address?.state;
    _selectedCategory = profile?.category;
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _schoolNameCtrl.dispose();
    _incomeCtrl.dispose();
    _percentageCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'profile': {
          'firstName': _firstNameCtrl.text.trim(),
          'lastName': _lastNameCtrl.text.trim(),
          if (_selectedGender != null) 'gender': _selectedGender,
          if (_selectedGrade != null) 'grade': _selectedGrade,
          if (_selectedBoard != null) 'board': _selectedBoard,
          if (_schoolNameCtrl.text.isNotEmpty) 'schoolName': _schoolNameCtrl.text.trim(),
          if (_selectedCategory != null) 'category': _selectedCategory,
          if (_incomeCtrl.text.isNotEmpty) 'familyIncome': num.tryParse(_incomeCtrl.text),
          if (_percentageCtrl.text.isNotEmpty) 'previousGradePercentage': num.tryParse(_percentageCtrl.text),
          if (_selectedState != null)
            'address': {'state': _selectedState},
        },
      };

      await ApiClient().put(ApiConfig.userProfile, data: body);
      await ref.read(authProvider.notifier).refreshUser();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ Profile updated successfully!'),
            backgroundColor: KushaagraTheme.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed: ${e.toString().split('\n').first}'),
            backgroundColor: KushaagraTheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : Icon(Icons.check, color: Theme.of(context).colorScheme.primary),
              label: Text('Save', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF)],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Personal Info ───
              _sectionCard(
                '👤 Personal Information',
                [
                  Row(
                    children: [
                      Expanded(child: _field('First Name', _firstNameCtrl, Icons.person_outline)),
                      const SizedBox(width: 12),
                      Expanded(child: _field('Last Name', _lastNameCtrl, null)),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _field('Phone', _phoneCtrl, Icons.phone_outlined, keyboard: TextInputType.phone,
                    formatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)]),
                  const SizedBox(height: 14),
                  _dropdown<String>('Gender', _selectedGender, _genders,
                    labels: ['Male', 'Female', 'Other'],
                    onChanged: (v) => setState(() => _selectedGender = v)),
                ],
              ).animate().fadeIn().slideY(begin: 0.08),

              const SizedBox(height: 14),

              // ─── Academic ───
              _sectionCard(
                '📚 Academic Details',
                [
                  Row(
                    children: [
                      Expanded(
                        child: _dropdown<int>('Grade', _selectedGrade, _grades,
                          labels: _grades.map((g) => 'Grade $g').toList(),
                          onChanged: (v) => setState(() => _selectedGrade = v)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _dropdown<String>('Board', _selectedBoard, _boards,
                          onChanged: (v) => setState(() => _selectedBoard = v)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _field('School Name', _schoolNameCtrl, Icons.school_outlined),
                  const SizedBox(height: 14),
                  _field('Previous Grade %', _percentageCtrl, Icons.bar_chart, keyboard: TextInputType.number),
                ],
              ).animate(delay: 100.ms).fadeIn().slideY(begin: 0.08),

              const SizedBox(height: 14),

              // ─── Additional ───
              _sectionCard(
                '📋 Additional Details',
                [
                  _dropdown<String>('State', _selectedState, _states,
                    onChanged: (v) => setState(() => _selectedState = v)),
                  const SizedBox(height: 14),
                  _dropdown<String>('Category', _selectedCategory, _categories,
                    onChanged: (v) => setState(() => _selectedCategory = v)),
                  const SizedBox(height: 14),
                  _field('Family Annual Income (₹)', _incomeCtrl, Icons.currency_rupee, keyboard: TextInputType.number),
                ],
              ).animate(delay: 200.ms).fadeIn().slideY(begin: 0.08),

              const SizedBox(height: 24),

              // Save button
              SizedBox(
                width: double.infinity,
                child: LiquidButton(
                  text: 'Save Profile',
                  icon: Icons.check_circle_outline,
                  isLoading: _saving,
                  onPressed: _save,
                ),
              ).animate(delay: 300.ms).fadeIn(),

              const SizedBox(height: 12),

              // Profile completion tip
              GlassCard(
                gradient: LinearGradient(colors: [
                  KushaagraTheme.accentGold.withValues(alpha: 0.06), Colors.transparent,
                ]),
                child: Row(
                  children: [
                    const Text('💡', style: TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Complete your profile!', style: KushaagraTheme.labelLarge(context)),
                          const SizedBox(height: 2),
                          Text('Fill all fields to get better opportunity matches and earn XP',
                            style: KushaagraTheme.bodySmall(context)),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 350.ms).fadeIn(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionCard(String title, List<Widget> children) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: KushaagraTheme.titleLarge(context)),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _field(String hint, TextEditingController controller, IconData? icon, {
    TextInputType? keyboard,
    List<TextInputFormatter>? formatters,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      inputFormatters: formatters,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: icon != null ? Icon(icon) : null,
      ),
    );
  }

  Widget _dropdown<T>(String hint, T? value, List<T> items, {
    List<String>? labels,
    required ValueChanged<T?> onChanged,
  }) {
    return DropdownButtonFormField<T>(
      value: items.contains(value) ? value : null,
      decoration: InputDecoration(hintText: hint),
      items: items.asMap().entries.map((e) => DropdownMenuItem<T>(
        value: e.value,
        child: Text(labels != null ? labels[e.key] : e.value.toString()),
      )).toList(),
      onChanged: onChanged,
    );
  }
}
