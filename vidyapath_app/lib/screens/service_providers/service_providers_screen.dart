import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/service_provider.dart';
import '../../widgets/service_provider_card.dart';
import '../../widgets/glass_widgets.dart';

class ServiceProvidersScreen extends StatefulWidget {
  const ServiceProvidersScreen({super.key});
  @override
  State<ServiceProvidersScreen> createState() => _ServiceProvidersScreenState();
}

class _ServiceProvidersScreenState extends State<ServiceProvidersScreen> {
  List<ServiceProviderModel> _items = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = <String, dynamic>{};
      if (_searchCtrl.text.isNotEmpty) p['search'] = _searchCtrl.text;
      final res = await ApiClient().get(ApiConfig.serviceProviders, queryParams: p);
      _items = (res.data['data'] as List?)?.map((j) => ServiceProviderModel.fromJson(j)).toList() ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _open(ServiceProviderModel p) async {
    await ApiClient().post('${ApiConfig.serviceProviders}/${p.id}/click');
    if (p.link != null) launchUrl(Uri.parse(p.link!));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Service Providers')),
      body: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 8), child: GlassCard(padding: EdgeInsets.zero, child: TextField(controller: _searchCtrl, onChanged: (_) => _load(), decoration: const InputDecoration(hintText: 'Search...', prefixIcon: Icon(Icons.search), border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14))))).animate().fadeIn(),
        Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : _items.isEmpty ? const Center(child: Text('No providers')) : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _items.length, itemBuilder: (_, i) => Padding(padding: const EdgeInsets.only(bottom: 10), child: ServiceProviderCard(provider: _items[i], onTap: () => _open(_items[i]), index: i)))),
      ]),
    );
  }
}
