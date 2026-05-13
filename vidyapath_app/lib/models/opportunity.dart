/// Opportunity model matching the backend Opportunity schema
class OpportunityModel {
  final String id;
  final String type; // scholarship, competition, scheme
  final String status;
  final String title;
  final String? slug;
  final String description;
  final String? shortDescription;
  final String? coverImage;
  final Organizer? organizer;
  final String category;
  final List<String> tags;
  final Eligibility? eligibility;
  final Rewards? rewards;
  final OpportunityDates? dates;
  final ApplicationInfo? application;
  final String? syllabus;
  final String? preparationTips;
  final OpportunityStats? stats;
  final int? matchScore;
  final String? createdAt;

  OpportunityModel({
    required this.id, required this.type, this.status = 'active',
    required this.title, this.slug, required this.description,
    this.shortDescription, this.coverImage, this.organizer,
    required this.category, this.tags = const [], this.eligibility,
    this.rewards, this.dates, this.application, this.syllabus,
    this.preparationTips, this.stats, this.matchScore, this.createdAt,
  });

  String get typeLabel {
    switch (type) {
      case 'scholarship': return '🎓 Scholarship';
      case 'competition': return '🏆 Competition';
      case 'scheme': return '🏛️ Scheme';
      default: return '🌟 Opportunity';
    }
  }

  String get typeEmoji {
    switch (type) {
      case 'scholarship': return '🎓';
      case 'competition': return '🏆';
      case 'scheme': return '🏛️';
      default: return '🌟';
    }
  }

  bool get isDeadlineSoon {
    if (dates?.applicationDeadline == null) return false;
    final deadline = DateTime.tryParse(dates!.applicationDeadline!);
    if (deadline == null) return false;
    return deadline.difference(DateTime.now()).inDays <= 7;
  }

  int get daysLeft {
    if (dates?.applicationDeadline == null) return -1;
    final deadline = DateTime.tryParse(dates!.applicationDeadline!);
    if (deadline == null) return -1;
    return deadline.difference(DateTime.now()).inDays;
  }

  factory OpportunityModel.fromJson(Map<String, dynamic> json) {
    return OpportunityModel(
      id: json['_id'] ?? json['id'] ?? '',
      type: json['type'] ?? 'scholarship',
      status: json['status'] ?? 'active',
      title: json['title'] ?? '',
      slug: json['slug'],
      description: json['description'] ?? '',
      shortDescription: json['shortDescription'],
      coverImage: json['coverImage'],
      organizer: json['organizer'] != null ? Organizer.fromJson(json['organizer']) : null,
      category: json['category'] ?? 'general',
      tags: List<String>.from(json['tags'] ?? []),
      eligibility: json['eligibility'] != null ? Eligibility.fromJson(json['eligibility']) : null,
      rewards: json['rewards'] != null ? Rewards.fromJson(json['rewards']) : null,
      dates: json['dates'] != null ? OpportunityDates.fromJson(json['dates']) : null,
      application: json['application'] != null ? ApplicationInfo.fromJson(json['application']) : null,
      syllabus: json['syllabus'],
      preparationTips: json['preparationTips'],
      stats: json['stats'] != null ? OpportunityStats.fromJson(json['stats']) : null,
      matchScore: json['matchScore'],
      createdAt: json['createdAt'],
    );
  }
}

class Organizer {
  final String name;
  final String? type, logo, website, level;
  Organizer({required this.name, this.type, this.logo, this.website, this.level});
  factory Organizer.fromJson(Map<String, dynamic> json) => Organizer(
    name: json['name'] ?? 'Unknown', type: json['type'],
    logo: json['logo'], website: json['website'], level: json['level'],
  );
  String get levelLabel {
    switch (level) {
      case 'national': return '🇮🇳 National';
      case 'state': return '📍 State';
      case 'international': return '🌍 International';
      case 'district': return '📌 District';
      default: return level ?? '';
    }
  }
}

class Eligibility {
  final List<int> grades;
  final int? minAge, maxAge;
  final String gender;
  final List<String> states, categories, boards;
  final num? maxFamilyIncome, minPercentage;
  final String? otherCriteria;

  Eligibility({
    this.grades = const [], this.minAge, this.maxAge,
    this.gender = 'all', this.states = const [],
    this.categories = const [], this.boards = const [],
    this.maxFamilyIncome, this.minPercentage, this.otherCriteria,
  });

  factory Eligibility.fromJson(Map<String, dynamic> json) => Eligibility(
    grades: List<int>.from((json['grades'] ?? []).map((g) => g is int ? g : int.tryParse(g.toString()) ?? 0)),
    minAge: json['minAge'], maxAge: json['maxAge'],
    gender: json['gender'] ?? 'all',
    states: List<String>.from(json['states'] ?? []),
    categories: List<String>.from(json['categories'] ?? []),
    boards: List<String>.from(json['boards'] ?? []),
    maxFamilyIncome: json['maxFamilyIncome'],
    minPercentage: json['minPercentage'],
    otherCriteria: json['otherCriteria'],
  );
}

class Rewards {
  final String? type, description, cashCurrency;
  final num? cashAmount;
  final List<String> otherBenefits;
  Rewards({this.type, this.cashAmount, this.cashCurrency, this.description, this.otherBenefits = const []});
  factory Rewards.fromJson(Map<String, dynamic> json) => Rewards(
    type: json['type'], cashAmount: json['cashAmount'],
    cashCurrency: json['cashCurrency'] ?? 'INR', description: json['description'],
    otherBenefits: List<String>.from(json['otherBenefits'] ?? []),
  );
  String get displayAmount {
    if (cashAmount == null || cashAmount == 0) return description ?? 'N/A';
    return '₹${cashAmount!.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
  }
}

class OpportunityDates {
  final String? applicationStart, applicationDeadline, examDate, resultDate;
  OpportunityDates({this.applicationStart, this.applicationDeadline, this.examDate, this.resultDate});
  factory OpportunityDates.fromJson(Map<String, dynamic> json) => OpportunityDates(
    applicationStart: json['applicationStart'], applicationDeadline: json['applicationDeadline'],
    examDate: json['examDate'], resultDate: json['resultDate'],
  );
}

class ApplicationInfo {
  final String mode;
  final String? externalLink;
  final List<String> requiredDocuments;
  final num applicationFee;
  final bool isFree;
  ApplicationInfo({this.mode = 'external', this.externalLink, this.requiredDocuments = const [], this.applicationFee = 0, this.isFree = true});
  factory ApplicationInfo.fromJson(Map<String, dynamic> json) => ApplicationInfo(
    mode: json['mode'] ?? 'external', externalLink: json['externalLink'],
    requiredDocuments: List<String>.from(json['requiredDocuments'] ?? []),
    applicationFee: json['applicationFee'] ?? 0, isFree: json['isFree'] ?? true,
  );
}

class OpportunityStats {
  final int totalApplications, totalViews, bookmarkCount;
  OpportunityStats({this.totalApplications = 0, this.totalViews = 0, this.bookmarkCount = 0});
  factory OpportunityStats.fromJson(Map<String, dynamic> json) => OpportunityStats(
    totalApplications: json['totalApplications'] ?? 0,
    totalViews: json['totalViews'] ?? 0,
    bookmarkCount: json['bookmarkCount'] ?? 0,
  );
}
