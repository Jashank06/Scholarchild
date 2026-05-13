import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../config/theme.dart';
import '../../../../widgets/glass_widgets.dart';
import '../../../../providers/role_providers.dart';

class SupportTicketsScreen extends ConsumerStatefulWidget {
  const SupportTicketsScreen({super.key});
  @override
  ConsumerState<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends ConsumerState<SupportTicketsScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ticketsState = ref.watch(adminTicketsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Tickets', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.filter_list_rounded), onPressed: () {}),
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
                : [const Color(0xFFF1F5F9), const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                    height: 120,
                    width: double.infinity,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset('assets/images/support_tickets.png', fit: BoxFit.cover),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                              colors: [Colors.black.withValues(alpha: 0.8), Colors.transparent],
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text('Support Center', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Resolve issues quickly', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 50.ms),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search tickets...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 16),
              
              Expanded(
                child: ticketsState.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ticketsState.error != null
                        ? Center(child: Text(ticketsState.error!, style: TextStyle(color: Theme.of(context).colorScheme.error)))
                        : ticketsState.items.isEmpty
                            ? const Center(child: Text('No tickets found'))
                            : RefreshIndicator(
                                onRefresh: () => ref.read(adminTicketsProvider.notifier).fetchTickets(),
                                child: ListView.builder(
                                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                                  itemCount: ticketsState.items.length,
                                  itemBuilder: (context, index) {
                                    final ticket = ticketsState.items[index];
                                    final String status = ticket['status'] ?? 'Open';
                                    final bool isOpen = status.toLowerCase() != 'closed' && status.toLowerCase() != 'resolved';
                                    final String priority = ticket['priority'] ?? 'Medium';
                                    final String type = ticket['type'] ?? 'Query';

                                    // Parse User
                                    String userName = 'Unknown User';
                                    if (ticket['userId'] != null) {
                                      final user = ticket['userId'];
                                      if (user is Map) {
                                        if (user['profile'] != null) {
                                          userName = '${user['profile']['firstName'] ?? ''} ${user['profile']['lastName'] ?? ''}'.trim();
                                        } else {
                                          userName = user['email'] ?? 'Unknown User';
                                        }
                                      } else if (user is String) {
                                        userName = 'User $user';
                                      }
                                    }

                                    // Parse Date
                                    String dateStr = 'Unknown Date';
                                    if (ticket['createdAt'] != null) {
                                      try {
                                        final date = DateTime.parse(ticket['createdAt']);
                                        final now = DateTime.now();
                                        if (date.year == now.year && date.month == now.month && date.day == now.day) {
                                          dateStr = 'Today';
                                        } else if (date.year == now.year && date.month == now.month && date.day == now.day - 1) {
                                          dateStr = 'Yesterday';
                                        } else {
                                          dateStr = '${date.day}/${date.month}/${date.year}';
                                        }
                                      } catch (e) {
                                        dateStr = 'Unknown Date';
                                      }
                                    }

                                    Color priorityColor = Colors.green;
                                    if (priority.toLowerCase() == 'high' || priority.toLowerCase() == 'urgent') priorityColor = Colors.red;
                                    if (priority.toLowerCase() == 'medium') priorityColor = Colors.orange;

                                    return GlassCard(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text('Ticket #${(ticket['_id'] ?? '').toString().length > 6 ? (ticket['_id'] ?? '').toString().substring(0, 6) : 1000 + index}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 12)),
                                              Text(dateStr, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(ticket['subject'] ?? 'No Subject', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              const Icon(Icons.person_outline_rounded, size: 14, color: Colors.grey),
                                              const SizedBox(width: 4),
                                              Text(userName, style: KushaagraTheme.bodySmall(context)),
                                            ],
                                          ),
                                          const SizedBox(height: 12),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Row(
                                                children: [
                                                  _buildBadge(type, Colors.blue),
                                                  const SizedBox(width: 8),
                                                  _buildBadge(priority, priorityColor as MaterialColor),
                                                ],
                                              ),
                                              _buildBadge(status, isOpen ? Colors.orange : Colors.grey),
                                            ],
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
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: color[700] ?? color),
      ),
    );
  }
}
