import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../models/listing.dart';
import '../providers/app_provider.dart';
import '../services/invoice_service.dart';

class CheckoutScreen extends StatefulWidget {
  final Listing item;

  const CheckoutScreen({super.key, required this.item});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _quantity = 1;
  String _paymentMethod = 'card'; // 'card', 'cod', 'wallet'
  String _shippingOption = 'standard'; // 'standard', 'express'
  bool _isProcessing = false;

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;

  final TextEditingController _cardNumberController = TextEditingController(text: '4532 8901 2345 8892');
  final TextEditingController _cardExpiryController = TextEditingController(text: '12/28');
  final TextEditingController _cardCvvController = TextEditingController(text: '892');
  final TextEditingController _cardHolderController = TextEditingController(text: 'SITHUM NETHSARA');
  bool _saveCard = true;

  // Promo Code State
  final TextEditingController _promoController = TextEditingController();
  double _appliedDiscount = 0.0;
  String? _promoMessage;
  bool _isPromoApplied = false;

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<AppProvider>(context, listen: false);
    _nameController = TextEditingController(text: provider.userName);
    _phoneController = TextEditingController(text: provider.userPhone);
    _addressController = TextEditingController(text: 'No. 45, Galle Road, Colombo 03');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cardNumberController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    _cardHolderController.dispose();
    _promoController.dispose();
    super.dispose();
  }

  double get _itemTotal => widget.item.price * _quantity;
  double get _shippingFee => _shippingOption == 'standard' ? 500.0 : 1500.0;
  double get _grandTotal => (_itemTotal + _shippingFee - _appliedDiscount).clamp(0.0, double.infinity);

  void _applyPromoCode() {
    final code = _promoController.text.trim().toUpperCase();
    if (code.isEmpty) return;

    if (['SAVE10', 'PROMO10', 'MARKETPLACE', 'PROMO2026'].contains(code)) {
      setState(() {
        _appliedDiscount = 200.0; // LKR 200 discount
        _isPromoApplied = true;
        _promoMessage = '🎉 Promo code $code applied! Saved LKR 200.00';
      });
    } else {
      setState(() {
        _isPromoApplied = false;
        _promoMessage = '❌ Invalid Promo Code. Try SAVE10';
      });
    }
  }

  void _placeOrder(AppProvider provider) async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() => _isProcessing = false);

    final String orderId = 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

    final newOrderMap = {
      'id': orderId,
      'listingId': widget.item.id,
      'itemTitle': widget.item.title,
      'price': _grandTotal,
      'quantity': _quantity,
      'shippingAddress': _addressController.text,
      'paymentMethod': _paymentMethod,
      'image': widget.item.images.isNotEmpty ? widget.item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      'status': 'Processing',
      'statusColor': const Color(0xFF3B82F6),
      'date': '${DateTime.now().day.toString().padLeft(2, '0')}/${DateTime.now().month.toString().padLeft(2, '0')}/${DateTime.now().year}',
    };

    provider.addOrder(newOrderMap);

    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: provider.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.check, size: 40, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Text(
                'Order Confirmed! 🎉',
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: provider.textColor),
              ),
              const SizedBox(height: 6),
              Text(
                'Order ID: $orderId',
                style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF818CF8), fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Text(
                'Thank you for your purchase. Your item will be dispatched soon and delivered to your address.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: provider.subtextColor, height: 1.4),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6366F1),
                        side: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => InvoiceService.downloadInvoice(context, newOrderMap),
                      icon: const Icon(LucideIcons.fileText, size: 18),
                      label: Text('Download Bill', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Navigator.pop(context); // Close sheet
                        Navigator.pop(context); // Back to detail
                      },
                      child: Text('Done & Continue', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
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
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Checkout',
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1: Product Summary Card
                    _buildSectionTitle('Order Item', provider),
                    const SizedBox(height: 10),
                    Container(
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
                              widget.item.images.isNotEmpty ? widget.item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.item.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'LKR ${widget.item.price.toStringAsFixed(2)} each',
                                  style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF34D399), fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF6366F1).withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        widget.item.condition.toUpperCase(),
                                        style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.bold, color: const Color(0xFF818CF8)),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Quantity Selector
                          Container(
                            decoration: BoxDecoration(
                              color: provider.inputBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: provider.cardBorder),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                  padding: EdgeInsets.zero,
                                  icon: Icon(LucideIcons.minus, size: 14, color: provider.textColor),
                                  onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                                ),
                                Text(
                                  '$_quantity',
                                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor),
                                ),
                                IconButton(
                                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                  padding: EdgeInsets.zero,
                                  icon: Icon(LucideIcons.plus, size: 14, color: provider.textColor),
                                  onPressed: _quantity < widget.item.stockQuantity ? () => setState(() => _quantity++) : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Section 2: Delivery / Shipping Address
                    _buildSectionTitle('Shipping Address', provider),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: provider.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: provider.cardBorder),
                      ),
                      child: Column(
                        children: [
                          _buildTextField('Full Name', _nameController, LucideIcons.user, provider),
                          const SizedBox(height: 10),
                          _buildTextField('Phone Number', _phoneController, LucideIcons.phone, provider),
                          const SizedBox(height: 10),
                          _buildTextField('Delivery Address', _addressController, LucideIcons.mapPin, provider),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Section 3: Shipping Method
                    _buildSectionTitle('Delivery Speed', provider),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _buildShippingCard(
                            id: 'standard',
                            title: 'Standard Shipping',
                            subtitle: '3-5 Days • LKR 500',
                            icon: LucideIcons.truck,
                            provider: provider,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildShippingCard(
                            id: 'express',
                            title: 'Express Courier',
                            subtitle: '1-2 Days • LKR 1,500',
                            icon: LucideIcons.zap,
                            provider: provider,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Section 4: Payment Method
                    _buildSectionTitle('Payment Method', provider),
                    const SizedBox(height: 10),
                    Container(
                      decoration: BoxDecoration(
                        color: provider.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: provider.cardBorder),
                      ),
                      child: Column(
                        children: [
                          _buildPaymentTile(
                            id: 'card',
                            title: 'Credit / Debit Card',
                            subtitle: 'Visa, Mastercard, Amex',
                            icon: LucideIcons.creditCard,
                            provider: provider,
                          ),

                          // Interactive Credit Card Entry Form
                          if (_paymentMethod == 'card') ...[
                            Container(
                              margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: provider.inputBg,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.5)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Visual Credit Card Graphic Banner
                                  Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [Color(0xFF3730A3), Color(0xFF4F46E5), Color(0xFF7C3AED)],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF6366F1).withOpacity(0.3),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            const Icon(LucideIcons.cpu, color: Color(0xFFFBBF24), size: 24),
                                            Text(
                                              'VISA',
                                              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 14),
                                        Text(
                                          _cardNumberController.text.isNotEmpty ? _cardNumberController.text : '•••• •••• •••• ••••',
                                          style: GoogleFonts.sourceCodePro(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 2),
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text('CARD HOLDER', style: GoogleFonts.inter(fontSize: 8, color: Colors.white.withOpacity(0.7), fontWeight: FontWeight.bold)),
                                                Text(_cardHolderController.text.toUpperCase(), style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                                              ],
                                            ),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text('EXPIRES', style: GoogleFonts.inter(fontSize: 8, color: Colors.white.withOpacity(0.7), fontWeight: FontWeight.bold)),
                                                Text(_cardExpiryController.text, style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),

                                  const SizedBox(height: 16),

                                  // Card Fields Form
                                  _buildTextField('Card Number', _cardNumberController, LucideIcons.creditCard, provider, onChanged: (_) => setState(() {})),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildTextField('Expiry (MM/YY)', _cardExpiryController, LucideIcons.calendar, provider, onChanged: (_) => setState(() {})),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: _buildTextField('CVV', _cardCvvController, LucideIcons.lock, provider, obscureText: true, onChanged: (_) => setState(() {})),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  _buildTextField('Cardholder Name', _cardHolderController, LucideIcons.user, provider, onChanged: (_) => setState(() {})),

                                  const SizedBox(height: 10),

                                  // Checkbox Save Card
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: Checkbox(
                                          value: _saveCard,
                                          activeColor: const Color(0xFF6366F1),
                                          side: BorderSide(color: provider.subtextColor),
                                          onChanged: (val) => setState(() => _saveCard = val ?? true),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Save card securely for future fast checkout',
                                        style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],

                          Divider(height: 1, color: provider.cardBorder),
                          _buildPaymentTile(
                            id: 'cod',
                            title: 'Cash on Delivery (COD)',
                            subtitle: 'Pay cash upon receiving item',
                            icon: LucideIcons.banknote,
                            provider: provider,
                          ),
                          Divider(height: 1, color: provider.cardBorder),
                          _buildPaymentTile(
                            id: 'wallet',
                            title: 'Marketplace Wallet',
                            subtitle: 'Balance: LKR 375,000.00 available',
                            icon: LucideIcons.wallet,
                            provider: provider,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Section 5: Promo Code Input Box
                    _buildSectionTitle('Promo / Voucher Code', provider),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: provider.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: provider.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _promoController,
                                  style: GoogleFonts.inter(color: provider.textColor, fontSize: 13, fontWeight: FontWeight.bold),
                                  decoration: InputDecoration(
                                    hintText: 'Enter Promo Code (e.g. SAVE10)',
                                    hintStyle: GoogleFonts.inter(color: provider.subtextColor, fontSize: 12),
                                    prefixIcon: const Icon(LucideIcons.tag, color: Color(0xFF818CF8), size: 16),
                                    filled: true,
                                    fillColor: provider.inputBg,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: provider.cardBorder)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF6366F1),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                                onPressed: _applyPromoCode,
                                child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              ),
                            ],
                          ),
                          if (_promoMessage != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              _promoMessage!,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: _isPromoApplied ? const Color(0xFF10B981) : Colors.redAccent,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Section 6: Payment Summary Breakdown
                    _buildSectionTitle('Payment Summary', provider),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: provider.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: provider.cardBorder),
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow('Item Price ($_quantity items)', 'LKR ${_itemTotal.toStringAsFixed(2)}', provider),
                          const SizedBox(height: 8),
                          _buildSummaryRow('Shipping Fee', 'LKR ${_shippingFee.toStringAsFixed(2)}', provider),
                          const SizedBox(height: 8),
                          _buildSummaryRow('Promo Discount', '-LKR ${_appliedDiscount.toStringAsFixed(2)}', provider, isDiscount: true),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            child: Divider(height: 1, color: provider.cardBorder),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Grand Total', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
                              Text(
                                'LKR ${_grandTotal.toStringAsFixed(2)}',
                                style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Bottom Pay Action Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: provider.cardBg,
                border: Border(top: BorderSide(color: provider.cardBorder)),
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Total Amount', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                      Text(
                        'LKR ${_grandTotal.toStringAsFixed(2)}',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 4,
                      ),
                      onPressed: _isProcessing ? null : () => _placeOrder(provider),
                      child: _isProcessing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(LucideIcons.lock, size: 16),
                                const SizedBox(width: 6),
                                Text(
                                  'Confirm & Pay LKR ${_grandTotal.toStringAsFixed(2)}',
                                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
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

  Widget _buildSectionTitle(String title, AppProvider provider) {
    return Text(
      title,
      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, AppProvider provider, {ValueChanged<String>? onChanged, bool obscureText = false}) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      obscureText: obscureText,
      style: GoogleFonts.inter(color: provider.textColor, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: provider.subtextColor, fontSize: 12),
        prefixIcon: Icon(icon, color: const Color(0xFF818CF8), size: 16),
        filled: true,
        fillColor: provider.inputBg,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: provider.cardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: provider.cardBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6366F1))),
      ),
    );
  }

  Widget _buildShippingCard({required String id, required String title, required String subtitle, required IconData icon, required AppProvider provider}) {
    final isSelected = _shippingOption == id;
    return GestureDetector(
      onTap: () => setState(() => _shippingOption = id),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1).withOpacity(0.15) : provider.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? const Color(0xFF6366F1) : provider.cardBorder, width: isSelected ? 1.5 : 1.0),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF818CF8) : provider.subtextColor, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: provider.textColor)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: GoogleFonts.inter(fontSize: 10, color: provider.subtextColor)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentTile({required String id, required String title, required String subtitle, required IconData icon, required AppProvider provider}) {
    final isSelected = _paymentMethod == id;
    return ListTile(
      onTap: () => setState(() => _paymentMethod = id),
      leading: Icon(icon, color: isSelected ? const Color(0xFF818CF8) : provider.subtextColor, size: 20),
      title: Text(title, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
      subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
      trailing: Radio<String>(
        value: id,
        groupValue: _paymentMethod,
        activeColor: const Color(0xFF6366F1),
        onChanged: (val) => setState(() => _paymentMethod = val!),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String amount, AppProvider provider, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 12, color: provider.subtextColor)),
        Text(
          amount,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isDiscount ? const Color(0xFF10B981) : provider.textColor,
          ),
        ),
      ],
    );
  }
}
