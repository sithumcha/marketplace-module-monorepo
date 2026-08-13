import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/listing.dart';

class CreateListingScreen extends StatefulWidget {
  const CreateListingScreen({super.key});

  @override
  State<CreateListingScreen> createState() => _CreateListingScreenState();
}

class _CreateListingScreenState extends State<CreateListingScreen> {
  int _currentStep = 0;
  bool _isPublishing = false;

  // Form Fields
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController(text: '5');
  final _imageUrlController = TextEditingController(
    text: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  );
  final _locationController = TextEditingController(text: 'Colombo 03, Sri Lanka');

  String _selectedCategory = 'Electronics';
  String _selectedCondition = 'Brand New';
  bool _isNegotiable = true;
  bool _isStoreItem = true;

  final List<String> _categories = [
    'Electronics',
    'Fashion',
    'Groceries',
    'Furniture',
    'Vehicles',
    'Business Directory',
  ];

  final List<String> _conditions = ['Brand New', 'Like New', 'Used - Good', 'Refurbished'];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    _imageUrlController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _publishListing() async {
    if (_titleController.text.trim().isEmpty || _priceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter item title and price'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isPublishing = true);

    final double price = double.tryParse(_priceController.text.trim()) ?? 0.0;
    final int stock = int.tryParse(_stockController.text.trim()) ?? 1;

    final newListing = Listing(
      id: 'LIST-${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      description: _descController.text.trim().isEmpty
          ? 'High-quality item listed for sale on Marketplace Pro.'
          : _descController.text.trim(),
      category: _selectedCategory,
      price: price,
      stockQuantity: stock,
      condition: _selectedCondition,
      isNegotiable: _isNegotiable,
      isStoreItem: _isStoreItem,
      storeBadge: 'Verified Seller',
      images: [_imageUrlController.text.trim()],
      locationAddress: _locationController.text.trim(),
      sellerName: context.read<AppProvider>().userName,
      sellerAvatar: context.read<AppProvider>().userAvatar,
      status: 'active',
    );

    // Add to provider state
    final provider = context.read<AppProvider>();
    provider.addListing(newListing);

    setState(() => _isPublishing = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: const [
            Icon(Icons.check_circle, color: Colors.white),
            SizedBox(width: 10),
            Text('🎉 Listing successfully published & live on Marketplace!'),
          ],
        ),
        backgroundColor: const Color(0xFF10B981),
      ),
    );

    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Create New Listing Wizard',
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Bar Steps Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              color: provider.cardBg,
              child: Row(
                children: List.generate(5, (index) {
                  final isActive = index <= _currentStep;
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF6366F1) : const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildStepContent(provider),
              ),
            ),

            // Step Navigation Footer Controls
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: provider.cardBg,
                border: Border(top: BorderSide(color: provider.cardBorder)),
              ),
              child: Row(
                children: [
                  if (_currentStep > 0)
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: provider.cardBorder),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                      onPressed: () => setState(() => _currentStep--),
                      child: const Text('Back'),
                    ),
                  const Spacer(),
                  if (_currentStep < 4)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => setState(() => _currentStep++),
                      child: const Text('Next Step ➔', style: TextStyle(fontWeight: FontWeight.bold)),
                    )
                  else
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _isPublishing ? null : _publishListing,
                      child: _isPublishing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('🚀 Publish Listing Now', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(AppProvider provider) {
    switch (_currentStep) {
      case 0:
        return _buildStep1Category(provider);
      case 1:
        return _buildStep2Photos(provider);
      case 2:
        return _buildStep3Details(provider);
      case 3:
        return _buildStep4Preferences(provider);
      case 4:
        return _buildStep5Preview(provider);
      default:
        return const SizedBox();
    }
  }

  Widget _buildStep1Category(AppProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 1: Select Item Category',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Choose the best category for your product to maximize visibility.',
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
        ),
        const SizedBox(height: 20),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 2.2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: _categories.length,
          itemBuilder: (context, index) {
            final cat = _categories[index];
            final isSelected = _selectedCategory == cat;
            return GestureDetector(
              onTap: () => setState(() => _selectedCategory = cat),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.2) : provider.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF6366F1) : provider.cardBorder,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      isSelected ? Icons.check_circle : Icons.category_outlined,
                      color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF9CA3AF),
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        cat,
                        style: GoogleFonts.inter(
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: isSelected ? Colors.white : const Color(0xFFE2E8F0),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildStep2Photos(AppProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 2: Add Product Images',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'High-resolution photos convert 3x faster on Marketplace.',
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _imageUrlController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Image Web URL / CDN Link',
            labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
            prefixIcon: const Icon(Icons.image, color: Color(0xFF6366F1)),
            filled: true,
            fillColor: provider.cardBg,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 20),
        Text('Image Preview:', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 10),
        Container(
          height: 200,
          width: double.infinity,
          decoration: BoxDecoration(
            color: provider.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: provider.cardBorder),
            image: DecorationImage(
              image: NetworkImage(_imageUrlController.text),
              fit: BoxFit.cover,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3Details(AppProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 3: Item Title & Pricing',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _titleController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Item Title (e.g. Sony WH-1000XM5 Wireless Headphones)',
            labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
            filled: true,
            fillColor: provider.cardBg,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _priceController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Price (USD)',
                  prefixText: '\$ ',
                  labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                  filled: true,
                  fillColor: provider.cardBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _stockController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Stock Qty',
                  labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                  filled: true,
                  fillColor: provider.cardBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text('Item Condition:', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: _conditions.map((cond) {
            final isSelected = _selectedCondition == cond;
            return ChoiceChip(
              label: Text(cond),
              selected: isSelected,
              selectedColor: const Color(0xFF6366F1),
              backgroundColor: provider.cardBg,
              labelStyle: TextStyle(color: isSelected ? Colors.white : const Color(0xFF9CA3AF)),
              onSelected: (_) => setState(() => _selectedCondition = cond),
            );
          }).toList(),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _descController,
          maxLines: 3,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Product Description & Features',
            labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
            filled: true,
            fillColor: provider.cardBg,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep4Preferences(AppProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 4: Options & Location',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 20),
        SwitchListTile(
          value: _isNegotiable,
          title: const Text('Allow Price Offers / Negotiation', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          subtitle: const Text('Buyers can submit counter offers in chat', style: TextStyle(color: Color(0xFF9CA3AF))),
          activeThumbColor: const Color(0xFF6366F1),
          onChanged: (val) => setState(() => _isNegotiable = val),
        ),
        SwitchListTile(
          value: _isStoreItem,
          title: const Text('Display Verified Seller Badge', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          subtitle: const Text('Boost trust badge on listing card', style: TextStyle(color: Color(0xFF9CA3AF))),
          activeThumbColor: const Color(0xFF10B981),
          onChanged: (val) => setState(() => _isStoreItem = val),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _locationController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Pickup Location / City',
            prefixIcon: const Icon(Icons.location_on, color: Color(0xFFEF4444)),
            filled: true,
            fillColor: provider.cardBg,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep5Preview(AppProvider provider) {
    final double price = double.tryParse(_priceController.text) ?? 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 5: Review & Confirm Listing',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Here is how your product will look to buyers on Marketplace Pro.',
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
        ),
        const SizedBox(height: 20),

        // Live Card Preview
        Container(
          decoration: BoxDecoration(
            color: provider.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: provider.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  _imageUrlController.text,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(height: 180, color: Colors.grey),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _selectedCategory,
                            style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        Text(
                          '\$${price.toStringAsFixed(2)}',
                          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _titleController.text.isEmpty ? 'Sample Product Title' : _titleController.text,
                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '📍 ${_locationController.text} • Stock: ${_stockController.text} pcs',
                      style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
