import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final String id;
  final String name;
  final double price;
  int quantity;

  CartItem({required this.id, required this.name, required this.price, this.quantity = 1});
}

class CartState {
  final String? merchantId;
  final String? merchantName;
  final List<CartItem> items;

  CartState({this.merchantId, this.merchantName, this.items = const []});

  double get totalAmount {
    return items.fold(0, (total, item) => total + (item.price * item.quantity));
  }

  CartState copyWith({String? merchantId, String? merchantName, List<CartItem>? items}) {
    return CartState(
      merchantId: merchantId ?? this.merchantId,
      merchantName: merchantName ?? this.merchantName,
      items: items ?? this.items,
    );
  }
}

class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() {
    return CartState();
  }

  void addItem(String merchantId, String merchantName, CartItem item) {
    // Si on ajoute un produit d'un autre marchand, on vide le panier actuel
    if (state.merchantId != null && state.merchantId != merchantId) {
      state = CartState(merchantId: merchantId, merchantName: merchantName, items: [item]);
      return;
    }

    final currentItems = List<CartItem>.from(state.items);
    final existingIndex = currentItems.indexWhere((i) => i.id == item.id);

    if (existingIndex >= 0) {
      currentItems[existingIndex].quantity += 1;
    } else {
      currentItems.add(item);
    }

    state = state.copyWith(merchantId: merchantId, merchantName: merchantName, items: currentItems);
  }

  void removeItem(String itemId) {
    final currentItems = List<CartItem>.from(state.items);
    final existingIndex = currentItems.indexWhere((i) => i.id == itemId);

    if (existingIndex >= 0) {
      if (currentItems[existingIndex].quantity > 1) {
        currentItems[existingIndex].quantity -= 1;
      } else {
        currentItems.removeAt(existingIndex);
      }
    }

    // Si le panier est vide, on reset le marchand
    if (currentItems.isEmpty) {
      state = CartState();
    } else {
      state = state.copyWith(items: currentItems);
    }
  }

  void clearCart() {
    state = CartState();
  }
}

final cartProvider = NotifierProvider<CartNotifier, CartState>(() => CartNotifier());
