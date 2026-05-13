import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../config/theme.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../widgets/glass_widgets.dart';

class ManageStudentsScreen extends ConsumerStatefulWidget {
  const ManageStudentsScreen({super.key});
  @override
  ConsumerState<ManageStudentsScreen> createState() => _ManageStudentsScreenState();
}

class _ManageStudentsScreenState extends ConsumerState<ManageStudentsScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final List students = []; // TBD from backend

    return Scaffold(
      appBar: AppBar(
        title: const Text('Enrolled Students', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1_rounded),
            onPressed: _showEnrollStudentDialog,
          )
        ],
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF8FAFC), const Color(0xFFECFDF5)],
          ),
        ),
        child: SafeArea(
          child: students.isEmpty ? _buildEmptyState() : _buildStudentsList(students),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('👩‍🎓', style: TextStyle(fontSize: 80)).animate().scale(delay: 200.ms, duration: 400.ms, curve: Curves.elasticOut),
          const SizedBox(height: 24),
          Text('No Students Enrolled', style: KushaagraTheme.displaySmall(context)).animate().fadeIn(delay: 300.ms),
          const SizedBox(height: 12),
          Text(
            'Enroll students using their unique ID to\nverify them and track performance.',
            style: KushaagraTheme.bodyMedium(context),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 400.ms),
          const SizedBox(height: 32),
          LiquidButton(
            text: 'Enroll Student',
            icon: Icons.qr_code_scanner_rounded,
            onPressed: _showEnrollStudentDialog,
          ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2),
        ],
      ),
    );
  }

  Widget _buildStudentsList(List students) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
      itemCount: students.length,
      itemBuilder: (context, index) {
        final student = students[index];
        return GlassCard(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(child: Text('🧑‍🎓', style: TextStyle(fontSize: 28))),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Student ID: ${student['studentId']?.toString().substring(0,6) ?? '...'}', style: KushaagraTheme.titleLarge(context)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Grade ${student['grade'] ?? 'N/A'}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF059669),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.more_vert),
                    onPressed: () {},
                  )
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _miniStat('Attendance', '92%'),
                  Container(width: 1, height: 30, color: Theme.of(context).dividerColor),
                  _miniStat('Scholarships', '1'),
                  Container(width: 1, height: 30, color: Theme.of(context).dividerColor),
                  _miniStat('Status', 'Active'),
                ],
              )
            ],
          ),
        ).animate(delay: Duration(milliseconds: 100 * index)).fadeIn().slideX(begin: 0.1);
      },
    );
  }

  Widget _miniStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        Text(label, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
      ],
    );
  }

  void _showEnrollStudentDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Enroll Student'),
        content: const Text('Enter the student\'s enrollment ID or scan their QR code to add them to your institution.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Verify & Add', style: TextStyle(color: Color(0xFF059669)))),
        ],
      ),
    );
  }
}
