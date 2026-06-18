class ActivityLogModel {
  final String id;
  final String entityType;
  final String entityId;
  final String action;
  final String? userId;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? changes;
  final DateTime? createdAt;

  ActivityLogModel({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.action,
    this.userId,
    this.user,
    this.changes,
    this.createdAt,
  });

  factory ActivityLogModel.fromJson(Map<String, dynamic> json) {
    return ActivityLogModel(
      id: json['_id'] ?? '',
      entityType: json['entityType'] ?? '',
      entityId: json['entityId']?.toString() ?? '',
      action: json['action'] ?? '',
      userId: json['userId'] is String ? json['userId'] : json['userId']?['_id']?.toString(),
      user: json['userId'] is Map ? Map<String, dynamic>.from(json['userId']) : null,
      changes: json['changes'] is Map ? Map<String, dynamic>.from(json['changes']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  bool get isCreated => action == 'created';
  bool get isUpdated => action == 'updated';

  String get userName {
    final profile = user?['profile'];
    if (profile == null) return 'User';
    final first = profile['firstName'] ?? '';
    final last = profile['lastName'] ?? '';
    return '$first ${last.isNotEmpty ? '${last[0]}.' : ''}'.trim();
  }

  List<MapEntry<String, Map<String, String>>> get changeEntries {
    if (changes == null) return [];
    return changes!.entries.map((e) {
      final val = e.value is Map ? Map<String, String>.from(e.value) : <String, String>{};
      return MapEntry(e.key, val);
    }).toList();
  }
}
