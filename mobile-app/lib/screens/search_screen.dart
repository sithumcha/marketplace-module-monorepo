import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../providers/locale_provider.dart';
import '../models/listing.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  RangeValues _priceRange = const RangeValues(0, 5000);
  String _selectedSort = 'Newest';
  String _selectedCat = 'All';

  final List<String> _sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Highest Rated'];
  final List<String> _categories = ['All', 'Electronics', 'Fashion', 'Groceries', 'Furniture', 'Vehicles'];

  void _openFilterDrawer() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final localeProvider = context.watch<LocaleProvider>();
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        localeProvider.getText('filterTitle'),
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Price Range Slider
                  Text(
                    '${localeProvider.getText('priceRange')}: \$${_priceRange.start.round()} - \$${_priceRange.end.round()}',
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                  ),
                  RangeSlider(
                    values: _priceRange,
                    min: 0,
                    max: 5000,
                    divisions: 50,
                    activeColor: const Color(0xFF6366F1),
                    inactiveColor: const Color(0xFF334155),
                    onChanged: (values) {
                      setModalState(() => _priceRange = values);
                      setState(() {});
                    },
                  ),
                  const SizedBox(height: 16),

                  // Sort By Selection
                  Text(
                    localeProvider.getText('sortBy'),
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: _sortOptions.map((option) {
                      final isSel = _selectedSort == option;
                      return ChoiceChip(
                        label: Text(option),
                        selected: isSel,
                        selectedColor: const Color(0xFF6366F1),
                        backgroundColor: const Color(0xFF0F172A),
                        labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF9CA3AF), fontSize: 12),
                        onSelected: (_) {
                          setModalState(() => _selectedSort = option);
                          setState(() {});
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(localeProvider.getText('applyFilter'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final localeProvider = context.watch<LocaleProvider>();

    List<Listing> filtered = appProvider.listings.where((item) {
      final matchesSearch = item.title.toLowerCase().contains(_searchController.text.toLowerCase());
      final matchesCat = _selectedCat == 'All' || item.category.toLowerCase() == _selectedCat.toLowerCase();
      final matchesPrice = item.price >= _priceRange.start && item.price <= _priceRange.end;
      return matchesSearch && matchesCat && matchesPrice;
    }).toList();

    if (_selectedSort == 'Price: Low to High') {
      filtered.sort((a, b) => a.price.compareTo(b.price));
    } else if (_selectedSort == 'Price: High to Low') {
      filtered.sort((a, b) => b.price.compareTo(a.price));
    }

    return Scaffold(
      backgroundColor: appProvider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: appProvider.cardBg,
        elevation: 0,
        title: Text(localeProvider.getText('search'), style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.slidersHorizontal, color: Color(0xFF818CF8)),
            onPressed: _openFilterDrawer,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Input Bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white),
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: localeProvider.getText('searchPlaceholder'),
                        hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
                        prefixIcon: const Icon(LucideIcons.search, color: Color(0xFF6366F1)),
                        filled: true,
                        fillColor: appProvider.cardBg,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Category Filter Pills
            SizedBox(
              height: 38,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSel = _selectedCat == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(cat),
                      selected: isSel,
                      selectedColor: const Color(0xFF6366F1),
                      backgroundColor: appProvider.cardBg,
                      labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF9CA3AF), fontSize: 12),
                      onSelected: (_) => setState(() => _selectedCat = cat),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),

            // Filtered Items List
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: Text('No items match your search filters.', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF))),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final item = filtered[index];
                        return Card(
                          color: appProvider.cardBg,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: appProvider.cardBorder)),
                          child: ListTile(
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                item.images.isNotEmpty ? item.images.first : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
                                width: 50,
                                height: 50,
                                fit: BoxFit.cover,
                              ),
                            ),
                            title: Text(item.title, style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
                            subtitle: Text('\$${item.price.toStringAsFixed(2)} • ${item.category}', style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold)),
                            trailing: IconButton(
                              icon: const Icon(LucideIcons.shoppingBag, color: Color(0xFF818CF8)),
                              onPressed: () {
                                appProvider.addToCart(item);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Added ${item.title} to Cart!'), backgroundColor: const Color(0xFF10B981)),
                                );
                              },
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
