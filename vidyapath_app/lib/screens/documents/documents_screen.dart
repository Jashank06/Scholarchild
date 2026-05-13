import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/application.dart';
import '../../widgets/glass_widgets.dart';

class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});
  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  List<DocumentModel> _documents = [];
  bool _loading = true;
  bool _uploading = false;

  final _docTypes = [
    ('aadhaar', 'Aadhaar Card', Icons.credit_card),
    ('marksheet', 'Marksheet', Icons.school),
    ('income_cert', 'Income Certificate', Icons.attach_money),
    ('caste_cert', 'Caste Certificate', Icons.document_scanner),
    ('domicile', 'Domicile', Icons.home),
    ('photo', 'Passport Photo', Icons.photo_camera),
    ('birth_cert', 'Birth Certificate', Icons.cake),
    ('bank_passbook', 'Bank Passbook', Icons.account_balance),
    ('other', 'Other', Icons.description),
  ];

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get(ApiConfig.documents);
      final list = (res.data['data'] as List).map((j) => DocumentModel.fromJson(j)).toList();
      if (mounted) setState(() { _documents = list; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _uploadDocument(String type) async {
    // Show source picker
    final source = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _sourcePickerSheet(),
    );
    if (source == null) return;

    try {
      String? filePath;
      String? fileName;

      if (source == 'camera') {
        final img = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 85);
        if (img == null) return;
        filePath = img.path;
        fileName = img.name;
      } else if (source == 'gallery') {
        final img = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
        if (img == null) return;
        filePath = img.path;
        fileName = img.name;
      } else {
        final result = await FilePicker.pickFiles(
          type: FileType.custom,
          allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
        );
        if (result == null || result.files.isEmpty) return;
        filePath = result.files.first.path;
        fileName = result.files.first.name;
      }

      if (filePath == null) return;

      setState(() => _uploading = true);

      final formData = FormData.fromMap({
        'document': await MultipartFile.fromFile(filePath, filename: fileName),
        'type': type,
        'name': fileName ?? type,
      });

      await ApiClient().uploadFile(ApiConfig.uploadDocument, formData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('📄 Document uploaded successfully!'),
            backgroundColor: KushaagraTheme.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        _loadDocuments();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: ${e.toString().split('\n').first}'),
            backgroundColor: KushaagraTheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _deleteDocument(DocumentModel doc) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Document?'),
        content: Text('Are you sure you want to delete "${doc.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: KushaagraTheme.error)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await ApiClient().delete(ApiConfig.deleteDocument(doc.id));
      setState(() => _documents.removeWhere((d) => d.id == doc.id));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Document deleted'), behavior: SnackBarBehavior.floating),
        );
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Group documents by type
    final grouped = <String, List<DocumentModel>>{};
    for (final doc in _documents) {
      grouped.putIfAbsent(doc.type, () => []).add(doc);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Document Vault'),
        actions: [
          if (_documents.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: KushaagraTheme.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(KushaagraTheme.radiusFull),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified, size: 14, color: KushaagraTheme.success),
                      const SizedBox(width: 4),
                      Text(
                        '${_documents.where((d) => d.verified).length}/${_documents.length} verified',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: KushaagraTheme.success),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F172A), const Color(0xFF020617)]
                : [const Color(0xFFF8FAFC), const Color(0xFFEFF6FF)],
          ),
        ),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _uploading
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 16),
                        Text('Uploading document...', style: KushaagraTheme.bodyMedium(context)),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Upload prompt card
                        GlassCard(
                          onTap: _showUploadSheet,
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).colorScheme.primary.withValues(alpha: 0.06),
                              Colors.transparent,
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48, height: 48,
                                decoration: BoxDecoration(
                                  gradient: KushaagraTheme.primaryGradient,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Icon(Icons.cloud_upload_outlined, color: Colors.white, size: 24),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Upload Document', style: KushaagraTheme.labelLarge(context)),
                                    const SizedBox(height: 2),
                                    Text('PDF, JPG, PNG • Max 5MB', style: KushaagraTheme.bodySmall(context)),
                                  ],
                                ),
                              ),
                              Icon(Icons.add_circle, color: Theme.of(context).colorScheme.primary, size: 28),
                            ],
                          ),
                        ).animate().fadeIn().slideY(begin: 0.1),

                        const SizedBox(height: 24),

                        if (_documents.isEmpty)
                          const EmptyState(
                            icon: Icons.folder_open_rounded,
                            title: 'No Documents Yet',
                            subtitle: 'Upload your certificates, marksheets & KYC documents to apply faster',
                          )
                        else ...[
                          // Document type sections
                          for (final entry in grouped.entries) ...[
                            _sectionHeader(entry.key, entry.value.length),
                            const SizedBox(height: 8),
                            ...entry.value.asMap().entries.map((e) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _documentCard(e.value, e.key),
                            )),
                            const SizedBox(height: 16),
                          ],
                        ],
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _sectionHeader(String type, int count) {
    final typeInfo = _docTypes.firstWhere((t) => t.$1 == type, orElse: () => ('other', 'Other', Icons.description));

    return Row(
      children: [
        Icon(typeInfo.$3, size: 18, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 8),
        Text(typeInfo.$2, style: KushaagraTheme.labelLarge(context)),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text('$count', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.primary)),
        ),
      ],
    );
  }

  Widget _documentCard(DocumentModel doc, int index) {
    final isImage = doc.mimeType?.startsWith('image') ?? false;

    return GlassCard(
      child: Row(
        children: [
          // File icon
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: isImage
                  ? KushaagraTheme.accentGold.withValues(alpha: 0.1)
                  : KushaagraTheme.primaryBlue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isImage ? Icons.image : Icons.picture_as_pdf,
              color: isImage ? KushaagraTheme.accentGold : KushaagraTheme.primaryBlue,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doc.name, style: KushaagraTheme.labelLarge(context), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(doc.typeLabel, style: KushaagraTheme.bodySmall(context)),
                    if (doc.size != null) ...[
                      const SizedBox(width: 8),
                      Text('${(doc.size! / 1024).toStringAsFixed(0)} KB',
                        style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Verified badge
          if (doc.verified)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: KushaagraTheme.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified, size: 14, color: KushaagraTheme.success),
                  SizedBox(width: 3),
                  Text('Verified', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: KushaagraTheme.success)),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: KushaagraTheme.accentGold.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('Pending', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: KushaagraTheme.accentGold)),
            ),

          const SizedBox(width: 4),

          // Delete
          IconButton(
            onPressed: () => _deleteDocument(doc),
            icon: Icon(Icons.delete_outline, size: 20, color: Theme.of(context).colorScheme.onSurfaceVariant),
          ),
        ],
      ),
    ).animate(delay: Duration(milliseconds: 50 * index)).fadeIn().slideX(begin: 0.05);
  }

  void _showUploadSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _uploadTypeSheet(),
    );
  }

  Widget _uploadTypeSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      decoration: BoxDecoration(
        color: isDark ? KushaagraTheme.surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Text('Select Document Type', style: KushaagraTheme.titleLarge(context)),
          const SizedBox(height: 16),
          ..._docTypes.map((type) => ListTile(
            leading: Icon(type.$3, color: Theme.of(context).colorScheme.primary),
            title: Text(type.$2),
            trailing: const Icon(Icons.chevron_right, size: 20),
            onTap: () {
              Navigator.pop(context);
              _uploadDocument(type.$1);
            },
          )),
        ],
      ),
    );
  }

  Widget _sourcePickerSheet() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      decoration: BoxDecoration(
        color: isDark ? KushaagraTheme.surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Text('Upload From', style: KushaagraTheme.titleLarge(context)),
          const SizedBox(height: 16),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.camera_alt, color: KushaagraTheme.primaryBlue),
            ),
            title: const Text('Camera'),
            subtitle: const Text('Take a photo'),
            onTap: () => Navigator.pop(context, 'camera'),
          ),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: KushaagraTheme.accentGold.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.photo_library, color: KushaagraTheme.accentGold),
            ),
            title: const Text('Gallery'),
            subtitle: const Text('Choose an image'),
            onTap: () => Navigator.pop(context, 'gallery'),
          ),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: KushaagraTheme.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.file_present, color: KushaagraTheme.success),
            ),
            title: const Text('Files'),
            subtitle: const Text('Browse PDF / Images'),
            onTap: () => Navigator.pop(context, 'file'),
          ),
        ],
      ),
    );
  }
}
