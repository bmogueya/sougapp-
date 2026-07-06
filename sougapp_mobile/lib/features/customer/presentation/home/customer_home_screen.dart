import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/merchants_provider.dart';

class CustomerHomeScreen extends ConsumerWidget {
  const CustomerHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final merchantsAsyncValue = ref.watch(merchantsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('SougApp'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Barre de recherche
            SearchBar(
              hintText: 'Que cherchez-vous ?',
              leading: const Icon(Icons.search),
              elevation: WidgetStateProperty.all(1.0),
              padding: WidgetStateProperty.all(const EdgeInsets.symmetric(horizontal: 16)),
            ),
            const SizedBox(height: 24),
            
            // Catégories
            const Text('Catégories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: 4,
                separatorBuilder: (context, index) => const SizedBox(width: 16),
                itemBuilder: (context, index) {
                  final categories = ['Restaurants', 'Supermarchés', 'Pharmacies', 'Boutiques'];
                  final icons = [Icons.restaurant, Icons.local_grocery_store, Icons.local_pharmacy, Icons.storefront];
                  
                  return Column(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                        child: Icon(icons[index], color: Theme.of(context).colorScheme.primary),
                      ),
                      const SizedBox(height: 8),
                      Text(categories[index], style: const TextStyle(fontSize: 12)),
                    ],
                  );
                },
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Marchands populaires
            const Text('Marchands à proximité', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            merchantsAsyncValue.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Text('Erreur: $err', style: const TextStyle(color: Colors.red)),
              data: (merchants) {
                if (merchants.isEmpty) {
                  return const Text('Aucun marchand actif trouvé.');
                }
                
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: merchants.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final merchant = merchants[index];
                    return GestureDetector(
                      onTap: () {
                        context.push('/customer/home/merchant/${merchant.id}?name=${Uri.encodeComponent(merchant.name)}');
                      },
                      child: Card(
                        clipBehavior: Clip.antiAlias,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          side: BorderSide(color: Colors.grey.shade200),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 120,
                              width: double.infinity,
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.store, size: 40, color: Colors.grey),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(merchant.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text(merchant.description, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 14, color: Colors.blue),
                                      const SizedBox(width: 4),
                                      Expanded(child: Text(merchant.address, style: const TextStyle(color: Colors.blue, fontSize: 12), overflow: TextOverflow.ellipsis)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  const Align(
                                    alignment: Alignment.centerRight,
                                    child: Text('Appuyer pour commander', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                                  )
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
