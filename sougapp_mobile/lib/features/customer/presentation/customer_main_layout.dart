import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CustomerMainLayout extends StatelessWidget {
  final Widget child;

  const CustomerMainLayout({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    // Calcul de l'index basé sur la route actuelle
    final String location = GoRouterState.of(context).matchedLocation;
    int currentIndex = 0;
    if (location.startsWith('/customer/profile')) {
      currentIndex = 1;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/customer/home');
              break;
            case 1:
              context.go('/customer/profile');
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Accueil',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
