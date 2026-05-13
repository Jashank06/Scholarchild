import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../config/theme.dart';
import '../../../../widgets/glass_widgets.dart';
import '../../../../providers/role_providers.dart';

class VerifySchoolsScreen extends ConsumerStatefulWidget {
  const VerifySchoolsScreen({super.key});
  @override
  ConsumerState<VerifySchoolsScreen> createState() => _VerifySchoolsScreenState();
}

class _VerifySchoolsScreenState extends ConsumerState<VerifySchoolsScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final schoolsState = ref.watch(adminSchoolsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Schools', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF1F5F9), const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search schools and institutions...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 16),
              
              Expanded(
                child: schoolsState.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : schoolsState.error != null
                        ? Center(child: Text(schoolsState.error!, style: TextStyle(color: Theme.of(context).colorScheme.error)))
                        : schoolsState.items.isEmpty
                            ? const Center(child: Text('No schools found'))
                            : RefreshIndicator(
                                onRefresh: () => ref.read(adminSchoolsProvider.notifier).fetchSchools(),
                                child: ListView.builder(
                                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                                  itemCount: schoolsState.items.length,
                                  itemBuilder: (context, index) {
                                    final school = schoolsState.items[index];
                                    final String status = school['status'] ?? 'pending';
                                    final bool isPending = status == 'pending';
                                    final String name = school['name'] ?? 'Unknown School';
                                    
                                    // Parse location
                                    String location = 'Unknown Location';
                                    if (school['address'] != null) {
                                      final city = school['address']['city'] ?? '';
                                      final state = school['address']['state'] ?? '';
                                      location = [city, state].where((e) => e.isNotEmpty).join(', ');
                                      if (location.isEmpty) location = 'Unknown Location';
                                    }

                                    return GlassCard(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 50, height: 50,
                                            decoration: BoxDecoration(
                                              color: isPending ? Colors.orange.withValues(alpha: 0.1) : Colors.green.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(14),
                                            ),
                                            child: Center(
                                              child: Icon(
                                                isPending ? Icons.pending_actions_rounded : Icons.verified_rounded, 
                                                color: isPending ? Colors.orange : Colors.green
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(name, style: KushaagraTheme.labelLarge(context)),
                                                const SizedBox(height: 4),
                                                Row(
                                                  children: [
                                                    const Icon(Icons.location_on_rounded, size: 12, color: Colors.grey),
                                                    const SizedBox(width: 4),
                                                    Text(location, style: KushaagraTheme.bodySmall(context)),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                          if (isPending)
                                            ElevatedButton(
                                              onPressed: () {},
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Theme.of(context).colorScheme.primary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                minimumSize: const Size(60, 32),
                                              ),
                                              child: const Text('Verify', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                            )
                                          else
                                            IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
                                        ],
                                      ),
                                    ).animate(delay: Duration(milliseconds: 50 * (index > 10 ? 10 : index))).fadeIn().slideX(begin: 0.05);
                                  },
                                ),
                              ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
