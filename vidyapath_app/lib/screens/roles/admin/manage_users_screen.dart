import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../config/theme.dart';
import '../../../../widgets/glass_widgets.dart';
import '../../../../providers/role_providers.dart';

class ManageUsersScreen extends ConsumerStatefulWidget {
  const ManageUsersScreen({super.key});
  @override
  ConsumerState<ManageUsersScreen> createState() => _ManageUsersScreenState();
}

class _ManageUsersScreenState extends ConsumerState<ManageUsersScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final usersState = ref.watch(adminUsersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Users', style: TextStyle(fontWeight: FontWeight.w700)),
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
                    hintText: 'Search users by name, email, or role...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 16),
              
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Text('All Users', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text('${usersState.items.length} Total', style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary
                      )),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 200.ms),
              const SizedBox(height: 16),

              Expanded(
                child: usersState.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : usersState.error != null
                        ? Center(child: Text(usersState.error!, style: TextStyle(color: Theme.of(context).colorScheme.error)))
                        : usersState.items.isEmpty
                            ? const Center(child: Text('No users found'))
                            : RefreshIndicator(
                                onRefresh: () => ref.read(adminUsersProvider.notifier).fetchUsers(),
                                child: ListView.builder(
                                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                                  itemCount: usersState.items.length,
                                  itemBuilder: (context, index) {
                                    final user = usersState.items[index];
                                    final String role = user['role'] ?? 'Unknown';
                                    final isInstitution = role == 'school' || role == 'university';
                                    
                                    String name = 'Unknown';
                                    if (isInstitution) {
                                      name = user['institutionProfile']?['institutionName'] ?? 'Unknown Inst';
                                    } else {
                                      final first = user['profile']?['firstName'] ?? '';
                                      final last = user['profile']?['lastName'] ?? '';
                                      name = '$first $last'.trim();
                                      if (name.isEmpty) name = 'User';
                                    }

                                    final email = user['email'] ?? '';
                                    final status = user['isActive'] == false ? 'Inactive' : 'Active';
                                    final isPending = status == 'Inactive';

                                    return GlassCard(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          CircleAvatar(
                                            radius: 24,
                                            backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                                            child: Text(
                                              name.isNotEmpty ? name[0].toUpperCase() : '?',
                                              style: TextStyle(
                                                color: Theme.of(context).colorScheme.primary,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(name, style: KushaagraTheme.labelLarge(context)),
                                                const SizedBox(height: 2),
                                                Text(email, style: KushaagraTheme.bodySmall(context)),
                                                const SizedBox(height: 6),
                                                Row(
                                                  children: [
                                                    _buildBadge(role, Colors.blue),
                                                    const SizedBox(width: 8),
                                                    _buildBadge(status, isPending ? Colors.orange : Colors.green),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.more_vert_rounded),
                                            onPressed: () {},
                                          ),
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

  Widget _buildBadge(String text, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        border: Border.all(color: color.withValues(alpha: 0.5)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: color[700]),
      ),
    );
  }
}
