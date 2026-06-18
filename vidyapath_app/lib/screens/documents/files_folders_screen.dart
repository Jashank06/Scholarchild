import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../config/theme.dart';
import '../../core/network/api_client.dart';
import '../../models/file_node.dart';

class FilesFoldersScreen extends StatefulWidget {
  const FilesFoldersScreen({super.key});
  @override
  State<FilesFoldersScreen> createState() => _FilesFoldersScreenState();
}

class _FilesFoldersScreenState extends State<FilesFoldersScreen> {
  List<FileNode> _items = [];
  bool _loading = true;
  String? _currentParentId; // null = root
  final List<_Breadcrumb> _breadcrumbs = [_Breadcrumb(label: '📂 Home', id: null)];
  final _newFolderCtrl = TextEditingController();
  bool _creatingFolder = false;
  bool _uploading = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final p = <String, dynamic>{};
      if (_currentParentId != null) p['parentId'] = _currentParentId;
      final res = await ApiClient().get(ApiConfig.fileNodes, queryParams: p);
      _items = (res.data['data'] as List?)?.map((j) => FileNode.fromJson(j)).toList() ?? [];
    } catch (e) { print('❌ FileNodes load error: $e'); }
    if (mounted) setState(() => _loading = false);
  }

  void _navigateTo(String? parentId, String name) {
    setState(() {
      _currentParentId = parentId;
      _breadcrumbs.add(_Breadcrumb(label: name, id: parentId));
    });
    _load();
  }

  void _navigateToBreadcrumb(int index) {
    setState(() {
      _currentParentId = _breadcrumbs[index].id;
      _breadcrumbs.removeRange(index + 1, _breadcrumbs.length);
    });
    _load();
  }

  Future<void> _createFolder() async {
    final name = _newFolderCtrl.text.trim();
    if (name.isEmpty) return;
    setState(() => _creatingFolder = true);
    try {
      await ApiClient().post(ApiConfig.createFolder, data: {'name': name, if (_currentParentId != null) 'parentId': _currentParentId});
      _newFolderCtrl.clear();
      _load();
    } catch (_) {}
    if (mounted) setState(() => _creatingFolder = false);
  }

  Future<void> _uploadFile() async {
    final source = await showModalBottomSheet<String>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(leading: const Icon(Icons.photo_library), title: const Text('Gallery'), onTap: () => Navigator.pop(context, 'gallery')),
          ListTile(leading: const Icon(Icons.camera_alt), title: const Text('Camera'), onTap: () => Navigator.pop(context, 'camera')),
        ]),
      ),
    );
    if (source == null) return;

    final picker = ImagePicker();
    final img = source == 'camera'
        ? await picker.pickImage(source: ImageSource.camera, maxWidth: 1920)
        : await picker.pickImage(source: ImageSource.gallery, maxWidth: 1920);
    if (img == null) return;
    await _doUpload(File(img.path), img.name);
  }

  Future<void> _doUpload(File file, String originalName) async {
    setState(() => _uploading = true);
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: originalName),
        if (_currentParentId != null) 'parentId': _currentParentId,
      });
      await ApiClient().uploadFileNode(formData);
      _load();
    } catch (_) {}
    if (mounted) setState(() => _uploading = false);
  }

  Future<void> _deleteItem(FileNode node) async {
    final confirm = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      title: Text('Delete ${node.isFolder ? 'Folder' : 'File'}?'),
      content: Text('${node.name} will be moved to trash.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
      ],
    ));
    if (confirm != true) return;
    try {
      await ApiClient().delete(ApiConfig.deleteFileNode(node.id));
      _load();
    } catch (_) {}
  }

  void _openFile(FileNode node) {
    if (node.isFolder) {
      _navigateTo(node.id, node.name);
    } else if (node.url != null) {
      // Open file URL - in a real app, use url_launcher or a webview
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Opening ${node.name}...')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Files & Folders 🗂️')),
      floatingActionButton: Column(mainAxisSize: MainAxisSize.min, children: [
        FloatingActionButton.small(heroTag: 'upload', onPressed: _uploadFile, backgroundColor: const Color(0xFF10B981), child: _uploading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.upload_file)),
        const SizedBox(height: 8),
        FloatingActionButton.small(heroTag: 'folder', onPressed: () => _showCreateFolderDialog(), backgroundColor: const Color(0xFF7C3AED), child: const Icon(Icons.create_new_folder)),
      ]),
      body: Column(children: [
        // Breadcrumb
        _buildBreadcrumbs(),
        // Content
        Expanded(child: _loading ? const Center(child: CircularProgressIndicator()) : _items.isEmpty ? _buildEmpty() : _buildGrid()),
      ]),
    );
  }

  Widget _buildBreadcrumbs() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SingleChildScrollView(scrollDirection: Axis.horizontal, child: Row(
        children: _breadcrumbs.asMap().entries.map((e) {
          final isLast = e.key == _breadcrumbs.length - 1;
          return GestureDetector(
            onTap: () => _navigateToBreadcrumb(e.key),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              margin: const EdgeInsets.only(right: 4),
              decoration: BoxDecoration(
                color: isLast ? KushaagraTheme.primaryBlue.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(100),
              ),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Text(e.value.label, style: TextStyle(fontSize: 13, fontWeight: isLast ? FontWeight.w700 : FontWeight.w500, color: isLast ? KushaagraTheme.primaryBlue : null)),
                if (!isLast) const Padding(padding: EdgeInsets.only(left: 4), child: Text(' › ', style: TextStyle(color: Colors.grey))),
              ]),
            ),
          );
        }).toList(),
      )),
    ).animate().fadeIn();
  }

  Widget _buildGrid() {
    final folders = _items.where((i) => i.isFolder).toList();
    final files = _items.where((i) => i.isFile).toList();
    final all = [...folders, ...files];

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.1),
      itemCount: all.length,
      itemBuilder: (_, i) => _buildCard(all[i], i),
    );
  }

  Widget _buildCard(FileNode node, int index) {
    return GestureDetector(
      onTap: () => _openFile(node),
      onLongPress: () => _deleteItem(node),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(KushaagraTheme.radiusLarge), border: Border.all(color: Theme.of(context).dividerColor)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Center(child: Text(node.icon, style: const TextStyle(fontSize: 40)))),
          const SizedBox(height: 8),
          Text(node.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(node.isFolder ? 'Folder' : node.fileSize, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant)),
          const Spacer(),
          Row(mainAxisAlignment: MainAxisAlignment.end, children: [
            GestureDetector(onTap: () => _deleteItem(node), child: Icon(Icons.delete_outline, size: 18, color: Colors.red.shade300)),
          ]),
        ]),
      ),
    ).animate(delay: Duration(milliseconds: 40 * index)).fadeIn(duration: 300.ms).scaleXY(begin: 0.9, curve: Curves.easeOutCubic);
  }

  Widget _buildEmpty() {
    return Center(child: Padding(padding: const EdgeInsets.all(32), child: Column(mainAxisSize: MainAxisSize.min, children: [
      Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: KushaagraTheme.primaryBlue.withValues(alpha: 0.1), shape: BoxShape.circle), child: const Icon(Icons.folder_open, size: 48, color: KushaagraTheme.primaryBlue)),
      const SizedBox(height: 20),
      Text('This folder is empty', style: KushaagraTheme.displaySmall(context)),
      const SizedBox(height: 8),
      Text('Create a folder or upload a file', style: KushaagraTheme.bodyMedium(context)),
      const SizedBox(height: 20),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        _actionBtn('📁 New Folder', const Color(0xFF7C3AED), _showCreateFolderDialog),
        const SizedBox(width: 10),
        _actionBtn('📤 Upload File', const Color(0xFF10B981), _uploadFile),
      ]),
    ])));
  }

  Widget _actionBtn(String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(100)), child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14))),
    );
  }

  void _showCreateFolderDialog() {
    _newFolderCtrl.clear();
    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('New Folder'),
      content: TextField(controller: _newFolderCtrl, autofocus: true, decoration: const InputDecoration(hintText: 'Folder name')),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(onPressed: _creatingFolder ? null : () { _createFolder(); Navigator.pop(context); }, child: const Text('Create')),
      ],
    ));
  }
}

class _Breadcrumb {
  final String label;
  final String? id;
  const _Breadcrumb({required this.label, required this.id});
}
