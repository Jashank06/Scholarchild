class ReviewModel {
  final String id;
  final String? userId;
  final Map<String, dynamic>? user;
  final String entityId;
  final Map<String, dynamic>? ratings;
  final String? title;
  final String? comment;
  final List<String> pros;
  final List<String> cons;
  final String? reviewType;
  final int helpfulCount;
  final bool isVerified;
  final DateTime? createdAt;
  final DateTime? visitDate;

  ReviewModel({
    required this.id,
    this.userId,
    this.user,
    required this.entityId,
    this.ratings,
    this.title,
    this.comment,
    this.pros = const [],
    this.cons = const [],
    this.reviewType,
    this.helpfulCount = 0,
    this.isVerified = false,
    this.createdAt,
    this.visitDate,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json, {String entityIdKey = 'schoolId'}) {
    return ReviewModel(
      id: json['_id'] ?? '',
      userId: json['userId'] is String ? json['userId'] : json['userId']?['_id']?.toString(),
      user: json['userId'] is Map ? Map<String, dynamic>.from(json['userId']) : null,
      entityId: json[entityIdKey] is String ? json[entityIdKey] : json[entityIdKey]?['_id']?.toString() ?? '',
      ratings: json['ratings'] is Map ? Map<String, dynamic>.from(json['ratings']) : null,
      title: json['title'],
      comment: json['comment'],
      pros: json['pros'] is List ? List<String>.from(json['pros']) : [],
      cons: json['cons'] is List ? List<String>.from(json['cons']) : [],
      reviewType: json['reviewType'],
      helpfulCount: json['helpfulCount'] ?? 0,
      isVerified: json['isVerified'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      visitDate: json['visitDate'] != null ? DateTime.tryParse(json['visitDate']) : null,
    );
  }

  String get userName {
    final profile = user?['profile'];
    if (profile == null) return 'User';
    final first = profile['firstName'] ?? '';
    final last = profile['lastName'] ?? '';
    return '$first ${last.isNotEmpty ? '${last[0]}.' : ''}'.trim();
  }

  double get overallRating => (ratings?['overall'] as num?)?.toDouble() ?? 0.0;
}
