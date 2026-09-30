import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'providers/app_provider.dart';
import 'providers/locale_provider.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/create_listing_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
      ],
      child: const MarketplaceFlutterApp(),
    ),
  );
}

class MarketplaceFlutterApp extends StatelessWidget {
  const MarketplaceFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    final isLight = provider.isLightMode;

    return MaterialApp(
      title: 'Marketplace Flutter App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: isLight ? Brightness.light : Brightness.dark,
        scaffoldBackgroundColor: provider.scaffoldBg,
        colorScheme: isLight
            ? ColorScheme.light(
                primary: const Color(0xFF6366F1),
                secondary: const Color(0xFF8B5CF6),
                surface: provider.cardBg,
                onSurface: provider.textColor,
              )
            : ColorScheme.dark(
                primary: const Color(0xFF6366F1),
                secondary: const Color(0xFF8B5CF6),
                surface: provider.cardBg,
                onSurface: provider.textColor,
              ),
        textTheme: GoogleFonts.interTextTheme(
          isLight ? ThemeData.light().textTheme : ThemeData.dark().textTheme,
        ).apply(
          bodyColor: provider.textColor,
          displayColor: provider.textColor,
        ),
      ),
      home: const MainTabScaffold(),
    );
  }
}

class MainTabScaffold extends StatefulWidget {
  const MainTabScaffold({super.key});

  @override
  State<MainTabScaffold> createState() => _MainTabScaffoldState();
}

class _MainTabScaffoldState extends State<MainTabScaffold> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    SearchScreen(),
    ChatScreen(sellerName: 'Official Store HQ', itemTitle: 'In-App Support & Chats'),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final localeProvider = Provider.of<LocaleProvider>(context);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(

        decoration: BoxDecoration(
          color: provider.navBg,
          border: Border(top: BorderSide(color: provider.cardBorder)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: provider.navBg,
          selectedItemColor: const Color(0xFF6366F1),
          unselectedItemColor: provider.subtextColor,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold),
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 11),
          items: [
            BottomNavigationBarItem(icon: const Icon(LucideIcons.home), label: localeProvider.getText('home')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.search), label: localeProvider.getText('search')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.messageSquare), label: localeProvider.getText('chats')),
            BottomNavigationBarItem(icon: const Icon(LucideIcons.user), label: localeProvider.getText('profile')),
          ],
        ),
      ),
    );
  }
}

