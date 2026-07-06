import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';

// Définition simple du modèle Merchant pour l'application mobile.
// L'identifiant est un UUID (type `uuid` dans Supabase), donc une String.
class Merchant {
  final String id;
  final String name;
  final String description;
  final String address;
  final String status;

  Merchant({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.status,
  });

  factory Merchant.fromJson(Map<String, dynamic> json) {
    return Merchant(
      id: json['id'].toString(),
      name: json['name'] as String,
      description: json['description'] ?? 'Aucune description',
      address: json['address'] ?? '',
      status: json['status'] ?? 'inactive',
    );
  }
}

// Provider asynchrone qui interroge la table "merchants" via Supabase
final merchantsProvider = FutureProvider<List<Merchant>>((ref) async {
  final response = await SupabaseConfig.client
      .from('merchants')
      .select()
      .eq('status', 'active'); // On ne charge que les marchands actifs
      
  return (response as List<dynamic>)
      .map((item) => Merchant.fromJson(item as Map<String, dynamic>))
      .toList();
});
