import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../config/theme.dart';
import '../../../core/network/api_client.dart';
import '../../../models/review.dart';
import '../../../widgets/star_rating.dart';

class SchoolReviewSheet extends StatefulWidget {
  final String schoolId;
  final String schoolName;
  final ReviewModel? existingReview;
  final VoidCallback? onDone;
  const SchoolReviewSheet({super.key, required this.schoolId, required this.schoolName, this.existingReview, this.onDone});

  @override
  State<SchoolReviewSheet> createState() => _SchoolReviewSheetState();
}

class _SchoolReviewSheetState extends State<SchoolReviewSheet> {
  int _step = 1;
  Map<String, int> _ratings = {};
  final _titleCtrl = TextEditingController();
  final _commentCtrl = TextEditingController();
  final List<String> _pros = [], _cons = [];
  final _prosCtrl = TextEditingController(), _consCtrl = TextEditingController();
  bool _saving = false;
  String? _error;

  static const _cats = [
    {'key': 'academics', 'label': 'Academics', 'emoji': '📚'},
    {'key': 'infrastructure', 'label': 'Infrastructure', 'emoji': '🏗️'},
    {'key': 'faculty', 'label': 'Faculty', 'emoji': '👨‍🏫'},
    {'key': 'extracurricular', 'label': 'Extracurricular', 'emoji': '🎨'},
    {'key': 'safety', 'label': 'Safety', 'emoji': '🛡️'},
    {'key': 'communication', 'label': 'Communication', 'emoji': '📢'},
    {'key': 'valueForMoney', 'label': 'Value for Money', 'emoji': '💰'},
  ];

  bool get _allRated => _cats.every((c) => (_ratings[c['key']] ?? 0) >= 1);

  Future<void> _submit() async {
    if (!_allRated) { setState(() => _error = 'Please rate all categories'); return; }
    setState(() => _saving = true);
    try {
      final body = {
        'ratings': _ratings,
        'title': _titleCtrl.text.trim(),
        'comment': _commentCtrl.text.trim(),
        'pros': _pros,
        'cons': _cons,
      };
      if (widget.existingReview != null) {
        await ApiClient().put('${ApiConfig.schools}/${widget.schoolId}/review', data: body);
      } else {
        await ApiClient().post('${ApiConfig.schools}/${widget.schoolId}/review', data: body);
      }
      widget.onDone?.call();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(KushaagraTheme.radiusXL)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text('⭐ Rate ${widget.schoolName}', style: KushaagraTheme.displaySmall(context)),
          ),
          if (_error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
          Expanded(
            child: _step == 1 ? _ratingsStep() : _step == 2 ? _textStep() : _confirmStep(),
          ),
        ],
      ),
    );
  }

  Widget _ratingsStep() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ..._cats.map((c) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(14)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${c['emoji']} ${c['label']}', style: KushaagraTheme.labelLarge(context)),
                Row(children: List.generate(5, (i) => GestureDetector(
                  onTap: () => setState(() => _ratings[c['key']!] = i + 1),
                  child: Container(
                    width: 34, height: 34, margin: const EdgeInsets.only(left: 4),
                    decoration: BoxDecoration(
                      color: i < (_ratings[c['key']] ?? 0) ? KushaagraTheme.accentGold : Colors.grey.shade200,
                      shape: BoxShape.circle,
                    ),
                    child: Center(child: Text('${i + 1}', style: TextStyle(fontWeight: FontWeight.w700, color: i < (_ratings[c['key']] ?? 0) ? Colors.white : Colors.grey)))),
                ))),
              ],
            ),
          ),
        )),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _allRated ? () => setState(() => _step = 2) : null,
            style: ElevatedButton.styleFrom(backgroundColor: _allRated ? KushaagraTheme.primaryBlue : Colors.grey.shade300),
            child: const Text('Continue →'),
          ),
        ),
      ],
    );
  }

  Widget _textStep() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(controller: _titleCtrl, decoration: const InputDecoration(hintText: 'Title', labelText: 'Summarize your review')),
        const SizedBox(height: 12),
        TextField(controller: _commentCtrl, maxLines: 4, decoration: const InputDecoration(hintText: 'Your review', labelText: 'Share your experience')),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextField(controller: _prosCtrl, decoration: const InputDecoration(hintText: 'Pros'))),
          const SizedBox(width: 8),
          IconButton.filled(onPressed: () { if (_prosCtrl.text.isNotEmpty) { setState(() { _pros.add(_prosCtrl.text); _prosCtrl.clear(); }); } }, icon: const Icon(Icons.add)),
        ]),
        if (_pros.isNotEmpty) Wrap(spacing: 6, children: _pros.map((p) => Chip(label: Text(p), onDeleted: () { setState(() => _pros.remove(p)); })).toList()),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: TextField(controller: _consCtrl, decoration: const InputDecoration(hintText: 'Cons'))),
          const SizedBox(width: 8),
          IconButton.filled(onPressed: () { if (_consCtrl.text.isNotEmpty) { setState(() { _cons.add(_consCtrl.text); _consCtrl.clear(); }); } }, icon: const Icon(Icons.add)),
        ]),
        if (_cons.isNotEmpty) Wrap(spacing: 6, children: _cons.map((c) => Chip(label: Text(c), onDeleted: () { setState(() => _cons.remove(c)); })).toList()),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: OutlinedButton(onPressed: () => setState(() => _step = 1), child: const Text('← Back'))),
          const SizedBox(width: 10),
          Expanded(child: ElevatedButton(onPressed: () => setState(() => _step = 3), child: const Text('Review →'))),
        ]),
      ],
    );
  }

  Widget _confirmStep() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(16)),
          child: Column(
            children: [
              ..._cats.map((c) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('${c['emoji']} ${c['label']}'),
                  StarRating(rating: (_ratings[c['key']] ?? 0).toDouble(), size: 16),
                ]),
              )),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: OutlinedButton(onPressed: () => setState(() => _step = 2), child: const Text('← Back'))),
          const SizedBox(width: 10),
          Expanded(child: ElevatedButton(onPressed: _saving ? null : _submit, child: Text(_saving ? 'Saving...' : '✅ Submit'))),
        ]),
      ],
    );
  }
}
