/// User model matching the backend User schema
class UserModel {
  final String id;
  final String role;
  final String email;
  final String? phone;
  final bool isVerified;
  final bool isApproved;
  final UserProfile? profile;
  final Gamification? gamification;
  final int profileScore;
  final UserPreferences? preferences;
  final ParentProfile? parentProfile;
  final InstitutionProfile? institutionProfile;

  UserModel({
    required this.id,
    required this.role,
    required this.email,
    this.phone,
    this.isVerified = false,
    this.isApproved = true,
    this.profile,
    this.gamification,
    this.profileScore = 0,
    this.preferences,
    this.parentProfile,
    this.institutionProfile,
  });

  String get fullName {
    if (role == 'school' || role == 'university') {
      return institutionProfile?.institutionName ?? '';
    }
    return '${profile?.firstName ?? ''} ${profile?.lastName ?? ''}'.trim();
  }

  String get initials {
    final name = fullName;
    if (name.isEmpty) return '?';
    final parts = name.split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name[0].toUpperCase();
  }

  int get calculatedScore {
    int score = 0;
    if (email.isNotEmpty) score += 10;
    
    final p = profile;
    if (p != null) {
      if (p.firstName != null && p.firstName!.isNotEmpty) score += 15;
      if (p.lastName != null && p.lastName!.isNotEmpty) score += 15;
      if (p.grade != null) score += 15;
      if (p.board != null && p.board!.isNotEmpty) score += 15;
      if (p.address?.state != null && p.address!.state!.isNotEmpty) score += 15;
      if (avatar != null && avatar!.isNotEmpty) score += 15;
    }
    
    return score > 100 ? 100 : score;
  }

  String? get avatar => profile?.avatar;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      role: json['role'] ?? 'student',
      email: json['email'] ?? '',
      phone: json['phone'],
      isVerified: json['isVerified'] ?? false,
      isApproved: json['isApproved'] ?? true,
      profile: json['profile'] != null ? UserProfile.fromJson(json['profile']) : null,
      gamification: json['gamification'] != null ? Gamification.fromJson(json['gamification']) : null,
      profileScore: json['profileScore'] ?? 0,
      preferences: json['preferences'] != null ? UserPreferences.fromJson(json['preferences']) : null,
      parentProfile: json['parentProfile'] != null ? ParentProfile.fromJson(json['parentProfile']) : null,
      institutionProfile: json['institutionProfile'] != null ? InstitutionProfile.fromJson(json['institutionProfile']) : null,
    );
  }
}

class UserProfile {
  final String? firstName;
  final String? lastName;
  final String? avatar;
  final String? dateOfBirth;
  final String? gender;
  final int? grade;
  final String? board;
  final String? schoolName;
  final UserAddress? address;
  final num? familyIncome;
  final String? category;
  final String? religion;
  final String? parentOccupation;
  final num? previousGradePercentage;
  final List<String> achievements;
  final List<String> interests;

  UserProfile({
    this.firstName, this.lastName, this.avatar, this.dateOfBirth,
    this.gender, this.grade, this.board, this.schoolName, this.address,
    this.familyIncome, this.category, this.religion, this.parentOccupation,
    this.previousGradePercentage, this.achievements = const [], this.interests = const [],
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      firstName: json['firstName'],
      lastName: json['lastName'],
      avatar: json['avatar'],
      dateOfBirth: json['dateOfBirth'],
      gender: json['gender'],
      grade: json['grade'],
      board: json['board'],
      schoolName: json['schoolName'],
      address: json['address'] != null ? UserAddress.fromJson(json['address']) : null,
      familyIncome: json['familyIncome'],
      category: json['category'],
      religion: json['religion'],
      parentOccupation: json['parentOccupation'],
      previousGradePercentage: json['previousGradePercentage'],
      achievements: List<String>.from(json['achievements'] ?? []),
      interests: List<String>.from(json['interests'] ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
    if (firstName != null) 'firstName': firstName,
    if (lastName != null) 'lastName': lastName,
    if (gender != null) 'gender': gender,
    if (grade != null) 'grade': grade,
    if (board != null) 'board': board,
    if (schoolName != null) 'schoolName': schoolName,
    if (category != null) 'category': category,
    if (religion != null) 'religion': religion,
    if (familyIncome != null) 'familyIncome': familyIncome,
    if (previousGradePercentage != null) 'previousGradePercentage': previousGradePercentage,
    if (interests.isNotEmpty) 'interests': interests,
  };
}

class UserAddress {
  final String? street, city, district, taluka, state, pincode;
  UserAddress({this.street, this.city, this.district, this.taluka, this.state, this.pincode});
  factory UserAddress.fromJson(Map<String, dynamic> json) => UserAddress(
    street: json['street'], city: json['city'], district: json['district'],
    taluka: json['taluka'], state: json['state'], pincode: json['pincode'],
  );
  Map<String, dynamic> toJson() => {
    if (state != null) 'state': state, if (city != null) 'city': city,
    if (district != null) 'district': district,
  };
}

class Gamification {
  final int xp;
  final int level;
  final List<Badge> badges;
  final int streakDays;
  final String? lastActiveDate;
  final double? levelProgress;
  final int? xpToNextLevel;

  Gamification({
    this.xp = 0, this.level = 1, this.badges = const [],
    this.streakDays = 0, this.lastActiveDate, this.levelProgress, this.xpToNextLevel,
  });

  factory Gamification.fromJson(Map<String, dynamic> json) => Gamification(
    xp: json['xp'] ?? 0,
    level: json['level'] ?? 1,
    badges: (json['badges'] as List?)?.map((b) => Badge.fromJson(b)).toList() ?? [],
    streakDays: json['streakDays'] ?? 0,
    lastActiveDate: json['lastActiveDate'],
    levelProgress: (json['levelProgress'] as num?)?.toDouble(),
    xpToNextLevel: json['xpToNextLevel'],
  );
}

class Badge {
  final String badgeId, badgeName, badgeIcon;
  final String? earnedAt;
  Badge({required this.badgeId, required this.badgeName, required this.badgeIcon, this.earnedAt});
  factory Badge.fromJson(Map<String, dynamic> json) => Badge(
    badgeId: json['badgeId'] ?? '', badgeName: json['badgeName'] ?? '',
    badgeIcon: json['badgeIcon'] ?? '🌟', earnedAt: json['earnedAt'],
  );
}

class UserPreferences {
  final String language;
  final NotificationPrefs? notifications;
  UserPreferences({this.language = 'en', this.notifications});
  factory UserPreferences.fromJson(Map<String, dynamic> json) => UserPreferences(
    language: json['language'] ?? 'en',
    notifications: json['notifications'] != null ? NotificationPrefs.fromJson(json['notifications']) : null,
  );
}

class NotificationPrefs {
  final bool email, sms, push, whatsapp;
  NotificationPrefs({this.email = true, this.sms = true, this.push = true, this.whatsapp = false});
  factory NotificationPrefs.fromJson(Map<String, dynamic> json) => NotificationPrefs(
    email: json['email'] ?? true, sms: json['sms'] ?? true,
    push: json['push'] ?? true, whatsapp: json['whatsapp'] ?? false,
  );
}

class ParentProfile {
  final String? occupation;
  final List<LinkedChild> children;
  ParentProfile({this.occupation, this.children = const []});
  factory ParentProfile.fromJson(Map<String, dynamic> json) => ParentProfile(
    occupation: json['occupation'],
    children: (json['children'] as List?)?.map((c) => LinkedChild.fromJson(c)).toList() ?? [],
  );
}

class LinkedChild {
  final String childId;
  final String relationship;
  LinkedChild({required this.childId, required this.relationship});
  factory LinkedChild.fromJson(Map<String, dynamic> json) => LinkedChild(
    childId: json['childId'] ?? '', relationship: json['relationship'] ?? 'guardian',
  );
}

class InstitutionProfile {
  final String? institutionName, institutionType, registrationNumber;
  final String? verificationStatus;
  InstitutionProfile({this.institutionName, this.institutionType, this.registrationNumber, this.verificationStatus});
  factory InstitutionProfile.fromJson(Map<String, dynamic> json) => InstitutionProfile(
    institutionName: json['institutionName'], institutionType: json['institutionType'],
    registrationNumber: json['registrationNumber'], verificationStatus: json['verificationStatus'],
  );
}
