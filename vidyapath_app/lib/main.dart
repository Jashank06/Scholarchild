import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme.dart';

import 'providers/data_providers.dart';

import 'screens/splash/splash_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/auth/auth_screen.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/shell/main_shell.dart';
import 'screens/roles/parent/parent_shell.dart';
import 'screens/roles/institution/institution_shell.dart';
import 'screens/roles/admin/admin_shell.dart';
import 'screens/opportunities/opportunity_detail_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/bookmarks/bookmarks_screen.dart';
import 'screens/documents/documents_screen.dart';
import 'screens/documents/files_folders_screen.dart';
import 'screens/services/services_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/schools/schools_screen.dart';
import 'screens/schools/school_detail_screen.dart';
import 'screens/institutions/institutions_screen.dart';
import 'screens/events/events_screen.dart';
import 'screens/notables/notables_screen.dart';
import 'screens/service_providers/service_providers_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const ProviderScope(child: KushaagraApp()));
}

class KushaagraApp extends ConsumerWidget {
  const KushaagraApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp(
      title: 'Kushaagra',
      debugShowCheckedModeBanner: false,
      theme: KushaagraTheme.lightTheme,
      darkTheme: KushaagraTheme.darkTheme,
      themeMode: themeMode,
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/':
            return _fadeRoute(const SplashScreen(), settings);
          case '/onboarding':
            return _fadeRoute(const OnboardingScreen(), settings);
          case '/auth':
            return _fadeRoute(const AuthScreen(), settings);
          case '/otp':
            return _slideRoute(const OtpScreen(), settings);
          case '/home':
            return _fadeRoute(const MainShell(), settings);
          case '/opportunity':
            final id = settings.arguments as String;
            return _slideRoute(OpportunityDetailScreen(opportunityId: id), settings);
          case '/notifications':
            return _slideRoute(const NotificationsScreen(), settings);
          case '/bookmarks':
            return _slideRoute(const BookmarksScreen(), settings);
          case '/documents':
            return _slideRoute(const FilesFoldersScreen(), settings);
          case '/services':
            return _slideRoute(const ServicesScreen(), settings);
          case '/edit-profile':
            return _slideRoute(const EditProfileScreen(), settings);
          case '/schools':
            return _slideRoute(const SchoolsScreen(), settings);
          case '/school-detail':
            final schoolId = settings.arguments as String;
            return _slideRoute(SchoolDetailScreen(schoolId: schoolId), settings);
          case '/institutions':
            return _slideRoute(const InstitutionsScreen(), settings);
          case '/events':
            return _slideRoute(const EventsScreen(), settings);
          case '/notables':
            return _slideRoute(const NotablesScreen(), settings);
          case '/service-providers':
            return _slideRoute(const ServiceProvidersScreen(), settings);
          case '/parent_home':
            return _fadeRoute(const ParentShell(), settings);
          case '/institution_home':
            return _fadeRoute(const InstitutionShell(), settings);
          case '/admin_home':
            return _fadeRoute(const AdminShell(), settings);
          default:
            return _fadeRoute(const MainShell(), settings);
        }
      },
    );
  }

  /// Smooth fade transition
  PageRouteBuilder _fadeRoute(Widget page, RouteSettings settings) {
    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, __, ___) => page,
      transitionDuration: const Duration(milliseconds: 300),
      transitionsBuilder: (_, anim, __, child) {
        return FadeTransition(opacity: CurvedAnimation(parent: anim, curve: Curves.easeInOut), child: child);
      },
    );
  }

  /// Slide up + fade transition
  PageRouteBuilder _slideRoute(Widget page, RouteSettings settings) {
    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, __, ___) => page,
      transitionDuration: const Duration(milliseconds: 350),
      transitionsBuilder: (_, anim, __, child) {
        final curve = CurvedAnimation(parent: anim, curve: Curves.easeOutCubic);
        return SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero).animate(curve),
          child: FadeTransition(opacity: curve, child: child),
        );
      },
    );
  }
}
