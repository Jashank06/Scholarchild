class NotableModel {
  final String id;
  final String title;
  final String? description;
  final String? content;
  final String? link;
  final String? linkLabel;
  final String? image;
  final String? category;
  final List<String> tags;
  final bool featured;
  final int clickCount;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime? createdAt;

  NotableModel({
    required this.id,
    required this.title,
    this.description,
    this.content,
    this.link,
    this.linkLabel,
    this.image,
    this.category,
    this.tags = const [],
    this.featured = false,
    this.clickCount = 0,
    this.startDate,
    this.endDate,
    this.createdAt,
  });

  factory NotableModel.fromJson(Map<String, dynamic> json) {
    return NotableModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      content: json['content'],
      link: json['link'],
      linkLabel: json['linkLabel'],
      image: json['image'],
      category: json['category'],
      tags: json['tags'] is List ? List<String>.from(json['tags']) : [],
      featured: json['featured'] ?? false,
      clickCount: json['clickCount'] ?? 0,
      startDate: json['startDate'] != null ? DateTime.tryParse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
