import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  // Clés injectables au build via --dart-define pour ne pas figer la config.
  //   flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
  // Les valeurs par défaut ci-dessous ciblent l'environnement de dev.
  // La clé anon (publishable) est conçue pour être exposée côté client.
  static const String _supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://lhmgzyjfstpzwtxsqiit.supabase.co',
  );
  static const String _supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_hRyxJTyDq_4lMroQYCGbNA_t6h1LpTU',
  );

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: _supabaseUrl,
      // La clé "sb_publishable_..." est une clé publishable (remplace l'ancien anonKey).
      publishableKey: _supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
