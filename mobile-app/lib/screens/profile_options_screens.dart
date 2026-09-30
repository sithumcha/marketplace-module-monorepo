import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../models/listing.dart';
import '../providers/app_provider.dart';
import 'product_detail_screen.dart';

// ==========================================
// 1. SAVED FAVORITES SCREEN
// ==========================================
class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final favItems = provider.listings.where((item) => provider.isFavorite(item.id)).toList();

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
          'Saved Favorites (${favItems.length})',
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
        ),
        centerTitle: true,
      ),
      body: favItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.heartHandshake, size: 50, color: Color(0xFFEF4444)),
                  ),
                  const SizedBox(height: 16),
                  Text('No Saved Favorites Yet', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
                  const SizedBox(height: 8),
                  Text('Tap the heart icon on any product to save it here.', style: GoogleFonts.inter(fontSize: 12, color: provider.subtextColor)),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text('Explore Store Catalog', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favItems.length,
              itemBuilder: (context, index) {
                final item = favItems[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: provider.cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: provider.cardBorder),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        item.images.isNotEmpty ? item.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                      ),
                    ),
                    title: Text(
                      item.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('\$${item.price.toStringAsFixed(0)} • Stock: ${item.stockQuantity}', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF34D399), fontWeight: FontWeight.bold)),
                        Text('📍 ${item.locationAddress}', style: GoogleFonts.inter(fontSize: 10, color: provider.subtextColor)),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.favorite, color: Color(0xFFEF4444), size: 22),
                      onPressed: () => provider.toggleFavorite(item.id),
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => ProductDetailScreen(item: item)),
                      );
                    },
                  ),
                );
              },
            ),
    );

  }
}

// ==========================================
// 2. WALLET & PAYMENT CARDS SCREEN
// ==========================================
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Wallet & Payment Cards', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Wallet Balance Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF059669), Color(0xFF10B981), Color(0xFF34D399)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('AVAILABLE BALANCE', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white.withOpacity(0.9), letterSpacing: 1)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('USD / LKR', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  '\$${provider.walletBalance.toStringAsFixed(2)}',
                  style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF059669),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('➕ \$100.00 added to your wallet!'), backgroundColor: Color(0xFF10B981)),
                          );
                        },
                        icon: const Icon(LucideIcons.plusCircle, size: 16),
                        label: Text('Top-Up Wallet', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        onPressed: () {},
                        icon: const Icon(LucideIcons.arrowUpRight, size: 16),
                        label: Text('Withdraw', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          Text('Connected Payment Cards', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
          const SizedBox(height: 10),

          // Visa Card Tile
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: provider.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: provider.cardBorder),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3730A3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('VISA', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, fontStyle: FontStyle.italic)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Visa Debit •••• 8892', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                      Text('Expires 12/28 • Default Card', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                    ],
                  ),
                ),
                const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 18),
              ],
            ),
          ),

          const SizedBox(height: 24),
          Text('Recent Wallet Transactions', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: provider.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: provider.cardBorder),
            ),
            child: Center(
              child: Text(
                'No transactions recorded yet. Real purchases & wallet top-ups will appear here.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 12, color: provider.subtextColor),
              ),
            ),
          ),
        ],
      ),
    );

  }

  Widget _buildTransactionRow(String title, String date, String amount, {required bool isDebit}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: isDebit ? const Color(0xFFEF4444).withOpacity(0.15) : const Color(0xFF10B981).withOpacity(0.15),
                child: Icon(isDebit ? LucideIcons.arrowUpRight : LucideIcons.arrowDownLeft, size: 16, color: isDebit ? const Color(0xFFEF4444) : const Color(0xFF10B981)),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(date, style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
                ],
              ),
            ],
          ),
          Text(
            amount,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: isDebit ? const Color(0xFFEF4444) : const Color(0xFF10B981)),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// 3. ORDER HISTORY SCREEN
// ==========================================
class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final orders = provider.userOrders;

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('My Orders', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
        centerTitle: true,
      ),
      body: orders.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.packageSearch, size: 48, color: Color(0xFF818CF8)),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No Orders Placed Yet',
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'When you purchase items from the marketplace store, your real order tracking status and receipts will appear here.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 12, color: provider.subtextColor, height: 1.4),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(LucideIcons.shoppingBag, size: 16),
                      label: Text('Explore Products', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final ord = orders[index];
                final String status = ord['status'] ?? 'Processing';
                final bool isCancelled = status.toLowerCase() == 'cancelled';
                
                final steps = ['Processing', 'Dispatched', 'Out for Delivery', 'Delivered'];
                int currentStep = 0;
                if (status.toLowerCase() == 'dispatched') currentStep = 1;
                if (status.toLowerCase().contains('out') || status.toLowerCase().contains('delivery')) currentStep = 2;
                if (status.toLowerCase() == 'delivered') currentStep = 3;

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: provider.cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isCancelled ? const Color(0xFFEF4444).withOpacity(0.5) : provider.cardBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(provider.isLightMode ? 0.05 : 0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('ID: ${ord['id']}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF818CF8))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isCancelled 
                                  ? const Color(0xFFEF4444).withOpacity(0.15)
                                  : const Color(0xFF6366F1).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isCancelled ? const Color(0xFFEF4444) : const Color(0xFF6366F1)),
                            ),
                            child: Text(
                              isCancelled ? '🚫 CANCELLED & REFUNDED' : status.toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isCancelled ? const Color(0xFFEF4444) : const Color(0xFF818CF8),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Item Details Row
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(ord['image'], width: 64, height: 64, fit: BoxFit.cover),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  ord['itemTitle'],
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                                ),
                                const SizedBox(height: 4),

                                Text(
                                  '\$${(ord['price'] is num ? (ord['price'] as num).toDouble() : 0.0).toStringAsFixed(2)} • Qty: ${ord['quantity'] ?? 1}',
                                  style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF34D399), fontWeight: FontWeight.w800),
                                ),
                                Text('Placed on ${ord['date'] ?? 'Today'}', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),
                      const Divider(height: 1, color: Color(0xFF334155)),
                      const SizedBox(height: 14),

                      // 4-Step Live Tracking Stepper
                      if (!isCancelled) ...[
                        Text('LIVE ORDER STATUS TRACKING', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF9CA3AF), letterSpacing: 0.8)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(4, (i) {
                            final isActive = i <= currentStep;
                            final isCurrent = i == currentStep;
                            return Expanded(
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      if (i > 0)
                                        Expanded(
                                          child: Container(
                                            height: 3,
                                            color: i <= currentStep ? const Color(0xFF6366F1) : const Color(0xFF334155),
                                          ),
                                        ),
                                      Container(
                                        width: 22,
                                        height: 22,
                                        decoration: BoxDecoration(
                                          color: isActive ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: isActive ? const Color(0xFF818CF8) : const Color(0xFF475569),
                                            width: isCurrent ? 2 : 1,
                                          ),
                                          boxShadow: isCurrent ? [
                                            BoxShadow(
                                              color: const Color(0xFF6366F1).withOpacity(0.5),
                                              blurRadius: 8,
                                              spreadRadius: 2,
                                            )
                                          ] : [],
                                        ),
                                        child: Center(
                                          child: isActive
                                              ? const Icon(Icons.check, size: 12, color: Colors.white)
                                              : Text('${i + 1}', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF), fontWeight: FontWeight.bold)),
                                        ),
                                      ),
                                      if (i < 3)
                                        Expanded(
                                          child: Container(
                                            height: 3,
                                            color: i < currentStep ? const Color(0xFF6366F1) : const Color(0xFF334155),
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    steps[i],
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(
                                      fontSize: 9,
                                      fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                                      color: isActive ? Colors.white : const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ),
                      ],

                      // Cancel Order Button (only shown when status is Processing)
                      if (status.toLowerCase() == 'processing' && !isCancelled) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFEF4444),
                              side: const BorderSide(color: Color(0xFFEF4444)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (context) => AlertDialog(
                                  backgroundColor: const Color(0xFF1E293B),
                                  title: Text('Cancel Order & Request Refund?', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                                  content: Text('Are you sure you want to cancel Order #${ord['id']}? The item stock will be restored immediately.', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 13)),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context),
                                      child: Text('Keep Order', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF))),
                                    ),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
                                      onPressed: () async {
                                        Navigator.pop(context);
                                        final success = await provider.cancelUserOrder(ord['id']);
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(success ? '🚫 Order cancelled & stock restored to store!' : 'Failed to cancel order'),
                                              backgroundColor: success ? const Color(0xFFEF4444) : Colors.orange,
                                            ),
                                          );
                                        }
                                      },
                                      child: Text('Yes, Cancel & Refund', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              );
                            },
                            icon: const Icon(LucideIcons.xCircle, size: 16),
                            label: Text('Cancel Order & Refund', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
    );
  }
}

// ==========================================
// 4. SAFETY & SECURITY SCREEN
// ==========================================
class SafetySecurityScreen extends StatefulWidget {
  const SafetySecurityScreen({super.key});

  @override
  State<SafetySecurityScreen> createState() => _SafetySecurityScreenState();
}

class _SafetySecurityScreenState extends State<SafetySecurityScreen> {
  bool _twoFactor = true;
  bool _biometric = false;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Safety & Security', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Security Settings Card
          Text('Account Security Settings', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: provider.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: provider.cardBorder),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: Text('2-Factor Authentication (2FA)', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                  subtitle: Text('SMS OTP verification on login', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                  activeColor: const Color(0xFF6366F1),
                  value: _twoFactor,
                  onChanged: (val) => setState(() => _twoFactor = val),
                ),
                Divider(height: 1, color: provider.cardBorder),
                SwitchListTile(
                  title: Text('Biometric Face ID / Fingerprint', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                  subtitle: Text('Unlock app using biometric sensor', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                  activeColor: const Color(0xFF6366F1),
                  value: _biometric,
                  onChanged: (val) => setState(() => _biometric = val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Scam Prevention & Safety Rules
          Text('Marketplace Buyer Safety Tips', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
          const SizedBox(height: 10),
          _buildTipTile(context, LucideIcons.mapPin, 'Meet in Safe Public Places', 'Always inspect high-value items in well-lit public locations or official store hubs.'),
          _buildTipTile(context, LucideIcons.shieldCheck, 'Use Marketplace Secure Checkout', 'Avoid wire transfers or unverified external links to stay covered by Buyer Protection.'),
          _buildTipTile(context, LucideIcons.eye, 'Inspect Items Before Confirming', 'Check product condition, serial numbers, and functions before releasing payment.'),
        ],
      ),
    );
  }

  Widget _buildTipTile(BuildContext context, IconData icon, String title, String desc) {
    final provider = Provider.of<AppProvider>(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: provider.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: provider.cardBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF818CF8), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                const SizedBox(height: 3),
                Text(desc, style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor, height: 1.3)),
              ],
            ),
          ),
        ],
      ),
    );
  }

}

// ==========================================
// 5. SETTINGS & PREFERENCES SCREEN
// ==========================================
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _currency = 'USD (\$)';
  bool _notifications = true;
  String _language = 'English';

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Settings & Preferences', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            decoration: BoxDecoration(
              color: provider.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: provider.cardBorder),
            ),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            provider.isLightMode ? LucideIcons.sun : (provider.isAmoledMode ? LucideIcons.sparkles : LucideIcons.moon),
                            color: const Color(0xFF8B5CF6),
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'App Theme & Appearance',
                            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Choose between Light Mode, Midnight Dark, or AMOLED Black.',
                        style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                provider.setThemeMode('light');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('☀️ Light Mode Activated!'),
                                    backgroundColor: Color(0xFF6366F1),
                                    duration: Duration(seconds: 1),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: provider.isLightMode ? const Color(0xFF6366F1) : provider.chipBg,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: provider.isLightMode ? const Color(0xFF6366F1) : provider.cardBorder),
                                ),
                                child: Column(
                                  children: [
                                    Icon(LucideIcons.sun, size: 16, color: provider.isLightMode ? Colors.white : provider.textColor),
                                    const SizedBox(height: 4),
                                    Text('Light', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: provider.isLightMode ? Colors.white : provider.textColor)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                provider.setThemeMode('dark');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('🌙 Midnight Dark Mode Activated!'),
                                    backgroundColor: Color(0xFF6366F1),
                                    duration: Duration(seconds: 1),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: provider.isDarkMode ? const Color(0xFF6366F1) : provider.chipBg,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: provider.isDarkMode ? const Color(0xFF6366F1) : provider.cardBorder),
                                ),
                                child: Column(
                                  children: [
                                    Icon(LucideIcons.moon, size: 16, color: provider.isDarkMode ? Colors.white : provider.textColor),
                                    const SizedBox(height: 4),
                                    Text('Dark', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: provider.isDarkMode ? Colors.white : provider.textColor)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                provider.setThemeMode('amoled');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('🌌 AMOLED Pitch Black Mode Activated!'),
                                    backgroundColor: Color(0xFF6366F1),
                                    duration: Duration(seconds: 1),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: provider.isAmoledMode ? const Color(0xFF6366F1) : provider.chipBg,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: provider.isAmoledMode ? const Color(0xFF6366F1) : provider.cardBorder),
                                ),
                                child: Column(
                                  children: [
                                    Icon(LucideIcons.sparkles, size: 16, color: provider.isAmoledMode ? Colors.white : provider.textColor),
                                    const SizedBox(height: 4),
                                    Text('AMOLED', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: provider.isAmoledMode ? Colors.white : provider.textColor)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                Divider(height: 1, color: provider.cardBorder),
                ListTile(
                  leading: const Icon(LucideIcons.dollarSign, color: Color(0xFF818CF8)),
                  title: Text('Display Currency', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                  trailing: DropdownButton<String>(
                    value: _currency,
                    dropdownColor: provider.cardBg,
                    style: GoogleFonts.inter(color: const Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 12),
                    underline: const SizedBox(),
                    items: ['USD (\$)', 'LKR (Rs.)'].map((String c) {
                      return DropdownMenuItem(value: c, child: Text(c));
                    }).toList(),
                    onChanged: (val) => setState(() => _currency = val!),
                  ),
                ),
                Divider(height: 1, color: provider.cardBorder),
                ListTile(
                  leading: const Icon(LucideIcons.globe, color: Color(0xFF818CF8)),
                  title: Text('App Language', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                  trailing: DropdownButton<String>(
                    value: _language,
                    dropdownColor: provider.cardBg,
                    style: GoogleFonts.inter(color: provider.textColor, fontWeight: FontWeight.bold, fontSize: 12),
                    underline: const SizedBox(),
                    items: ['English', 'සිංහල (Sinhala)'].map((String l) {
                      return DropdownMenuItem(value: l, child: Text(l));
                    }).toList(),
                    onChanged: (val) => setState(() => _language = val!),
                  ),
                ),
                Divider(height: 1, color: provider.cardBorder),
                SwitchListTile(
                  secondary: const Icon(LucideIcons.bell, color: Color(0xFF818CF8)),
                  title: Text('Push Notifications', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                  subtitle: Text('Receive order & chat updates', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                  activeColor: const Color(0xFF6366F1),
                  value: _notifications,
                  onChanged: (val) => setState(() => _notifications = val),
                ),
              ],
            ),
          ),


          const SizedBox(height: 20),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFEF4444),
              side: const BorderSide(color: Color(0xFFEF4444)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('🧹 App cache cleared successfully.')),
              );
            },
            icon: const Icon(LucideIcons.trash2, size: 16),
            label: Text('Clear App Cache & Temporary Data', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
