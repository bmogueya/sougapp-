import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';

// StreamProvider qui écoute la table "orders" en temps réel.
// Pour le MVP, on écoute toutes les commandes (en prod, on filtrerait sur le merchant_id du restaurateur connecté).
final merchantOrdersStreamProvider = StreamProvider<List<Map<String, dynamic>>>((ref) {
  return SupabaseConfig.client
      .from('orders')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false)
      .map((data) => data);
});

// Provider pour mettre à jour le statut d'une commande
final orderStatusUpdaterProvider = Provider((ref) {
  return (String orderId, String newStatus) async {
    await SupabaseConfig.client
        .from('orders')
        .update({'status': newStatus})
        .eq('id', orderId);
  };
});
