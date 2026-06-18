class FileNode {
  final String id;
  final String? parentId;
  final String type; // 'folder' | 'file'
  final String name;
  final String? url;
  final String? mimeType;
  final int? size;
  final String? extension;
  final bool isDeleted;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  FileNode({
    required this.id,
    this.parentId,
    required this.type,
    required this.name,
    this.url,
    this.mimeType,
    this.size,
    this.extension,
    this.isDeleted = false,
    this.createdAt,
    this.updatedAt,
  });

  factory FileNode.fromJson(Map<String, dynamic> json) {
    return FileNode(
      id: json['_id'] ?? '',
      parentId: json['parentId']?.toString(),
      type: json['type'] ?? 'file',
      name: json['name'] ?? '',
      url: json['url'],
      mimeType: json['mimeType'],
      size: json['size'],
      extension: json['extension'],
      isDeleted: json['isDeleted'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  bool get isFolder => type == 'folder';
  bool get isFile => type == 'file';

  String get fileSize {
    if (size == null) return '';
    if (size! < 1024) return '${size} B';
    if (size! < 1048576) return '${(size! / 1024).toStringAsFixed(1)} KB';
    return '${(size! / 1048576).toStringAsFixed(1)} MB';
  }

  String get icon {
    if (isFolder) return '📁';
    final ext = (extension ?? '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].contains(ext)) return '🖼️';
    if (['pdf'].contains(ext)) return '📄';
    if (['doc', 'docx'].contains(ext)) return '📝';
    if (['xls', 'xlsx'].contains(ext)) return '📊';
    if (['ppt', 'pptx'].contains(ext)) return '📽️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].contains(ext)) return '🗜️';
    if (['mp4', 'mov', 'avi', 'mkv'].contains(ext)) return '🎬';
    if (['mp3', 'wav', 'aac'].contains(ext)) return '🎵';
    return '📎';
  }
}
