import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/locale_provider.dart';

class ChatScreen extends StatefulWidget {
  final String sellerName;
  final String itemTitle;
  final double itemPrice;

  const ChatScreen({
    super.key,
    this.sellerName = 'Official Store HQ',
    this.itemTitle = 'Sony WH-1000XM5 Wireless Headphones',
    this.itemPrice = 349.99,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final TextEditingController _offerController = TextEditingController();
  bool _isSellerTyping = false;
  Timer? _typingTimer;

  final List<Map<String, dynamic>> _messages = [
    {
      'isMe': false,
      'text': 'Hello! Welcome to Official Store HQ. How can we help you today?',
      'time': '10:14 AM',
      'type': 'text',
    },
    {
      'isMe': false,
      'text': 'Price Offer Submitted',
      'time': '10:16 AM',
      'type': 'offer',
      'offerPrice': 320.00,
      'status': 'pending',
    },
  ];

  @override
  void initState() {
    super.initState();
    // Simulate seller typing indicator after 4 seconds
    _typingTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() => _isSellerTyping = true);
        Timer(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() {
              _isSellerTyping = false;
              _messages.add({
                'isMe': false,
                'text': 'I can offer a special \$320 discount for fast delivery today!',
                'time': 'Just now',
                'type': 'text',
              });
            });
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _typingTimer?.cancel();
    _msgController.dispose();
    _offerController.dispose();
    super.dispose();
  }

  void _sendMessage([String? customText]) {
    final text = customText ?? _msgController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({
        'isMe': true,
        'text': text,
        'time': 'Just now',
        'type': 'text',
      });
    });
    _msgController.clear();
  }

  void _sendCounterOffer() {
    final amount = double.tryParse(_offerController.text.trim());
    if (amount == null || amount <= 0) return;
    setState(() {
      _messages.add({
        'isMe': true,
        'text': 'Counter Offer \$${amount.toStringAsFixed(2)}',
        'time': 'Just now',
        'type': 'offer',
        'offerPrice': amount,
        'status': 'pending',
      });
    });
    _offerController.clear();
    Navigator.pop(context);
  }

  void _respondOffer(int index, String status) {
    setState(() {
      _messages[index]['status'] = status;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(status == 'accepted' ? '🎉 Offer Accepted! Added to Cart.' : '❌ Offer Rejected.'),
        backgroundColor: status == 'accepted' ? const Color(0xFF10B981) : Colors.redAccent,
      ),
    );
  }

  void _showOfferModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Submit Price Offer', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 6),
              Text('Item Original Price: \$${widget.itemPrice.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 13)),
              const SizedBox(height: 16),
              TextField(
                controller: _offerController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Your Offer Price (USD)',
                  prefixText: '\$ ',
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _sendCounterOffer,
                child: const Text('Send Offer', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              )
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(widget.sellerName, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(width: 4),
                const Icon(LucideIcons.checkCircle2, size: 14, color: Color(0xFF818CF8)),
              ],
            ),
            Text(widget.itemTitle, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF34D399))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.tag, color: Color(0xFFF59E0B)),
            tooltip: 'Make Offer',
            onPressed: _showOfferModal,
          ),
        ],
      ),
      body: Column(
        children: [
          // Typing indicator banner
          if (_isSellerTyping)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
              color: const Color(0xFF6366F1).withOpacity(0.15),
              child: Row(
                children: [
                  const SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF818CF8)),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    localeProvider.getText('sellerTyping'),
                    style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFA5B4FC), fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),

          // Messages list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isMe = msg['isMe'] == true;
                final isOffer = msg['type'] == 'offer';

                if (isOffer) {
                  return _buildOfferCard(msg, index, localeProvider);
                }

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: const BoxConstraints(maxWidth: 280),
                    decoration: BoxDecoration(
                      color: isMe ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                        bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                      ),
                      border: isMe ? null : Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['text'],
                          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time'],
                          style: GoogleFonts.inter(fontSize: 9, color: Colors.white.withOpacity(0.6)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // FAQ Quick chips
          Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildFaqChip('Is this item in stock?'),
                _buildFaqChip('What is the delivery time?'),
                _buildFaqChip('Can I get a discount?'),
              ],
            ),
          ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              border: Border(top: BorderSide(color: Color(0xFF334155))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Type message...',
                      hintStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 13),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF334155)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () => _sendMessage(),
                  icon: const Icon(LucideIcons.send, color: Color(0xFF6366F1)),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferCard(Map<String, dynamic> msg, int index, LocaleProvider localeProvider) {
    final status = msg['status'] ?? 'pending';
    final price = msg['offerPrice'] ?? widget.itemPrice;
    final isMe = msg['isMe'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF818CF8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(LucideIcons.tag, size: 16, color: Color(0xFFF59E0B)),
                  SizedBox(width: 6),
                  Text('Price Offer Negotiation', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: status == 'accepted'
                      ? const Color(0xFF10B981).withOpacity(0.2)
                      : (status == 'rejected' ? Colors.redAccent.withOpacity(0.2) : Colors.orangeAccent.withOpacity(0.2)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: status == 'accepted' ? const Color(0xFF34D399) : (status == 'rejected' ? Colors.redAccent : Colors.orangeAccent),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Proposed Price: \$${price.toStringAsFixed(2)}',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF34D399)),
          ),
          const SizedBox(height: 10),
          if (status == 'pending' && !isMe)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                    onPressed: () => _respondOffer(index, 'accepted'),
                    child: Text(localeProvider.getText('acceptOffer')),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent, side: const BorderSide(color: Colors.redAccent)),
                    onPressed: () => _respondOffer(index, 'rejected'),
                    child: Text(localeProvider.getText('rejectOffer')),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildFaqChip(String text) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        backgroundColor: const Color(0xFF6366F1).withOpacity(0.15),
        side: const BorderSide(color: Color(0xFF6366F1)),
        label: Text(
          '⚡ $text',
          style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFA5B4FC), fontWeight: FontWeight.w600),
        ),
        onPressed: () => _sendMessage(text),
      ),
    );
  }
}
