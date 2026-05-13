/// Application model matching backend Application schema
class ApplicationModel {
  final String id;
  final String userId;
  final dynamic opportunity; // Can be String (ID) or populated OpportunityModel
  final String status;
  final Map<String, dynamic> formData;
  final List<AppDocument> documents;
  final List<TimelineEntry> timeline;
  final int matchScore;
  final AppResult? result;
  final String? appliedAt;

  ApplicationModel({
    required this.id, required this.userId, this.opportunity,
    this.status = 'applied', this.formData = const {},
    this.documents = const [], this.timeline = const [],
    this.matchScore = 0, this.result, this.appliedAt,
  });

  String get statusLabel {
    switch (status) {
      case 'applied': return 'Applied';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'draft': return 'Draft';
      default: return status;
    }
  }

  String get statusEmoji {
    switch (status) {
      case 'applied': return '📝';
      case 'under_review': return '🔍';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'draft': return '📋';
      default: return '📄';
    }
  }

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] is String ? json['userId'] : (json['userId']?['_id'] ?? ''),
      opportunity: json['opportunityId'],
      status: json['status'] ?? 'applied',
      formData: Map<String, dynamic>.from(json['formData'] ?? {}),
      documents: (json['documents'] as List?)?.map((d) => AppDocument.fromJson(d)).toList() ?? [],
      timeline: (json['timeline'] as List?)?.map((t) => TimelineEntry.fromJson(t)).toList() ?? [],
      matchScore: json['matchScore'] ?? 0,
      result: json['result'] != null ? AppResult.fromJson(json['result']) : null,
      appliedAt: json['appliedAt'],
    );
  }
}

class AppDocument {
  final String? name, url, documentId;
  final bool verified;
  AppDocument({this.name, this.url, this.documentId, this.verified = false});
  factory AppDocument.fromJson(Map<String, dynamic> json) => AppDocument(
    name: json['name'], url: json['url'], documentId: json['documentId'], verified: json['verified'] ?? false,
  );
}

class TimelineEntry {
  final String status;
  final String? date, note, updatedBy;
  TimelineEntry({required this.status, this.date, this.note, this.updatedBy});
  factory TimelineEntry.fromJson(Map<String, dynamic> json) => TimelineEntry(
    status: json['status'] ?? '', date: json['date'], note: json['note'], updatedBy: json['updatedBy'],
  );
}

class AppResult {
  final int? rank, score;
  final String? certificate, remarks;
  AppResult({this.rank, this.score, this.certificate, this.remarks});
  factory AppResult.fromJson(Map<String, dynamic> json) => AppResult(
    rank: json['rank'], score: json['score'], certificate: json['certificate'], remarks: json['remarks'],
  );
}

/// Notification model
class NotificationModel {
  final String id;
  final String type, title, message;
  final String? link, icon;
  final bool isRead;
  final String? createdAt;

  NotificationModel({
    required this.id, required this.type, required this.title,
    required this.message, this.link, this.icon, this.isRead = false, this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) => NotificationModel(
    id: json['_id'] ?? json['id'] ?? '',
    type: json['type'] ?? 'system', title: json['title'] ?? '',
    message: json['message'] ?? '', link: json['link'], icon: json['icon'],
    isRead: json['isRead'] ?? false, createdAt: json['createdAt'],
  );
}

/// Document model
class DocumentModel {
  final String id;
  final String type, name;
  final String? originalName, url, mimeType;
  final int? size;
  final bool verified;
  final String? createdAt;

  DocumentModel({
    required this.id, required this.type, required this.name,
    this.originalName, this.url, this.mimeType, this.size,
    this.verified = false, this.createdAt,
  });

  String get typeLabel {
    switch (type) {
      case 'aadhaar': return 'Aadhaar Card';
      case 'marksheet': return 'Marksheet';
      case 'income_cert': return 'Income Certificate';
      case 'caste_cert': return 'Caste Certificate';
      case 'domicile': return 'Domicile';
      case 'photo': return 'Photo';
      case 'birth_cert': return 'Birth Certificate';
      case 'bank_passbook': return 'Bank Passbook';
      default: return 'Other';
    }
  }

  factory DocumentModel.fromJson(Map<String, dynamic> json) => DocumentModel(
    id: json['_id'] ?? json['id'] ?? '', type: json['type'] ?? 'other',
    name: json['name'] ?? '', originalName: json['originalName'],
    url: json['url'], mimeType: json['mimeType'], size: json['size'],
    verified: json['verified'] ?? false, createdAt: json['createdAt'],
  );
}
