import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'checkout_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final cartItems = provider.cartItems;
    final double subtotal = provider.cartSubtotal;
    final double shipping = cartItems.isNotEmpty ? 5.00 : 0.00;
    final double discount = cartItems.isNotEmpty ? 10.00 : 0.00;
    final double grandTotal = (subtotal + shipping - discount).clamp(0.0, double.infinity);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Shopping Cart (${provider.cartCount})',
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        centerTitle: true,
        actions: [
          if (cartItems.isNotEmpty)
            IconButton(
              icon: const Icon(LucideIcons.trash2, color: Color(0xFFEF4444), size: 20),
              tooltip: 'Clear Cart',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    title: Text('Clear Shopping Cart?', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                    content: Text('Are you sure you want to remove all items from your cart?', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 13)),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text('Cancel', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF))),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
                        onPressed: () {
                          provider.clearCart();
                          Navigator.pop(context);
                        },
                        child: Text('Clear All', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.shoppingBag, size: 54, color: Color(0xFF818CF8)),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Your Cart is Empty',
                      style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Explore our store catalog and add items to your cart to begin fast checkout.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF), height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(LucideIcons.store, size: 18),
                      label: Text('Explore Store Products', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            )
          : SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: cartItems.length,
                      itemBuilder: (context, index) {
                        final cartItem = cartItems[index];
                        final item = cartItem.listing;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: provider.cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: provider.cardBorder),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  item.images.isNotEmpty ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
                                  width: 75,
                                  height: 75,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '\$${item.price.toStringAsFixed(0)} each',
                                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF34D399), fontWeight: FontWeight.w700),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        // Quantity Control Box
                                        Container(
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0F172A),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: const Color(0xFF334155)),
                                          ),
                                          child: Row(
                                            children: [
                                              IconButton(
                                                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                                padding: EdgeInsets.zero,
                                                icon: const Icon(LucideIcons.minus, size: 14, color: Colors.white),
                                                onPressed: () => provider.updateCartQuantity(item.id, cartItem.quantity - 1),
                                              ),
                                              Padding(
                                                padding: const EdgeInsets.symmetric(horizontal: 6),
                                                child: Text(
                                                  '${cartItem.quantity}',
                                                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                                ),
                                              ),
                                              IconButton(
                                                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                                padding: EdgeInsets.zero,
                                                icon: const Icon(LucideIcons.plus, size: 14, color: Colors.white),
                                                onPressed: () => provider.updateCartQuantity(item.id, cartItem.quantity + 1),
                                              ),
                                            ],
                                          ),
                                        ),

                                        Text(
                                          '\$${cartItem.totalPrice.toStringAsFixed(2)}',
                                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(LucideIcons.x, color: Color(0xFF9CA3AF), size: 18),
                                onPressed: () => provider.removeFromCart(item.id),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  // Bottom Summary & Checkout Action Bar
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: provider.cardBg,
                      border: Border(top: BorderSide(color: provider.cardBorder)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal', style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF))),
                            Text('\$${subtotal.toStringAsFixed(2)}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Shipping Fee', style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF))),
                            Text('\$${shipping.toStringAsFixed(2)}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Promo Discount', style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF10B981))),
                            Text('-\$${discount.toStringAsFixed(2)}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF10B981))),
                          ],
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Divider(height: 1, color: Color(0xFF334155)),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Total Amount', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF))),
                                Text(
                                  '\$${grandTotal.toStringAsFixed(2)}',
                                  style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                                ),
                              ],
                            ),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(left: 20),
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF10B981),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    elevation: 4,
                                  ),
                                  onPressed: () {
                                    if (cartItems.isNotEmpty) {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (_) => CheckoutScreen(item: cartItems.first.listing)),
                                      );
                                    }
                                  },
                                  icon: const Icon(LucideIcons.arrowRight, size: 18),
                                  label: Text('Checkout Now', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ),
                          ],
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
