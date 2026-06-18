class InstitutionModel {
  final String id;
  final String name;
  final String? type;
  final String? affiliation;
  final Map<String, dynamic>? address;
  final Map<String, dynamic>? contact;
  final Map<String, dynamic>? facilities;
  final Map<String, dynamic>? stats;
  final Map<String, dynamic>? ratings;
  final bool isVerified;
  final List<String>? courses;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  InstitutionModel({
    required this.id,
    required this.name,
    this.type,
    this.affiliation,
    this.address,
    this.contact,
    this.facilities,
    this.stats,
    this.ratings,
    this.isVerified = false,
    this.courses,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory InstitutionModel.fromJson(Map<String, dynamic> json) {
    return InstitutionModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'],
      affiliation: json['affiliation'],
      address: json['address'] is Map ? Map<String, dynamic>.from(json['address']) : null,
      contact: json['contact'] is Map ? Map<String, dynamic>.from(json['contact']) : null,
      facilities: json['facilities'] is Map ? Map<String, dynamic>.from(json['facilities']) : null,
      stats: json['stats'] is Map ? Map<String, dynamic>.from(json['stats']) : null,
      ratings: json['ratings'] is Map ? Map<String, dynamic>.from(json['ratings']) : null,
      isVerified: json['isVerified'] ?? false,
      courses: json['courses'] is List ? List<String>.from(json['courses']) : null,
      description: json['description'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  String get city => address?['city'] ?? '';
  String get state => address?['state'] ?? '';
  String get district => address?['district'] ?? '';
  String get email => contact?['email'] ?? '';
  String get phone => contact?['phone'] ?? '';
  String get website => contact?['website'] ?? '';
  double get overallRating => (ratings?['overall'] as num?)?.toDouble() ?? 0.0;
  int get totalReviews => (ratings?['totalReviews'] as num?)?.toInt() ?? 0;
  bool get hasHostel => facilities?['hasHostel'] == true;
  bool get hasLibrary => facilities?['hasLibrary'] == true;
  bool get hasSports => facilities?['hasSports'] == true;
  bool get hasWifi => facilities?['hasWifi'] == true;
}
