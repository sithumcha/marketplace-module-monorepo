import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../models/listing.dart';
import '../providers/app_provider.dart';
import '../providers/locale_provider.dart';
import '../services/api_service.dart';
import 'cart_screen.dart';
import 'create_listing_screen.dart';
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
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  List<Map<String, dynamic>> _dynamicOffers = [];

  final List<Map<String, dynamic>> defaultOffers = const [
    {
      'tag': 'LIMITED TIME OFFER',
      'title': 'MEGA SALE - UP TO 40% OFF',
      'subtitle': 'Discount on Electronics & Gadgets this week!',
      'code': 'TECH40',
      'colors': [Color(0xFF4F46E5), Color(0xFF7C3AED), Color(0xFFEC4899)],
      'icon': LucideIcons.zap,
    },
    {
      'tag': 'EXPRESS DELIVERY',
      'title': 'FREE SHIPPING ON ORDERS > \$50',
      'subtitle': 'Fast 2-day delivery guaranteed islandwide',
      'code': 'FREESHIP',
      'colors': [Color(0xFF059669), Color(0xFF10B981), Color(0xFF3B82F6)],
      'icon': LucideIcons.truck,
    },
    {
      'tag': 'STORE SPOTLIGHT',
      'title': 'NEW ARRIVALS 2026',
      'subtitle': 'Verified items from official sellers added daily',
      'code': 'STORE2026',
      'colors': [Color(0xFFD97706), Color(0xFFF59E0B), Color(0xFFEF4444)],
      'icon': LucideIcons.flame,
    },
  ];

  List<Map<String, dynamic>> get currentOffers => _dynamicOffers.isNotEmpty ? _dynamicOffers : defaultOffers;

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
    _fetchPromos();
    _startOfferAutoSlide();
  }

  Future<void> _fetchPromos() async {
    final promos = await ApiService.fetchPromoCodes();
    if (mounted && promos.isNotEmpty) {
      final List<List<Color>> colorSets = [
        const [Color(0xFF4F46E5), Color(0xFF7C3AED), Color(0xFFEC4899)],
        const [Color(0xFF059669), Color(0xFF10B981), Color(0xFF3B82F6)],
        const [Color(0xFFD97706), Color(0xFFF59E0B), Color(0xFFEF4444)],
        const [Color(0xFF8B5CF6), Color(0xFFEC4899), Color(0xFFF43F5E)],
      ];
      final List<IconData> iconSets = [
        LucideIcons.zap,
        LucideIcons.percent,
        LucideIcons.flame,
        LucideIcons.gift,
        LucideIcons.sparkles,
      ];

      setState(() {
        _dynamicOffers = promos.asMap().entries.map((entry) {
          final idx = entry.key;
          final p = entry.value;
          final discountVal = p['discountValue'] ?? 10;
          final discountType = p['discountType'] == 'percentage' ? '% OFF' : ' RS OFF';
          return {
            'tag': 'PROMO CODE',
            'title': '${p['title'] ?? 'ADMIN PROMO'} - $discountVal$discountType',
            'subtitle': p['description'] ?? 'Use discount code at checkout!',
            'code': p['code'] ?? 'SAVE10',
            'colors': colorSets[idx % colorSets.length],
            'icon': iconSets[idx % iconSets.length],
          };
        }).toList();
      });
    }
  }

  void _startOfferAutoSlide() {
    _offerTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_offerPageController.hasClients) {
        final listLen = currentOffers.length;
        if (listLen > 0) {
          final nextPage = (_activeBannerIndex + 1) % listLen;
          _offerPageController.animateToPage(
            nextPage,
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeInOutCubic,
          );
        }
      }
    });
  }

  @override
  void dispose() {
    _offerTimer?.cancel();
    _offerPageController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    // Dynamic search filtering over MongoDB backend listings
    final List<Listing> displayListings = provider.filteredListings.where((item) {
      if (_searchQuery.isEmpty) return true;
      return item.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
             item.category.toLowerCase().contains(_searchQuery.toLowerCase()) ||
             item.description.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Top App Header Bar
            _buildTopHeader(context, provider),

            // 2. Search & Filter Bar
            _buildSearchBar(context, provider),

            // 3. Scrollable Main Body
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  const SizedBox(height: 8),

                  // Promotional Banner Carousel
                  _buildPromoBannerCarousel(context),

                  const SizedBox(height: 10),

                  // Carousel Dots Indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      currentOffers.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: _activeBannerIndex == index ? 22 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: _activeBannerIndex == index ? const Color(0xFF4F46E5) : const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Categories Section
                  _buildCategoriesSection(context, provider),

                  const SizedBox(height: 20),

                  // Featured Store Items Section
                  _buildFeaturedItemsHeader(context, provider, displayListings.length),

                  const SizedBox(height: 12),

                  // Real MongoDB Data Product Grid
                  if (displayListings.isEmpty)
                    _buildEmptyState(context, provider)
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.76,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: displayListings.length,
                      itemBuilder: (context, index) {
                        final item = displayListings[index];
                        return _buildProductCard(context, item, provider, index);
                      },
                    ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }


  // 1. Top Header Component
  Widget _buildTopHeader(BuildContext context, AppProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo & Brand Name
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.35),
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
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: provider.textColor,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF10B981), Color(0xFF0D9488)],
                          ),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          'PRO',
                          style: GoogleFonts.plusJakartaSans(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Discover & Buy Premium Products',
                    style: GoogleFonts.plusJakartaSans(fontSize: 10, color: provider.subtextColor, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),

          // Header Quick Actions
          Row(
            children: [
              // Language Switcher
              InkWell(
                onTap: () {
                  final localeProv = Provider.of<LocaleProvider>(context, listen: false);
                  localeProv.toggleLanguage();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('🌐 Switched to ${localeProv.isSinhala ? "English" : "සිංහල"}'),
                      duration: const Duration(seconds: 1),
                      backgroundColor: const Color(0xFF4F46E5),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: provider.cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: provider.cardBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.globe, size: 13, color: Color(0xFF4F46E5)),
                      const SizedBox(width: 4),
                      Text(
                        Provider.of<LocaleProvider>(context).getText('langToggle'),
                        style: GoogleFonts.plusJakartaSans(fontSize: 10, fontWeight: FontWeight.bold, color: provider.textColor),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 6),

              // Notifications
              _buildHeaderIconButton(
                provider: provider,
                icon: LucideIcons.bell,
                hasBadge: true,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('🔔 You have 2 new notifications!'), backgroundColor: Color(0xFF4F46E5)),
                  );
                },
              ),

              const SizedBox(width: 6),

              // Favorites
              _buildHeaderIconButton(
                provider: provider,
                icon: provider.favorites.isNotEmpty ? Icons.favorite : LucideIcons.heart,
                iconColor: const Color(0xFFF43F5E),
                count: provider.favorites.length,
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const FavoritesScreen()));
                },
              ),

              const SizedBox(width: 6),

              // Shopping Cart
              _buildHeaderIconButton(
                provider: provider,
                icon: LucideIcons.shoppingCart,
                iconColor: const Color(0xFF4F46E5),
                count: provider.cartCount,
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderIconButton({
    required AppProvider provider,
    required IconData icon,
    Color? iconColor,
    int count = 0,
    bool hasBadge = false,
    required VoidCallback onTap,
  }) {
    return Stack(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: provider.cardBg,
            shape: BoxShape.circle,
            border: Border.all(color: provider.cardBorder),
          ),
          child: IconButton(
            padding: EdgeInsets.zero,
            icon: Icon(icon, size: 17, color: iconColor ?? provider.textColor),
            onPressed: onTap,
          ),
        ),
        if (hasBadge)
          Positioned(
            right: 2,
            top: 2,
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(color: Color(0xFFF43F5E), shape: BoxShape.circle),
            ),
          ),
        if (count > 0)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(color: Color(0xFF4F46E5), shape: BoxShape.circle),
              child: Text(
                '$count',
                style: GoogleFonts.plusJakartaSans(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
      ],
    );
  }

  // 2. Search & Filter Bar Component
  Widget _buildSearchBar(BuildContext context, AppProvider provider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: provider.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: provider.cardBorder),
              ),
              child: Row(
                children: [
                  Icon(LucideIcons.search, size: 18, color: provider.subtextColor),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: GoogleFonts.plusJakartaSans(fontSize: 13, color: provider.textColor),
                      decoration: InputDecoration(
                        hintText: 'Search items, categories, brands...',
                        hintStyle: GoogleFonts.plusJakartaSans(fontSize: 13, color: provider.subtextColor),
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      onChanged: (val) {
                        setState(() => _searchQuery = val);
                      },
                    ),
                  ),
                  Icon(LucideIcons.mic, size: 16, color: provider.subtextColor),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: provider.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: provider.cardBorder),
            ),
            child: IconButton(
              icon: const Icon(LucideIcons.slidersHorizontal, size: 18, color: Color(0xFF4F46E5)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('⚡ Filter options active!')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // 3. Promotional Banner Carousel Component
  Widget _buildPromoBannerCarousel(BuildContext context) {
    final list = currentOffers;
    return SizedBox(
      height: 156,
      child: PageView.builder(
        controller: _offerPageController,
        onPageChanged: (index) {
          setState(() => _activeBannerIndex = index);
        },
        itemCount: list.length,
        itemBuilder: (context, index) {
          final offer = list[index];
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
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: bannerColors.first.withOpacity(0.35),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.22),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(offer['icon'] as IconData, size: 11, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            offer['tag'],
                            style: GoogleFonts.plusJakartaSans(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      offer['title'],
                      style: GoogleFonts.plusJakartaSans(fontSize: 17, fontWeight: FontWeight.w900, color: Colors.white, height: 1.1),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      offer['subtitle'],
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(fontSize: 11, color: Colors.white.withOpacity(0.9)),
                    ),
                  ],
                ),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.amber.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.ticket, size: 12, color: Colors.amber),
                          const SizedBox(width: 5),
                          Text(
                            'Code: ${offer['code']}',
                            style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        elevation: 3,
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('🎉 Promo Code "${offer['code']}" Copied & Ready!'),
                            backgroundColor: bannerColors.first,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Text('Claim Now →', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 4. Categories Section Component
  Widget _buildCategoriesSection(BuildContext context, AppProvider provider) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Browse Categories',
              style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor),
            ),
            Text(
              'View All →',
              style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF4F46E5), fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 42,
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
                  selectedColor: const Color(0xFF4F46E5),
                  backgroundColor: provider.chipBg,
                  side: BorderSide(color: isSelected ? const Color(0xFF4F46E5) : provider.cardBorder),
                  avatar: Icon(cat['icon'] as IconData, size: 14, color: isSelected ? Colors.white : cat['color']),
                  label: Text(
                    cat['name'],
                    style: GoogleFonts.plusJakartaSans(
                      color: isSelected ? Colors.white : provider.textColor,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                  onSelected: (_) => provider.setCategory(cat['id']),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // 5. Featured Items Header Component
  Widget _buildFeaturedItemsHeader(BuildContext context, AppProvider provider, int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            const Text('✨', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 4),
            Text(
              'Featured Store Items',
              style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: provider.chipBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '$count items available',
            style: GoogleFonts.plusJakartaSans(fontSize: 10, color: provider.subtextColor, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  // Product Card Component (Real MongoDB Backend Data Only)
  Widget _buildProductCard(BuildContext context, Listing item, AppProvider provider, int index) {
    final isFav = provider.isFavorite(item.id);
    final String tagLabel = index % 4 == 0 ? 'NEW' : index % 4 == 1 ? 'HOT' : index % 4 == 2 ? 'POPULAR' : 'SALE';
    final Color tagColor = index % 4 == 0 ? const Color(0xFF4F46E5) : index % 4 == 1 ? const Color(0xFFF43F5E) : index % 4 == 2 ? const Color(0xFFF59E0B) : const Color(0xFF10B981);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ProductDetailScreen(item: item)),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: provider.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: provider.cardBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image Container
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    child: Image.network(
                      item.images.isNotEmpty ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: provider.chipBg,
                          child: Center(
                            child: Icon(LucideIcons.package, color: provider.subtextColor, size: 36),
                          ),
                        );
                      },
                    ),
                  ),

                  // Top Badges
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: tagColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tagLabel,
                        style: GoogleFonts.plusJakartaSans(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                  ),

                  // Top Right Wishlist & Cart Action Buttons
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => provider.toggleFavorite(item.id),
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.5),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isFav ? Icons.favorite : Icons.favorite_border,
                              size: 14,
                              color: isFav ? const Color(0xFFF43F5E) : Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () {
                            provider.addToCart(item);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('🛒 "${item.title}" added to cart!'),
                                backgroundColor: const Color(0xFF4F46E5),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: const BoxDecoration(
                              color: Color(0xFF4F46E5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.shoppingCart, size: 13, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Floating Star Rating Badge
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star, size: 10, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 2),
                          Text(
                            '4.9',
                            style: GoogleFonts.plusJakartaSans(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
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
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold, color: provider.textColor),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(LucideIcons.mapPin, size: 11, color: provider.subtextColor),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          item.locationAddress.isNotEmpty ? item.locationAddress : 'Colombo, Sri Lanka',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(fontSize: 10, color: provider.subtextColor),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'LKR ${item.price.toStringAsFixed(0)}',
                        style: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w900, color: const Color(0xFF10B981)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${item.stockQuantity} left',
                          style: GoogleFonts.plusJakartaSans(fontSize: 9, fontWeight: FontWeight.bold, color: const Color(0xFFD97706)),
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

  Widget _buildEmptyState(BuildContext context, AppProvider provider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: provider.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: provider.cardBorder),
      ),
      child: Column(
        children: [
          const Icon(LucideIcons.database, size: 40, color: Color(0xFF4F46E5)),
          const SizedBox(height: 10),
          Text(
            'Only Real DB Data Mode Active',
            style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
          ),
          const SizedBox(height: 4),
          Text(
            'No store items found in MongoDB for this filter.',
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(fontSize: 11, color: provider.subtextColor),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4F46E5),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            ),
            onPressed: () => provider.loadStoreItems(),
            icon: const Icon(LucideIcons.refreshCw, size: 14),
            label: Text('Reload MongoDB Data', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
