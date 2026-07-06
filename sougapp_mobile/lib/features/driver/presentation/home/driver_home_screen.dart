import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/available_orders_provider.dart';

class DriverHomeScreen extends ConsumerStatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  ConsumerState<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends ConsumerState<DriverHomeScreen> {
  bool isOnline = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Espace Livreur'),
        actions: [
          Row(
            children: [
              Text(
                isOnline ? 'En Ligne' : 'Hors Ligne',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isOnline ? Colors.green : Colors.grey,
                ),
              ),
              Switch(
                value: isOnline,
                activeThumbColor: Colors.green,
                onChanged: (val) {
                  setState(() {
                    isOnline = val;
                  });
                },
              ),
            ],
          )
        ],
      ),
      body: Stack(
        children: [
          // Carte OpenStreetMap
          FlutterMap(
            options: const MapOptions(
              initialCenter: LatLng(18.0735, -15.9582), // Nouakchott
              initialZoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.sougapp.mobile',
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: const LatLng(18.0735, -15.9582),
                    width: 40,
                    height: 40,
                    child: const Icon(
                      Icons.delivery_dining,
                      color: Colors.blue,
                      size: 40,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Panneau des commandes en attente
          if (isOnline)
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                height: 250,
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, -2))
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 5,
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const Text(
                      'Nouvelles missions à proximité',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ref.watch(availableOrdersStreamProvider).when(
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (err, stack) => Center(child: Text('Erreur: $err')),
                        data: (orders) {
                          if (orders.isEmpty) {
                            return const Center(child: Text('Aucune mission disponible pour le moment.'));
                          }
                          return ListView.builder(
                            itemCount: orders.length,
                            itemBuilder: (context, index) {
                              final order = orders[index];
                              return ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: Colors.blueAccent,
                                  child: Icon(Icons.fastfood, color: Colors.white),
                                ),
                                title: Text('Commande #${order['id'].toString().substring(0, 6)}'),
                                subtitle: Text(order['delivery_address'] ?? 'Adresse inconnue'),
                                trailing: ElevatedButton(
                                  onPressed: () {
                                    ref.read(acceptOrderProvider)(order['id']);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Course acceptée ! Vous êtes en route.')),
                                    );
                                  },
                                  child: const Text('Accepter'),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
          if (!isOnline)
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.white),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Passez en ligne pour recevoir des courses.',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
