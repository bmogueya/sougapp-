import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/cart_provider.dart';
import '../../../../core/supabase/supabase_config.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  bool _isLoading = false;
  final TextEditingController _addressController = TextEditingController(text: 'Nouakchott, TVZ');

  // Frais de livraison forfaitaires (MRU). À paramétrer par zone plus tard.
  static const double _deliveryFee = 50.0;

  // Mode de paiement. Seul 'cash' est réglé automatiquement (à la livraison) ;
  // les modes mobile-money sont enregistrés comme intention (voir 07_orders_payment.sql).
  String _paymentMethod = 'cash';
  static const Map<String, String> _paymentLabels = {
    'cash': 'Espèces à la livraison',
    'bankily': 'Bankily',
    'sedad': 'Sedad',
    'masrivi': 'Masrivi',
  };

  Future<void> _submitOrder() async {
    final cart = ref.read(cartProvider);
    final user = SupabaseConfig.client.auth.currentUser;

    if (user == null || cart.merchantId == null || cart.items.isEmpty) {
      return;
    }

    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer une adresse de livraison.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 1. Créer la commande
      final orderResponse = await SupabaseConfig.client.from('orders').insert({
        'customer_id': user.id,
        'merchant_id': cart.merchantId,
        'status': 'pending',
        'total_amount': cart.totalAmount + _deliveryFee,
        'delivery_fee': _deliveryFee,
        'payment_method': _paymentMethod,
        'delivery_address': _addressController.text.trim(),
      }).select().single();

      final orderId = orderResponse['id'];

      // 2. Créer les lignes de commande (order_items)
      final orderItemsData = cart.items.map((item) => {
        'order_id': orderId,
        'product_name': item.name,
        'quantity': item.quantity,
        'unit_price': item.price,
      }).toList();

      await SupabaseConfig.client.from('order_items').insert(orderItemsData);

      // 3. Vider le panier
      ref.read(cartProvider.notifier).clearCart();

      // 4. Afficher le succès et retourner à l'accueil
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Commande envoyée avec succès !')),
        );
        context.go('/customer/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);

    if (cart.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mon Panier')),
        body: const Center(child: Text('Votre panier est vide.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Panier'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Commande chez : ${cart.merchantName}',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          
          // Liste des articles
          ...cart.items.map((item) => ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(item.name),
            subtitle: Text('${item.price} MRU x ${item.quantity}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${item.price * item.quantity} MRU', style: const TextStyle(fontWeight: FontWeight.bold)),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => cartNotifier.removeItem(item.id),
                ),
              ],
            ),
          )),
          
          const Divider(height: 32),
          
          // Adresse de livraison
          const Text('Adresse de livraison', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          TextField(
            controller: _addressController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Ex: Tevragh Zeina, près de...',
              prefixIcon: Icon(Icons.location_on),
            ),
          ),

          const SizedBox(height: 24),

          // Mode de paiement
          const Text('Mode de paiement', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _paymentMethod,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.payment),
            ),
            items: _paymentLabels.entries
                .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                .toList(),
            onChanged: _isLoading
                ? null
                : (value) {
                    if (value != null) setState(() => _paymentMethod = value);
                  },
          ),

          const SizedBox(height: 32),

          // Résumé
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Sous-total'),
                    Text('${cart.totalAmount} MRU'),
                  ],
                ),
                const SizedBox(height: 8),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Frais de livraison'),
                    Text('$_deliveryFee MRU'),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total à payer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('${cart.totalAmount + _deliveryFee} MRU', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.blue)),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
              ),
              onPressed: _isLoading ? null : _submitOrder,
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Confirmer la commande', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
