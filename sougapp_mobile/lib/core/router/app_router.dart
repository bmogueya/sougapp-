import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/customer/presentation/customer_main_layout.dart';
import '../../features/customer/presentation/home/customer_home_screen.dart';
import '../../features/customer/presentation/home/merchant_detail_screen.dart';
import '../../features/customer/presentation/home/cart_screen.dart';
import '../../features/customer/presentation/profile/customer_profile_screen.dart';
import '../../features/driver/presentation/driver_main_layout.dart';
import '../../features/driver/presentation/home/driver_home_screen.dart';
import '../../features/driver/presentation/profile/driver_profile_screen.dart';
import '../../features/merchant/presentation/merchant_main_layout.dart';
import '../../features/merchant/presentation/home/merchant_home_screen.dart';
import '../../features/merchant/presentation/profile/merchant_profile_screen.dart';
import '../supabase/supabase_config.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) async {
      // Attendre que l'état initial soit chargé
      if (authState.isLoading) return null;

      final isAuth = authState.value?.session != null || SupabaseConfig.client.auth.currentSession != null;
      final isLoggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isAuth && !isLoggingIn) return '/login';
      if (isAuth && isLoggingIn) {
        // Rediriger selon le rôle sauvegardé dans user_metadata
        final user = SupabaseConfig.client.auth.currentUser;
        final role = user?.userMetadata?['role'] as String? ?? 'customer';
        
        if (role == 'driver') {
          return '/driver/home';
        } else if (role == 'merchant') {
          return '/merchant/home';
        } else {
          return '/customer/home';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      
      // Espace Client (ShellRoute avec BottomNavigationBar)
      ShellRoute(
        builder: (context, state, child) {
          return CustomerMainLayout(child: child);
        },
        routes: [
          GoRoute(
            path: '/customer/home',
            builder: (context, state) => const CustomerHomeScreen(),
            routes: [
              GoRoute(
                path: 'merchant/:id',
                builder: (context, state) {
                  final merchantId = state.pathParameters['id']!;
                  final merchantName = state.uri.queryParameters['name'] ?? 'Restaurant';
                  return MerchantDetailScreen(merchantId: merchantId, merchantName: merchantName);
                },
              ),
              GoRoute(
                path: 'cart',
                builder: (context, state) => const CartScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/customer/profile',
            builder: (context, state) => const CustomerProfileScreen(),
          ),
        ],
      ),

      // Espace Livreur (ShellRoute avec BottomNavigationBar)
      ShellRoute(
        builder: (context, state, child) {
          return DriverMainLayout(child: child);
        },
        routes: [
          GoRoute(
            path: '/driver/home',
            builder: (context, state) => const DriverHomeScreen(),
          ),
          GoRoute(
            path: '/driver/profile',
            builder: (context, state) => const DriverProfileScreen(),
          ),
        ],
      ),

      // Espace Marchand (ShellRoute avec BottomNavigationBar)
      ShellRoute(
        builder: (context, state, child) {
          return MerchantMainLayout(child: child);
        },
        routes: [
          GoRoute(
            path: '/merchant/home',
            builder: (context, state) => const MerchantHomeScreen(),
          ),
          GoRoute(
            path: '/merchant/profile',
            builder: (context, state) => const MerchantProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
