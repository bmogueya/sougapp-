import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';

// Modèle Produit (table public.products)
class Product {
  final String id;
  final String name;
  final String description;
  final double price;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'].toString(),
      name: json['name'] as String,
      description: json['description'] ?? '',
      // price peut arriver en int, double ou String selon la sérialisation.
      price: (json['price'] as num?)?.toDouble() ??
          double.tryParse(json['price']?.toString() ?? '') ??
          0.0,
    );
  }
}

// Charge les produits disponibles d'un marchand donné (par UUID).
final productsProvider =
    FutureProvider.family<List<Product>, String>((ref, merchantId) async {
  final response = await SupabaseConfig.client
      .from('products')
      .select()
      .eq('merchant_id', merchantId)
      .eq('is_available', true)
      .order('created_at', ascending: true);

  return (response as List<dynamic>)
      .map((item) => Product.fromJson(item as Map<String, dynamic>))
      .toList();
});
