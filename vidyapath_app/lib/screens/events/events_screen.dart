import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/event.dart';
import '../../widgets/entity_card.dart';
import '../../widgets/glass_widgets.dart';
import '../../widgets/events/add_event_sheet.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});
  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  List<EventModel> _items = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();
  String _category = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = <String, dynamic>{};
      if (_searchCtrl.text.isNotEmpty) p['search'] = _searchCtrl.text;
      if (_category.isNotEmpty) p['category'] = _category;
      final res = await ApiClient().get(ApiConfig.events, queryParams: p);
      _items = (res.data['data'] as List?)?.map((j) => EventModel.fromJson(j)).toList() ?? [];
    } catch (e) {
      print('❌ Events load error: $e');
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final acc = const Color(0xFFF5576C);
    return Scaffold(
      appBar: AppBar(title: const Text('Events')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (_) => AddEventSheet(onDone: _load)),
        icon: const Icon(Icons.add), label: const Text('Add'), backgroundColor: acc,
      ).animate().scale(duration: 300.ms),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 8), child: GlassCard(padding: EdgeInsets.zero, child: TextField(controller: _searchCtrl, onChanged: (_) => _load(), decoration: const InputDecoration(hintText: 'Search events...', prefixIcon: Icon(Icons.search), border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14))))).animate().fadeIn(),
        Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : _items.isEmpty ? const Center(child: Text('No events')) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _items.length, itemBuilder: (_, i) {
          final ev = _items[i];
          return Padding(padding: const EdgeInsets.only(bottom: 10), child: EntityCard(
            name: ev.name, location: '${ev.city}, ${ev.state}',
            badges: [if (ev.category != null) EntityBadge(label: ev.category!, color: acc, bgColor: acc.withValues(alpha: 0.1))],
            detailRows: [if (ev.eventDate != null) Text('${ev.eventDate!.day}/${ev.eventDate!.month}/${ev.eventDate!.year}', style: const TextStyle(fontSize: 12))],
            rating: ev.overallRating, reviewCount: ev.totalReviews,
            gradient: const LinearGradient(colors: [Color(0xFFF093FB), Color(0xFFF5576C)]),
            icon: const Icon(Icons.event, color: Colors.white, size: 24), index: i,
          ));
        })),
      ]),
    );
  }
}
