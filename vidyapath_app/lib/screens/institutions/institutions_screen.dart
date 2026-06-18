import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/institution.dart';
import '../../widgets/entity_card.dart';
import '../../widgets/glass_widgets.dart';
import '../../widgets/institutions/add_institution_sheet.dart';

class InstitutionsScreen extends StatefulWidget {
  const InstitutionsScreen({super.key});
  @override
  State<InstitutionsScreen> createState() => _InstitutionsScreenState();
}

class _InstitutionsScreenState extends State<InstitutionsScreen> {
  List<InstitutionModel> _items = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();
  String _type = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = <String, dynamic>{};
      if (_searchCtrl.text.isNotEmpty) p['search'] = _searchCtrl.text;
      if (_type.isNotEmpty) p['type'] = _type;
      final res = await ApiClient().get(ApiConfig.institutions, queryParams: p);
      _items = (res.data['data'] as List?)?.map((j) => InstitutionModel.fromJson(j)).toList() ?? [];
    } catch (e) {
      print('❌ Institutions load error: $e');
    }
    if (mounted) setState(() => _loading = false);
  }

  void _openDetail(String id) => Navigator.push(context, MaterialPageRoute(
    builder: (_) => _InstitutionDetailStub(id: id),
  ));

  Color get _accent => const Color(0xFF0083B0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Institutions 🎓')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (_) => AddInstitutionSheet(onDone: _load)),
        icon: const Icon(Icons.add), label: const Text('Add'), backgroundColor: _accent,
      ).animate().scale(duration: 300.ms),
      body: Column(children: [
        _searchBar().animate().fadeIn(),
        _typeChips(),
        _bodyList(),
      ]),
    );
  }

  Widget _searchBar() => Padding(
    padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
    child: GlassCard(padding: EdgeInsets.zero, child: TextField(
      controller: _searchCtrl, onChanged: (_) => _load(),
      decoration: const InputDecoration(hintText: 'Search...', prefixIcon: Icon(Icons.search), border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
    )),
  );

  Widget _typeChips() => SingleChildScrollView(
    scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 16),
    child: Row(children: ['', 'ITI', 'Diploma', 'College', 'University'].map((t) => Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(label: Text(t.isEmpty ? 'All' : t), selected: _type == t, onSelected: (_) { setState(() => _type = t); _load(); }),
    )).toList()),
  );

  Widget _bodyList() => Expanded(child: _loading
    ? const Center(child: CircularProgressIndicator())
    : _items.isEmpty
      ? const Center(child: Text('No institutions found'))
      : ListView.builder(
          padding: const EdgeInsets.all(16), itemCount: _items.length,
          itemBuilder: (_, i) {
            final inst = _items[i];
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: EntityCard(
                name: inst.name, location: '${inst.city}, ${inst.state}',
                badges: [if (inst.type != null) EntityBadge(label: inst.type!, color: _accent, bgColor: _accent.withValues(alpha: 0.1))],
                rating: inst.overallRating, reviewCount: inst.totalReviews, isVerified: inst.isVerified,
                gradient: const LinearGradient(colors: [Color(0xFF00B4DB), Color(0xFF0083B0)]),
                icon: const Icon(Icons.account_balance, color: Colors.white, size: 24), index: i,
                onTap: () => _openDetail(inst.id),
              ),
            );
          },
        ),
  );
}

class _InstitutionDetailStub extends StatelessWidget {
  final String id;
  const _InstitutionDetailStub({required this.id});
  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Institution Detail')), body: const Center(child: Text('Detail page coming soon')));
  }
}
