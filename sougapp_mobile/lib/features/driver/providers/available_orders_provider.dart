import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';

// StreamProvider qui écoute les commandes avec le statut "ready" et sans livreur assigné.
// Les streams Supabase ne supportent pas le filtre `is null` : on filtre
// `driver_id == null` côté client dans le .map().
final availableOrdersStreamProvider = StreamProvider<List<Map<String, dynamic>>>((ref) {
  return SupabaseConfig.client
      .from('orders')
      .stream(primaryKey: ['id'])
      .eq('status', 'ready')
      .order('created_at', ascending: false)
      .map((data) => data.where((order) => order['driver_id'] == null).toList());
});

// Provider pour qu'un livreur accepte une course
final acceptOrderProvider = Provider((ref) {
  return (String orderId) async {
    final user = SupabaseConfig.client.auth.currentUser;
    if (user != null) {
      await SupabaseConfig.client
          .from('orders')
          .update({
            'status': 'delivering',
            'driver_id': user.id,
          })
          .eq('id', orderId);
    }
  };
});
