import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';

// StreamProvider qui écoute les commandes avec le statut "ready" et sans livreur assigné.
final availableOrdersStreamProvider = StreamProvider<List<Map<String, dynamic>>>((ref) {
  return SupabaseConfig.client
      .from('orders')
      .stream(primaryKey: ['id'])
      .eq('status', 'ready')
      .is_('driver_id', null) // Commandes non assignées
      .order('created_at', ascending: false)
      .map((data) => data);
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
