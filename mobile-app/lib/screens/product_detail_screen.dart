import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../models/listing.dart';
import '../providers/app_provider.dart';
import 'cart_screen.dart';
import 'chat_screen.dart';
import 'checkout_screen.dart';

class ProductDetailScreen extends StatelessWidget {
  final Listing item;

  const ProductDetailScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isFav = provider.isFavorite(item.id);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      body: SafeArea(
        child: Column(
          children: [
            // Top Media Hero
            Stack(
              children: [
                SizedBox(
                  height: 260,
                  width: double.infinity,
                  child: Image.network(
                    item.images.isNotEmpty ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 260,
                        color: provider.cardBg,
                        child: Center(
                          child: Icon(LucideIcons.package, color: provider.subtextColor, size: 48),
                        ),
                      );
                    },
                  ),
                ),
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.black.withOpacity(0.6),
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: Colors.black.withOpacity(0.6),
                            child: IconButton(
                              icon: Icon(
                                isFav ? Icons.favorite : Icons.favorite_border,
                                color: isFav ? Colors.red : Colors.white,
                              ),
                              onPressed: () => provider.toggleFavorite(item.id),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Stack(
                            children: [
                              CircleAvatar(
                                backgroundColor: Colors.black.withOpacity(0.6),
                                child: IconButton(
                                  icon: const Icon(LucideIcons.shoppingCart, color: Colors.white, size: 20),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const CartScreen()),
                                    );
                                  },
                                ),
                              ),
                              if (provider.cartCount > 0)
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFEF4444),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Text(
                                      '${provider.cartCount}',
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.checkCircle2, size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          'STORE ITEM',
                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Content Area
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '\$${item.price.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'In Stock: ${item.stockQuantity} Units',
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF34D399)),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),
                    Text(
                      item.title,
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                    ),

                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(LucideIcons.mapPin, size: 14, color: provider.subtextColor),
                        const SizedBox(width: 4),
                        Text(
                          item.locationAddress,
                          style: GoogleFonts.inter(fontSize: 12, color: provider.subtextColor),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Seller Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: provider.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: provider.cardBorder),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundImage: NetworkImage(item.sellerAvatar),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      item.sellerName,
                                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(LucideIcons.checkCircle2, size: 14, color: Color(0xFF818CF8)),
                                  ],
                                ),
                                Text(
                                  '4.9 ★ • Official Store Verified',
                                  style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFFBBF24)),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: provider.chipBg,
                              foregroundColor: provider.textColor,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatScreen(sellerName: item.sellerName, itemTitle: item.title),
                                ),
                              );
                            },
                            icon: const Icon(LucideIcons.messageSquare, size: 14),
                            label: Text('Contact', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                          )
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                    Text(
                      'Description & Specifications',
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.description,
                      style: GoogleFonts.inter(fontSize: 13, color: provider.subtextColor, height: 1.5),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Action Bar
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: provider.cardBg,
                border: Border(top: BorderSide(color: provider.cardBorder)),
              ),
              child: Row(
                children: [
                  // Add to Cart Button
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF818CF8),
                        side: const BorderSide(color: Color(0xFF818CF8)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        provider.addToCart(item);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(LucideIcons.shoppingBag, color: Colors.white, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    '🛒 "${item.title}" added to cart!',
                                    style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            backgroundColor: const Color(0xFF6366F1),
                            action: SnackBarAction(
                              label: 'VIEW CART',
                              textColor: Colors.white,
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const CartScreen()),
                                );
                              },
                            ),
                            duration: const Duration(seconds: 3),
                          ),
                        );
                      },
                      icon: const Icon(LucideIcons.shoppingCart, size: 16),
                      label: Text('Add to Cart', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Buy Now Button
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 4,
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => CheckoutScreen(item: item)),
                        );
                      },
                      child: Text('⚡ Buy Now', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );

  }
}
