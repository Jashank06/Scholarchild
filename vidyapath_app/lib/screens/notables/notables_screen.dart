import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/notable.dart';
import '../../widgets/notable_card.dart';

class NotablesScreen extends StatefulWidget {
  const NotablesScreen({super.key});
  @override
  State<NotablesScreen> createState() => _NotablesScreenState();
}

class _NotablesScreenState extends State<NotablesScreen> {
  List<NotableModel> _featured = [], _items = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get(ApiConfig.notables);
      final all = (res.data['data'] as List?)?.map((j) => NotableModel.fromJson(j)).toList() ?? [];
      _featured = all.where((n) => n.featured).toList();
      _items = all.where((n) => !n.featured).toList();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _open(NotableModel n) async {
    await ApiClient().post('${ApiConfig.notables}/${n.id}/click');
    if (n.link != null) launchUrl(Uri.parse(n.link!));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notables')),
      body: _loading ? const Center(child: CircularProgressIndicator()) : CustomScrollView(slivers: [
        if (_featured.isNotEmpty) SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Featured', style: KushaagraTheme.displaySmall(context)).animate().fadeIn(),
          const SizedBox(height: 12),
          SizedBox(height: 220, child: ListView.builder(scrollDirection: Axis.horizontal, itemCount: _featured.length, itemBuilder: (_, i) => SizedBox(width: 300, child: Padding(padding: const EdgeInsets.only(right: 12), child: NotableCard(notable: _featured[i], onTap: () => _open(_featured[i]), index: i))))),
        ]))),
        SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList(delegate: SliverChildBuilderDelegate((_, i) => Padding(padding: const EdgeInsets.only(bottom: 12), child: NotableCard(notable: _items[i], onTap: () => _open(_items[i]), index: i)), childCount: _items.length))),
      ]),
    );
  }
}
