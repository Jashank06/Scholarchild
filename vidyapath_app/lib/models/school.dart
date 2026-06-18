class SchoolModel {
  final String id;
  final String name;
  final String? board;
  final String? type;
  final Map<String, dynamic>? address;
  final Map<String, dynamic>? contact;
  final Map<String, dynamic>? facilities;
  final Map<String, dynamic>? stats;
  final Map<String, dynamic>? ratings;
  final bool isVerified;
  final List<String>? courses;
  final String? description;
  final String? affiliation;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  SchoolModel({
    required this.id,
    required this.name,
    this.board,
    this.type,
    this.address,
    this.contact,
    this.facilities,
    this.stats,
    this.ratings,
    this.isVerified = false,
    this.courses,
    this.description,
    this.affiliation,
    this.createdAt,
    this.updatedAt,
  });

  factory SchoolModel.fromJson(Map<String, dynamic> json) {
    return SchoolModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      board: json['board'],
      type: json['type'],
      address: json['address'] is Map ? Map<String, dynamic>.from(json['address']) : null,
      contact: json['contact'] is Map ? Map<String, dynamic>.from(json['contact']) : null,
      facilities: json['facilities'] is Map ? Map<String, dynamic>.from(json['facilities']) : null,
      stats: json['stats'] is Map ? Map<String, dynamic>.from(json['stats']) : null,
      ratings: json['ratings'] is Map ? Map<String, dynamic>.from(json['ratings']) : null,
      isVerified: json['isVerified'] ?? false,
      courses: json['courses'] is List ? List<String>.from(json['courses']) : null,
      description: json['description'],
      affiliation: json['affiliation'],
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
  bool get hasComputerLab => facilities?['hasComputerLab'] == true;
  bool get hasLibrary => facilities?['hasLibrary'] == true;
  bool get hasPlayground => facilities?['hasPlayground'] == true;
  bool get hasSmartClasses => facilities?['hasSmartClasses'] == true;
}
