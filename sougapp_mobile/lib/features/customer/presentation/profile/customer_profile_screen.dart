import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/supabase/supabase_config.dart';
import '../../../auth/providers/auth_provider.dart';

class CustomerProfileScreen extends ConsumerWidget {
  const CustomerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('profile.title'.tr()),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Text(
              user?.email?.substring(0, 1).toUpperCase() ?? 'U',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            user?.email ?? 'profile.unknown_user'.tr(),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 32),
          
          ListTile(
            leading: const Icon(Icons.language),
            title: Text('profile.language'.tr()),
            trailing: DropdownButton<String>(
              value: context.locale.languageCode,
              items: const [
                DropdownMenuItem(value: 'fr', child: Text('Français')),
                DropdownMenuItem(value: 'ar', child: Text('العربية')),
              ],
              onChanged: (String? value) {
                if (value == 'ar') {
                  context.setLocale(const Locale('ar', 'MR'));
                } else {
                  context.setLocale(const Locale('fr', 'FR'));
                }
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: Text('profile.settings'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: Text('profile.help'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: Text('profile.logout'.tr(), style: const TextStyle(color: Colors.red)),
            onTap: () async {
              await SupabaseConfig.client.auth.signOut();
              // GoRouter redirigera automatiquement grâce à authStateProvider
            },
          ),
        ],
      ),
    );
  }
}
