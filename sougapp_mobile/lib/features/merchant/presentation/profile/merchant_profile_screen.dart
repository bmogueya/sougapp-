import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/supabase/supabase_config.dart';
import '../../../auth/providers/auth_provider.dart';

class MerchantProfileScreen extends ConsumerWidget {
  const MerchantProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ma Boutique'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.orange.shade100,
            child: const Icon(Icons.storefront, size: 50, color: Colors.orange),
          ),
          const SizedBox(height: 16),
          const Text(
            'Restaurant Principal',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            user?.email ?? 'marchand@sougapp.com',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          
          SwitchListTile(
            title: const Text('Boutique Ouverte'),
            subtitle: const Text('Accepter de nouvelles commandes'),
            value: true,
            onChanged: (val) {},
            activeColor: Colors.orange,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.inventory_2_outlined),
            title: const Text('Gestion du Menu'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Historique des ventes'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Se déconnecter', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await SupabaseConfig.client.auth.signOut();
            },
          ),
        ],
      ),
    );
  }
}
