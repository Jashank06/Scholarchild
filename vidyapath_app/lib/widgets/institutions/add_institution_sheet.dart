import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/network/api_client.dart';

class AddInstitutionSheet extends StatefulWidget {
  final String? institutionId;
  final Map<String, dynamic>? existingData;
  final VoidCallback? onDone;
  const AddInstitutionSheet({super.key, this.institutionId, this.existingData, this.onDone});

  @override
  State<AddInstitutionSheet> createState() => _AddInstitutionSheetState();
}

class _AddInstitutionSheetState extends State<AddInstitutionSheet> {
  final _nameCtrl = TextEditingController(), _cityCtrl = TextEditingController(), _stateCtrl = TextEditingController();
  final _districtCtrl = TextEditingController(), _pincodeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController(), _phoneCtrl = TextEditingController(), _websiteCtrl = TextEditingController();
  final _coursesCtrl = TextEditingController(), _affiliationCtrl = TextEditingController();
  String _type = '';
  bool _saving = false;
  String? _error;

  bool get isEdit => widget.institutionId != null;

  @override
  void initState() {
    super.initState();
    if (widget.existingData != null) {
      _nameCtrl.text = widget.existingData!['name'] ?? '';
      _cityCtrl.text = widget.existingData!['address']?['city'] ?? '';
      _stateCtrl.text = widget.existingData!['address']?['state'] ?? '';
      _districtCtrl.text = widget.existingData!['address']?['district'] ?? '';
      _emailCtrl.text = widget.existingData!['contact']?['email'] ?? '';
      _phoneCtrl.text = widget.existingData!['contact']?['phone'] ?? '';
      _websiteCtrl.text = widget.existingData!['contact']?['website'] ?? '';
      _type = widget.existingData!['type'] ?? '';
      _affiliationCtrl.text = widget.existingData!['affiliation'] ?? '';
      _coursesCtrl.text = (widget.existingData!['courses'] as List?)?.join(', ') ?? '';
    }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) { setState(() => _error = 'Name required'); return; }
    if (!_type.isNotEmpty) { setState(() => _error = 'Type required'); return; }
    if (_cityCtrl.text.trim().isEmpty && _stateCtrl.text.trim().isEmpty) { setState(() => _error = 'City or State required'); return; }
    setState(() => _saving = true);
    try {
      final body = {
        'name': _nameCtrl.text.trim(),
        'type': _type,
        'affiliation': _affiliationCtrl.text.trim().isNotEmpty ? _affiliationCtrl.text.trim() : null,
        'address': {
          'city': _cityCtrl.text.trim().isNotEmpty ? _cityCtrl.text.trim() : null,
          'state': _stateCtrl.text.trim().isNotEmpty ? _stateCtrl.text.trim() : null,
          'district': _districtCtrl.text.trim().isNotEmpty ? _districtCtrl.text.trim() : null,
          'pincode': _pincodeCtrl.text.trim().isNotEmpty ? _pincodeCtrl.text.trim() : null,
        },
        'contact': {
          'email': _emailCtrl.text.trim().isNotEmpty ? _emailCtrl.text.trim() : null,
          'phone': _phoneCtrl.text.trim().isNotEmpty ? _phoneCtrl.text.trim() : null,
          'website': _websiteCtrl.text.trim().isNotEmpty ? _websiteCtrl.text.trim() : null,
        },
        'courses': _coursesCtrl.text.isNotEmpty ? _coursesCtrl.text.split(',').map((c) => c.trim()).where((c) => c.isNotEmpty).toList() : [],
      };
      if (isEdit) {
        await ApiClient().put('${ApiConfig.institutions}/${widget.institutionId}', data: body);
      } else {
        await ApiClient().post(ApiConfig.institutions, data: body);
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
        Padding(padding: const EdgeInsets.all(16), child: Text(isEdit ? '✏️ Edit Institution' : '🎓 Add Institution', style: KushaagraTheme.displaySmall(context))),
        if (_error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
        Expanded(child: ListView(padding: const EdgeInsets.all(16), children: [
          _lbl('Name ✱'), TextField(controller: _nameCtrl, decoration: const InputDecoration(hintText: 'e.g. IIT Bombay')),
          const SizedBox(height: 12),
          _lbl('Type ✱'), DropdownButtonFormField(value: _type.isNotEmpty ? _type : null, items: ['ITI', 'Diploma', 'College', 'University'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(), onChanged: (v) => setState(() => _type = v ?? '')),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('City ✱'), TextField(controller: _cityCtrl, decoration: const InputDecoration(hintText: 'e.g. Mumbai'))])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('State ✱'), TextField(controller: _stateCtrl, decoration: const InputDecoration(hintText: 'e.g. Maharashtra'))])),
          ]),
          const SizedBox(height: 10),
          _lbl('Affiliation'), TextField(controller: _affiliationCtrl, decoration: const InputDecoration(hintText: 'e.g. AICTE, UGC')),
          const SizedBox(height: 10),
          _lbl('Courses (comma separated)'), TextField(controller: _coursesCtrl, decoration: const InputDecoration(hintText: 'e.g. B.Tech, M.Tech')),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('District'), TextField(controller: _districtCtrl)])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Pincode'), TextField(controller: _pincodeCtrl)])),
          ]),
          const SizedBox(height: 10),
          _lbl('Email'), TextField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Phone'), TextField(controller: _phoneCtrl)])),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_lbl('Website'), TextField(controller: _websiteCtrl)])),
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
