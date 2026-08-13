import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../models/listing.dart';
import '../providers/app_provider.dart';
import 'cart_screen.dart';
import 'product_detail_screen.dart';
import 'profile_options_screens.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _offerPageController = PageController();
  int _activeBannerIndex = 0;
  Timer? _offerTimer;

  final List<Map<String, dynamic>> offers = const [
    {
      'tag': '⚡ LIMITED TIME OFFER',
      'title': 'MEGA SALE - UP TO 40% OFF',
      'subtitle': 'Discount on Electronics & Gadgets this week!',
      'code': 'TECH40',
      'colors': [Color(0xFF4F46E5), Color(0xFF7C3AED), Color(0xFFEC4899)],
      'icon': LucideIcons.zap,
    },
    {
      'tag': '🚚 EXPRESS DELIVERY',
      'title': 'FREE SHIPPING ON ORDERS > \$50',
      'subtitle': 'Fast 2-day delivery guaranteed across islandwide',
      'code': 'FREESHIP',
      'colors': [Color(0xFF059669), Color(0xFF10B981), Color(0xFF3B82F6)],
      'icon': LucideIcons.truck,
    },
    {
      'tag': '🔥 STORE SPOTLIGHT',
      'title': 'NEW ARRIVALS 2026',
      'subtitle': 'Verified items from official sellers added daily',
      'code': 'STORE2026',
      'colors': [Color(0xFFD97706), Color(0xFFF59E0B), Color(0xFFEF4444)],
      'icon': LucideIcons.flame,
    },
  ];

  final List<Map<String, dynamic>> categories = const [
    {'id': 'All', 'name': 'All', 'icon': LucideIcons.layers, 'color': Color(0xFF818CF8)},
    {'id': 'electronics', 'name': 'Electronics', 'icon': LucideIcons.cpu, 'color': Color(0xFF6366F1)},
    {'id': 'fashion', 'name': 'Fashion', 'icon': LucideIcons.shoppingBag, 'color': Color(0xFFEC4899)},
    {'id': 'groceries', 'name': 'Groceries', 'icon': LucideIcons.apple, 'color': Color(0xFF10B981)},
    {'id': 'furniture', 'name': 'Furniture', 'icon': LucideIcons.sofa, 'color': Color(0xFFF59E0B)},
  ];

  @override
  void initState() {
    super.initState();
    _startOfferAutoSlide();
  }

  void _startOfferAutoSlide() {
    _offerTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_offerPageController.hasClients) {
        final nextPage = (_activeBannerIndex + 1) % offers.length;
        _offerPageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _offerTimer?.cancel();
    _offerPageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return SafeArea(
      child: Column(
        children: [
          // 1. App Top Header with Brand Name & Actions
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(LucideIcons.shoppingBag, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'MARKETPLACE',
                              style: GoogleFonts.inter(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'PRO',
                                style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Discover & Buy Premium Products',
                          style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF), fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ],
                ),

                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: IconButton(
                        icon: const Icon(LucideIcons.bell, size: 18, color: Colors.white),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('🔔 You have 2 new promo notifications!'),
                              backgroundColor: Color(0xFF6366F1),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Stack(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.06),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: IconButton(
                            icon: Icon(
                              provider.favorites.isNotEmpty ? Icons.favorite : LucideIcons.heart,
                              size: 18,
                              color: const Color(0xFFEC4899),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                              );
                            },
                          ),
                        ),
                        if (provider.favorites.isNotEmpty)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Color(0xFFEC4899),
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                '${provider.favorites.length}',
                                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Stack(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.06),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: IconButton(
                            icon: const Icon(LucideIcons.shoppingCart, size: 18, color: Color(0xFF818CF8)),
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

          // 2. Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search, size: 18, color: Color(0xFF9CA3AF)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Search items, categories, brands...',
                      style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(LucideIcons.slidersHorizontal, size: 14, color: Color(0xFF818CF8)),
                  ),
                ],
              ),
            ),
          ),

          // 3. Main Scrollable Content Area
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 8),

                // 🌟 TOP PROMOTIONAL OFFERS BANNER SLIDER 🌟
                SizedBox(
                  height: 150,
                  child: PageView.builder(
                    controller: _offerPageController,
                    onPageChanged: (index) {
                      setState(() => _activeBannerIndex = index);
                    },
                    itemCount: offers.length,
                    itemBuilder: (context, index) {
                      final offer = offers[index];
                      final List<Color> bannerColors = offer['colors'];
                      return Container(
                        margin: const EdgeInsets.only(right: 2),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: bannerColors,
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: bannerColors.first.withValues(alpha: 0.35),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(offer['icon'] as IconData, size: 11, color: Colors.white),
                                        const SizedBox(width: 4),
                                        Text(
                                          offer['tag'],
                                          style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    offer['title'],
                                    style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    offer['subtitle'],
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(fontSize: 11, color: Colors.white.withValues(alpha: 0.9)),
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'Code: ${offer['code']}',
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: bannerColors.first),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: bannerColors.first,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                elevation: 4,
                              ),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('🎉 Promo Code ${offer['code']} applied to your cart!'),
                                    backgroundColor: bannerColors.first,
                                  ),
                                );
                              },
                              child: Text('Claim Now', style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 11)),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 8),
                // Offer Banner Dots Indicator
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    offers.length,
                    (index) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: _activeBannerIndex == index ? 18 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: _activeBannerIndex == index ? const Color(0xFF6366F1) : const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Categories Header & Horizontal Filter Chips
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Browse Categories', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text('View All', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF818CF8), fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final cat = categories[index];
                      final isSelected = provider.selectedCategory.toLowerCase() == cat['id'].toString().toLowerCase();
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          selected: isSelected,
                          selectedColor: const Color(0xFF6366F1),
                          backgroundColor: const Color(0xFF1E293B),
                          side: BorderSide(color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF334155)),
                          avatar: Icon(cat['icon'] as IconData, size: 14, color: isSelected ? Colors.white : cat['color']),
                          label: Text(
                            cat['name'],
                            style: GoogleFonts.inter(
                              color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                          ),
                          onSelected: (_) => provider.setCategory(cat['id']),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 22),

                // Items Section Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(LucideIcons.sparkles, size: 18, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 6),
                        Text('Featured Store Items', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    Text(
                      '${provider.filteredListings.length} items available',
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF9CA3AF), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (provider.filteredListings.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      children: [
                        const Icon(LucideIcons.database, size: 44, color: Color(0xFF818CF8)),
                        const SizedBox(height: 12),
                        Text('Only Real DB Data Mode Active', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 6),
                        Text('No store items found in MongoDB for this filter.', textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF))),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: () => provider.loadStoreItems(),
                          icon: const Icon(LucideIcons.refreshCw, size: 14),
                          label: Text('Fetch MongoDB Database Records', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ],
                    ),
                  )
                else
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.88,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: provider.filteredListings.length,
                    itemBuilder: (context, index) {
                      final item = provider.filteredListings[index];
                      return _buildListingCard(context, item, provider);
                    },
                  ),

                const SizedBox(height: 28),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListingCard(BuildContext context, Listing item, AppProvider provider) {
    final isFav = provider.isFavorite(item.id);
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ProductDetailScreen(item: item)),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF334155).withValues(alpha: 0.8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image flexibly expands to fill top area
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      item.images.isNotEmpty ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: const Color(0xFF334155),
                          child: const Center(
                            child: Icon(LucideIcons.package, color: Color(0xFF9CA3AF), size: 36),
                          ),
                        );
                      },
                    ),

                    // Top Left Condition Badge
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                          ),
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.3),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Text(
                          item.condition.toUpperCase(),
                          style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5),
                        ),
                      ),
                    ),

                    // Top Right Favorite & Quick Add to Cart Buttons
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.6),
                              shape: BoxShape.circle,
                            ),
                            child: IconButton(
                              padding: EdgeInsets.zero,
                              icon: Icon(
                                isFav ? Icons.favorite : Icons.favorite_border,
                                size: 15,
                                color: isFav ? const Color(0xFFEF4444) : Colors.white,
                              ),
                              onPressed: () => provider.toggleFavorite(item.id),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF6366F1).withOpacity(0.4),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                            child: IconButton(
                              padding: EdgeInsets.zero,
                              icon: const Icon(LucideIcons.shoppingCart, size: 14, color: Colors.white),
                              onPressed: () {
                                provider.addToCart(item);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('🛒 "${item.title}" added to cart!'),
                                    backgroundColor: const Color(0xFF6366F1),
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Bottom Left Rating Tag
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star, size: 11, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 3),
                            Text(
                              '4.9',
                              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Product Details Footer
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      item.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white, height: 1.2),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(LucideIcons.mapPin, size: 11, color: Color(0xFF9CA3AF)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            item.locationAddress,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          '\$${item.price.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            '${item.stockQuantity} left',
                            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFFFBBF24)),
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
      ),
    );
  }
}
