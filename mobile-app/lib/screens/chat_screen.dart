import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../providers/app_provider.dart';
import '../providers/locale_provider.dart';

class ChatScreen extends StatefulWidget {
  final String sellerName;
  final String itemTitle;
  final double itemPrice;

  const ChatScreen({
    super.key,
    this.sellerName = 'Official Store HQ',
    this.itemTitle = 'In-App Support & Live Chat',
    this.itemPrice = 349.99,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final TextEditingController _offerController = TextEditingController();
  IO.Socket? socket;
  final String userId = 'user_demo';

  final List<Map<String, dynamic>> _messages = [
    {
      'id': 1,
      'isMe': false,
      'sender': 'Support',
      'text': 'Hello! Welcome to Marketplace Support. How can we help you today?',
      'time': '10:14 AM',
      'type': 'text',
    },
  ];

  @override
  void initState() {
    super.initState();
    _connectSocket();
  }

  void _connectSocket() {
    try {
      socket = IO.io(
        'http://localhost:5000',
        IO.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .build(),
      );

      socket?.connect();

      socket?.onConnect((_) {
        print('Flutter Socket Connected');
        socket?.emit('join_user', userId);
        socket?.emit('join_chat', 'support_chat');
      });

      void handleIncomingMessage(dynamic data) {
        if (data == null || !mounted) return;
        final mapData = data is Map ? data : {'text': data.toString()};
        final msgId = mapData['id'] ?? DateTime.now().millisecondsSinceEpoch;
        final senderId = mapData['senderId'] ?? '';
        final isMe = senderId == userId || mapData['sender'] == 'You';
        final sender = isMe ? 'You' : (mapData['sender'] ?? 'Admin Support');
        final text = mapData['text'] ?? '';

        setState(() {
          if (!_messages.any((m) => m['id'] == msgId)) {
            _messages.add({
              'id': msgId,
              'isMe': isMe,
              'sender': sender,
              'text': text,
              'time': mapData['time'] ?? 'Just now',
              'type': mapData['type'] ?? 'text',
              'offerPrice': mapData['offerData']?['amount'],
              'status': mapData['offerData']?['status'] ?? 'pending',
            });
          }
        });
      }

      socket?.on('receive_message', handleIncomingMessage);
      socket?.on('chat_message', handleIncomingMessage);

    } catch (e) {
      print('Socket connection error: $e');
    }
  }

  @override
  void dispose() {
    socket?.disconnect();
    socket?.dispose();
    _msgController.dispose();
    _offerController.dispose();
    super.dispose();
  }

  void _sendMessage([String? customText]) {
    final text = customText ?? _msgController.text.trim();
    if (text.isEmpty) return;

    final msgId = DateTime.now().millisecondsSinceEpoch;
    final payload = {
      'id': msgId,
      'chatId': 'support_chat',
      'userId': userId,
      'senderId': userId,
      'sender': 'You',
      'text': text,
      'type': 'text',
      'time': 'Just now',
    };

    socket?.emit('send_message', payload);
    _msgController.clear();
  }

  void _sendCounterOffer() {
    final amount = double.tryParse(_offerController.text.trim());
    if (amount == null || amount <= 0) return;

    final msgId = DateTime.now().millisecondsSinceEpoch;
    final payload = {
      'id': msgId,
      'chatId': 'support_chat',
      'userId': userId,
      'senderId': userId,
      'sender': 'You',
      'text': 'Counter Offer \$${amount.toStringAsFixed(2)}',
      'type': 'offer',
      'offerData': {'amount': amount, 'status': 'pending'},
      'time': 'Just now',
    };

    socket?.emit('send_message', payload);
    _offerController.clear();
    Navigator.pop(context);
  }

  void _respondOffer(int index, String status) {
    setState(() {
      _messages[index]['status'] = status;
    });

    socket?.emit('respond_offer', {
      'chatId': 'support_chat',
      'status': status,
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(status == 'accepted' ? '🎉 Offer Accepted! Added to Cart.' : '❌ Offer Rejected.'),
        backgroundColor: status == 'accepted' ? const Color(0xFF10B981) : Colors.redAccent,
      ),
    );
  }

  void _showOfferModal(AppProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: provider.cardBg,
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
              Text('Submit Price Offer', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor)),
              const SizedBox(height: 6),
              Text('Item Original Price: \$${widget.itemPrice.toStringAsFixed(2)}', style: TextStyle(color: provider.subtextColor, fontSize: 13)),
              const SizedBox(height: 16),
              TextField(
                controller: _offerController,
                keyboardType: TextInputType.number,
                style: TextStyle(color: provider.textColor),
                decoration: InputDecoration(
                  labelText: 'Your Offer Price (USD)',
                  labelStyle: TextStyle(color: provider.subtextColor),
                  prefixText: '\$ ',
                  prefixStyle: TextStyle(color: provider.textColor),
                  filled: true,
                  fillColor: provider.inputBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: provider.cardBorder)),
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
    final provider = context.watch<AppProvider>();
    final localeProvider = context.watch<LocaleProvider>();

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      appBar: AppBar(
        backgroundColor: provider.cardBg,
        elevation: 1,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: provider.textColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(widget.sellerName, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: provider.textColor)),
                const SizedBox(width: 4),
                const Icon(LucideIcons.checkCircle2, size: 14, color: Color(0xFF818CF8)),
              ],
            ),
            Text('Live Multi-Device Socket Sync', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF34D399))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.tag, color: Color(0xFFF59E0B)),
            tooltip: 'Make Offer',
            onPressed: () => _showOfferModal(provider),
          ),
        ],
      ),
      body: Column(
        children: [
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
                  return _buildOfferCard(msg, index, localeProvider, provider);
                }

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: const BoxConstraints(maxWidth: 280),
                    decoration: BoxDecoration(
                      color: isMe ? const Color(0xFF6366F1) : provider.cardBg,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                        bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                      ),
                      border: isMe ? null : Border.all(color: provider.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['sender'] ?? (isMe ? 'You' : 'Support'),
                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: isMe ? Colors.indigo.shade100 : const Color(0xFF818CF8)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          msg['text'],
                          style: GoogleFonts.inter(fontSize: 13, color: isMe ? Colors.white : provider.textColor),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time'],
                          style: GoogleFonts.inter(fontSize: 9, color: isMe ? Colors.white.withOpacity(0.7) : provider.subtextColor),
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
            decoration: BoxDecoration(
              color: provider.cardBg,
              border: Border(top: BorderSide(color: provider.cardBorder)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    style: GoogleFonts.inter(color: provider.textColor, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Type message...',
                      hintStyle: GoogleFonts.inter(color: provider.subtextColor, fontSize: 13),
                      filled: true,
                      fillColor: provider.inputBg,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: provider.cardBorder),
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

  Widget _buildOfferCard(Map<String, dynamic> msg, int index, LocaleProvider localeProvider, AppProvider provider) {
    final status = msg['status'] ?? 'pending';
    final price = msg['offerPrice'] ?? widget.itemPrice;
    final isMe = msg['isMe'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: provider.cardBg,
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
                children: [
                  const Icon(LucideIcons.tag, size: 16, color: Color(0xFFF59E0B)),
                  const SizedBox(width: 6),
                  Text('Price Offer Negotiation', style: TextStyle(color: provider.textColor, fontWeight: FontWeight.bold, fontSize: 13)),
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
          style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF6366F1), fontWeight: FontWeight.w600),
        ),
        onPressed: () => _sendMessage(text),
      ),
    );
  }
}
