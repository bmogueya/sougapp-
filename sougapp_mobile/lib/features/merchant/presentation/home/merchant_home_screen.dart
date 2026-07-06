import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/orders_provider.dart';

class MerchantHomeScreen extends ConsumerStatefulWidget {
  const MerchantHomeScreen({super.key});

  @override
  ConsumerState<MerchantHomeScreen> createState() => _MerchantHomeScreenState();
}

class _MerchantHomeScreenState extends ConsumerState<MerchantHomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersStream = ref.watch(merchantOrdersStreamProvider);
    final updateOrderStatus = ref.read(orderStatusUpdaterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion des Commandes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Nouvelles'),
            Tab(text: 'En préparation'),
          ],
        ),
      ),
      body: ordersStream.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Erreur: $err')),
        data: (orders) {
          final pendingOrders = orders.where((o) => o['status'] == 'pending').toList();
          final acceptedOrders = orders.where((o) => o['status'] == 'accepted').toList();

          return TabBarView(
            controller: _tabController,
            children: [
              // Onglet 1 : Nouvelles commandes (pending)
              pendingOrders.isEmpty
                  ? const Center(child: Text('Aucune nouvelle commande.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: pendingOrders.length,
                      itemBuilder: (context, index) {
                        final order = pendingOrders[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Commande #${order['id'].toString().substring(0, 6)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    const Text('Nouvelle', style: TextStyle(color: Colors.green)),
                                  ],
                                ),
                                const Divider(),
                                Text('Montant : ${order['total_amount']} MRU'),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () => updateOrderStatus(order['id'], 'cancelled'),
                                        style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                                        child: const Text('Refuser'),
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: () => updateOrderStatus(order['id'], 'accepted'),
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                        child: const Text('Accepter'),
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),

              // Onglet 2 : En préparation (accepted)
              acceptedOrders.isEmpty
                  ? const Center(child: Text('Aucune commande en préparation.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: acceptedOrders.length,
                      itemBuilder: (context, index) {
                        final order = acceptedOrders[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Commande #${order['id'].toString().substring(0, 6)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    const Text('En préparation', style: TextStyle(color: Colors.orange)),
                                  ],
                                ),
                                const Divider(),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () => updateOrderStatus(order['id'], 'ready'),
                                    child: const Text('Prêt pour le livreur'),
                                  ),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ],
          );
        },
      ),
    );
  }
}
