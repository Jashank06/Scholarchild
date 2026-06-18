import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/network/api_client.dart';

class AddEventSheet extends StatefulWidget {
  final String? eventId;
  final Map<String, dynamic>? existingData;
  final VoidCallback? onDone;
  const AddEventSheet({super.key, this.eventId, this.existingData, this.onDone});

  @override
  State<AddEventSheet> createState() => _AddEventSheetState();
}

class _AddEventSheetState extends State<AddEventSheet> {
  final _nameCtrl = TextEditingController(), _cityCtrl = TextEditingController(), _stateCtrl = TextEditingController();
  final _addressCtrl = TextEditingController(), _descCtrl = TextEditingController();
  final _orgNameCtrl = TextEditingController(), _orgContactCtrl = TextEditingController(), _orgWebCtrl = TextEditingController();
  final _eligibilityCtrl = TextEditingController(), _prizesCtrl = TextEditingController(), _feesCtrl = TextEditingController();
  String _category = '', _status = 'upcoming';
  bool _saving = false;
  String? _error;

  bool get isEdit => widget.eventId != null;

  @override
  void initState() {
    super.initState();
    if (widget.existingData != null) {
      _nameCtrl.text = widget.existingData!['name'] ?? '';
      _cityCtrl.text = widget.existingData!['venue']?['city'] ?? '';
      _stateCtrl.text = widget.existingData!['venue']?['state'] ?? '';
      _addressCtrl.text = widget.existingData!['venue']?['fullAddress'] ?? '';
      _descCtrl.text = widget.existingData!['description'] ?? '';
      _orgNameCtrl.text = widget.existingData!['organizer']?['name'] ?? '';
      _orgContactCtrl.text = widget.existingData!['organizer']?['contact'] ?? '';
      _orgWebCtrl.text = widget.existingData!['organizer']?['website'] ?? '';
      _eligibilityCtrl.text = widget.existingData!['eligibility'] ?? '';
      _prizesCtrl.text = widget.existingData!['prizes'] ?? '';
      _feesCtrl.text = widget.existingData!['fees']?.toString() ?? '';
      _category = widget.existingData!['category'] ?? '';
      _status = widget.existingData!['status'] ?? 'upcoming';
    }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) { setState(() => _error = 'Name required'); return; }
    if (!_category.isNotEmpty) { setState(() => _error = 'Category required'); return; }
    if (_cityCtrl.text.trim().isEmpty && _stateCtrl.text.trim().isEmpty) { setState(() => _error = 'City or State required'); return; }
    setState(() => _saving = true);
    try {
      final body = {
        'name': _nameCtrl.text.trim(),
        'category': _category,
        'status': _status,
        'description': _descCtrl.text.trim().isNotEmpty ? _descCtrl.text.trim() : null,
        'venue': {
          'city': _cityCtrl.text.trim().isNotEmpty ? _cityCtrl.text.trim() : null,
          'state': _stateCtrl.text.trim().isNotEmpty ? _stateCtrl.text.trim() : null,
          'fullAddress': _addressCtrl.text.trim().isNotEmpty ? _addressCtrl.text.trim() : null,
        },
        'organizer': {
          'name': _orgNameCtrl.text.trim().isNotEmpty ? _orgNameCtrl.text.trim() : null,
          'contact': _orgContactCtrl.text.trim().isNotEmpty ? _orgContactCtrl.text.trim() : null,
          'website': _orgWebCtrl.text.trim().isNotEmpty ? _orgWebCtrl.text.trim() : null,
        },
        'eligibility': _eligibilityCtrl.text.trim().isNotEmpty ? _eligibilityCtrl.text.trim() : null,
        'prizes': _prizesCtrl.text.trim().isNotEmpty ? _prizesCtrl.text.trim() : null,
        'fees': _feesCtrl.text.isNotEmpty ? int.tryParse(_feesCtrl.text) ?? 0 : 0,
      };
      if (isEdit) {
        await ApiClient().put('${ApiConfig.events}/${widget.eventId}', data: body);
      } else {
        await ApiClient().post(ApiConfig.events, data: body);
      }
      widget.onDone?.call();
      if (mounted) Navigator.pop(context);
    } catch (e) { setState(() => _error = e.toString()); }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, borderRadius: const BorderRadius.vertical(top: Radius.circular(KushaagraTheme.radiusXL))),
      child: Column(children: [
        const SizedBox(height: 8),
        Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
        Padding(padding: const EdgeInsets.all(16), child: Text(isEdit ? '✏️ Edit Event' : '🎪 Add Event', style: KushaagraTheme.displaySmall(context))),
        if (_error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
        Expanded(child: ListView(padding: const EdgeInsets.all(16), children: [
          _lbl('Event Name ✱'), TextField(controller: _nameCtrl, decoration: const InputDecoration(hintText: 'e.g. Chess Championship')),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Category ✱'), DropdownButtonFormField(value: _category.isNotEmpty ? _category : null, items: ['Sports', 'Cultural', 'Competition', 'Workshop', 'Other'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(), onChanged: (v) => setState(() => _category = v ?? ''))])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Status'), DropdownButtonFormField(value: _status, items: ['upcoming', 'ongoing', 'completed', 'cancelled'].map((s) => DropdownMenuItem(value: s, child: Text(s[0].toUpperCase() + s.substring(1)))).toList(), onChanged: (v) => setState(() => _status = v ?? 'upcoming'))])),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('City ✱'), TextField(controller: _cityCtrl, decoration: const InputDecoration(hintText: 'e.g. Delhi'))])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('State ✱'), TextField(controller: _stateCtrl, decoration: const InputDecoration(hintText: 'e.g. Delhi'))])),
          ]),
          const SizedBox(height: 10),
          _lbl('Venue Address'), TextField(controller: _addressCtrl, decoration: const InputDecoration(hintText: 'Full address')),
          const SizedBox(height: 10),
          _lbl('Description'), TextField(controller: _descCtrl, maxLines: 3, decoration: const InputDecoration(hintText: 'Describe the event...')),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Organizer'), TextField(controller: _orgNameCtrl)])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Contact'), TextField(controller: _orgContactCtrl)])),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Eligibility'), TextField(controller: _eligibilityCtrl, decoration: const InputDecoration(hintText: 'e.g. Grade 9-12'))])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Prizes'), TextField(controller: _prizesCtrl, decoration: const InputDecoration(hintText: 'e.g. ₹10,000'))])),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Fees (0=Free)'), TextField(controller: _feesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: '0'))])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Organizer Website'), TextField(controller: _orgWebCtrl)])),
          ]),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel'))),
            const SizedBox(width: 10),
            Expanded(child: ElevatedButton(onPressed: _saving ? null : _save, child: Text(_saving ? 'Saving...' : isEdit ? '💾 Save' : '➕ Add'))),
          ]),
        ])),
      ]),
    );
  }

  Widget _lbl(String t) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Text(t, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)));
}
