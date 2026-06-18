class ServiceProviderModel {
  final String id;
  final String name;
  final String? tagline;
  final String? description;
  final String? link;
  final String? linkLabel;
  final String? image;
  final String? category;
  final List<String> servicesOffered;
  final String? contactPhone;
  final String? contactEmail;
  final String? city;
  final String? state;
  final String? website;
  final int? establishedYear;
  final String? discountInfo;
  final bool featured;
  final int clickCount;
  final double rating;
  final DateTime? createdAt;

  ServiceProviderModel({
    required this.id,
    required this.name,
    this.tagline,
    this.description,
    this.link,
    this.linkLabel,
    this.image,
    this.category,
    this.servicesOffered = const [],
    this.contactPhone,
    this.contactEmail,
    this.city,
    this.state,
    this.website,
    this.establishedYear,
    this.discountInfo,
    this.featured = false,
    this.clickCount = 0,
    this.rating = 0,
    this.createdAt,
  });

  factory ServiceProviderModel.fromJson(Map<String, dynamic> json) {
    return ServiceProviderModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      tagline: json['tagline'],
      description: json['description'],
      link: json['link'],
      linkLabel: json['linkLabel'],
      image: json['image'],
      category: json['category'],
      servicesOffered: json['servicesOffered'] is List ? List<String>.from(json['servicesOffered']) : [],
      contactPhone: json['contactPhone'],
      contactEmail: json['contactEmail'],
      city: json['city'],
      state: json['state'],
      website: json['website'],
      establishedYear: json['establishedYear'],
      discountInfo: json['discountInfo'],
      featured: json['featured'] ?? false,
      clickCount: json['clickCount'] ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  String get location => [city, state].where((s) => s != null && s.isNotEmpty).join(', ');
}
