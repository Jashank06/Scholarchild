class EventModel {
  final String id;
  final String name;
  final String? category;
  final String? description;
  final DateTime? eventDate;
  final DateTime? registrationDeadline;
  final Map<String, dynamic>? venue;
  final Map<String, dynamic>? organizer;
  final String? eligibility;
  final String? prizes;
  final double fees;
  final String? status;
  final Map<String, dynamic>? ratings;
  final bool isVerified;
  final DateTime? createdAt;

  EventModel({
    required this.id,
    required this.name,
    this.category,
    this.description,
    this.eventDate,
    this.registrationDeadline,
    this.venue,
    this.organizer,
    this.eligibility,
    this.prizes,
    this.fees = 0,
    this.status,
    this.ratings,
    this.isVerified = false,
    this.createdAt,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'],
      description: json['description'],
      eventDate: json['eventDate'] != null ? DateTime.tryParse(json['eventDate']) : null,
      registrationDeadline: json['registrationDeadline'] != null ? DateTime.tryParse(json['registrationDeadline']) : null,
      venue: json['venue'] is Map ? Map<String, dynamic>.from(json['venue']) : null,
      organizer: json['organizer'] is Map ? Map<String, dynamic>.from(json['organizer']) : null,
      eligibility: json['eligibility'],
      prizes: json['prizes'],
      fees: (json['fees'] as num?)?.toDouble() ?? 0,
      status: json['status'],
      ratings: json['ratings'] is Map ? Map<String, dynamic>.from(json['ratings']) : null,
      isVerified: json['isVerified'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  String get city => venue?['city'] ?? '';
  String get state => venue?['state'] ?? '';
  String get fullAddress => venue?['fullAddress'] ?? '';
  String get organizerName => organizer?['name'] ?? '';
  String get organizerContact => organizer?['contact'] ?? '';
  String get organizerWebsite => organizer?['website'] ?? '';
  double get overallRating => (ratings?['overall'] as num?)?.toDouble() ?? 0.0;
  int get totalReviews => (ratings?['totalReviews'] as num?)?.toInt() ?? 0;
}
