import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/cart_provider.dart';
import '../../providers/products_provider.dart';

class MerchantDetailScreen extends ConsumerWidget {
  final String merchantId;
  final String merchantName;

  const MerchantDetailScreen({
    super.key,
    required this.merchantId,
    required this.merchantName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);
    final productsAsync = ref.watch(productsProvider(merchantId));

    return Scaffold(
      appBar: AppBar(
        title: Text(merchantName),
        actions: [
          IconButton(
            icon: Badge(
              label: Text(cart.items.fold(0, (sum, item) => sum + item.quantity).toString()),
              isLabelVisible: cart.items.isNotEmpty,
              child: const Icon(Icons.shopping_cart),
            ),
            onPressed: () {
              if (cart.items.isNotEmpty) {
                context.push('/customer/cart');
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Votre panier est vide.')),
                );
              }
            },
          )
        ],
      ),
      body: productsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Erreur de chargement du menu : $err',
                textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
          ),
        ),
        data: (products) {
          if (products.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('Ce marchand n\'a pas encore de produits disponibles.',
                    textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];

              // Vérifier si ce produit est dans le panier
              final cartItemIndex = cart.items.indexWhere((item) => item.id == product.id);
              final cartQuantity = cartItemIndex >= 0 ? cart.items[cartItemIndex].quantity : 0;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(product.description, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 8),
                            Text('${product.price} MRU', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                          ],
                        ),
                      ),
                      cartQuantity > 0
                          ? Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                                  onPressed: () => cartNotifier.removeItem(product.id),
                                ),
                                Text('$cartQuantity', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline, color: Colors.green),
                                  onPressed: () => cartNotifier.addItem(
                                    merchantId,
                                    merchantName,
                                    CartItem(id: product.id, name: product.name, price: product.price),
                                  ),
                                ),
                              ],
                            )
                          : ElevatedButton(
                              onPressed: () {
                                cartNotifier.addItem(
                                  merchantId,
                                  merchantName,
                                  CartItem(id: product.id, name: product.name, price: product.price),
                                );
                              },
                              child: const Text('Ajouter'),
                            ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: cart.items.isNotEmpty
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total', style: TextStyle(color: Colors.grey.shade600)),
                        Text('${cart.totalAmount} MRU', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                      ),
                      onPressed: () => context.push('/customer/cart'),
                      child: const Text('Voir le panier'),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }
}
