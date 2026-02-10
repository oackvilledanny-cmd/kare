
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/shift_marketplace_screen.dart';

void main() {
  runApp(const ProviderScope(child: DaycareApp()));
}

class DaycareApp extends StatelessWidget {
  const DaycareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'K-Daycare OS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      home: const ShiftMarketplaceScreen(),
    );
  }
}
