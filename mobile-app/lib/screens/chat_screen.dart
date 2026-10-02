import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../providers/app_provider.dart';
import '../providers/locale_provider.dart';

class ChatScreen extends StatefulWidget {
  final String sellerName;
  final String itemTitle;
  final String? itemPrice;

  const ChatScreen({
    super.key,
    this.sellerName = 'Official Store HQ',
    this.itemTitle = 'In-App Support & Live Chat',
    this.itemPrice,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final TextEditingController _offerController = TextEditingController();
  IO.Socket? socket;
  String _getEffectiveUserId(AppProvider provider) {
    if (provider.isLoggedIn && provider.userEmail.isNotEmpty) {
      return provider.userEmail;
    }
    if (provider.isLoggedIn && provider.userName.isNotEmpty) {
      return 'user_${provider.userName.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '_')}';
    }
    return 'guest_customer';
  }

  String _getEffectiveUserName(AppProvider provider) {
    if (provider.isLoggedIn && provider.userName.isNotEmpty) {
      return provider.userName;
    }
    return 'App Customer';
  }

  final List<Map<String, dynamic>> _messages = [];

  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    if (widget.itemTitle.isNotEmpty && widget.itemTitle != 'In-App Support & Live Chat') {
      final priceStr = widget.itemPrice != null ? ' (LKR ${widget.itemPrice})' : '';
      _msgController.text = 'Hi Admin! Is "${widget.itemTitle}"$priceStr available in stock?';
    }
    _connectSocket();
    _fetchHistoryFromREST();
    _pollTimer = Timer.periodic(const Duration(seconds: 2), (_) => _fetchHistoryFromREST());
  }

  Future<void> _fetchHistoryFromREST() async {
    if (!mounted) return;
    final provider = Provider.of<AppProvider>(context, listen: false);
    final currentUserId = _getEffectiveUserId(provider);
    final currentUserName = _getEffectiveUserName(provider);
    final currentUserEmail = provider.userEmail;

    try {
      final queryParams = <String>[];
      if (currentUserEmail.isNotEmpty) queryParams.add('email=${Uri.encodeComponent(currentUserEmail)}');
      if (currentUserId.isNotEmpty) queryParams.add('id=${Uri.encodeComponent(currentUserId)}');
      final queryStr = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';

      final response = await http.get(Uri.parse('http://localhost:5000/api/chats/user/${Uri.encodeComponent(currentUserId)}$queryStr'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['messages'] is List) {
          final List rawMsgs = data['messages'];
          if (mounted) {
            setState(() {
              _messages.clear();
              final seenKeys = <String>{};
              for (var m in rawMsgs) {
                final isAdmin = m['isAdmin'] == true;
                final senderId = m['senderId'] ?? '';
                final userEmail = m['userEmail'] ?? '';
                final isMe = !isAdmin && (
                  senderId == currentUserId || 
                  (currentUserEmail.isNotEmpty && userEmail == currentUserEmail) || 
                  m['sender'] == currentUserName ||
                  m['senderName'] == currentUserName
                );

                final msgIdStr = (m['_id'] ?? m['id'] ?? '').toString();
                final textKey = '${m['text']}_${m['createdAt']}_$isMe';
                final dedupKey = msgIdStr.isNotEmpty ? msgIdStr : textKey;

                if (!seenKeys.contains(dedupKey)) {
                  seenKeys.add(dedupKey);
                  _messages.add({
                    'id': msgIdStr.isNotEmpty ? msgIdStr : DateTime.now().millisecondsSinceEpoch,
                    'isMe': isMe,
                    'sender': isMe ? 'You' : (isAdmin ? 'Admin Support' : (m['senderName'] ?? m['sender'] ?? 'Admin Support')),
                    'text': m['text'] ?? '',
                    'time': m['createdAt'] != null ? DateTime.parse(m['createdAt']).toLocal().toString().substring(11, 16) : 'Just now',
                    'type': m['type'] ?? 'text',
                    'offerPrice': m['offerData']?['amount'],
                    'status': m['offerData']?['status'] ?? 'pending',
                  });
                }
              }
            });
          }
        }
      }
    } catch (e) {
      print('REST history fetch error: $e');
    }
  }

  void _connectSocket() {
    try {
      final provider = Provider.of<AppProvider>(context, listen: false);
      final currentUserId = _getEffectiveUserId(provider);

      socket = IO.io(
        'http://localhost:5000',
        IO.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .build(),
      );

      socket?.connect();

      socket?.onConnect((_) {
        socket?.emit('join_user', currentUserId);
        socket?.emit('join_chat', 'support_chat');
      });

      socket?.on('receive_message', (_) => _fetchHistoryFromREST());
      socket?.on('chat_message', (_) => _fetchHistoryFromREST());

    } catch (e) {
      print('Socket connection error: $e');
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    socket?.disconnect();
    socket?.dispose();
    _msgController.dispose();
    _offerController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage([String? customText]) async {
    final text = customText ?? _msgController.text.trim();
    if (text.isEmpty) return;

    final provider = Provider.of<AppProvider>(context, listen: false);
    final currentUserId = _getEffectiveUserId(provider);
    final currentUserName = _getEffectiveUserName(provider);
    final currentUserEmail = provider.userEmail;

    _msgController.clear();

    final payload = {
      'chatId': 'support_chat',
      'senderId': currentUserId,
      'userEmail': currentUserEmail,
      'sender': currentUserName,
      'senderName': currentUserName,
      'userName': currentUserName,
      'device': 'Mobile App',
      'text': text,
      'type': 'text',
      'isAdmin': false,
    };

    // Send via REST API directly to MongoDB
    try {
      await http.post(
        Uri.parse('http://localhost:5000/api/chats/send'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      _fetchHistoryFromREST();
    } catch (e) {
      print('Error sending REST message from Flutter: $e');
    }

    socket?.emit('send_message', payload);
  }

  void _sendCounterOffer() {
    final amount = double.tryParse(_offerController.text.trim());
    if (amount == null || amount <= 0) return;

    final provider = Provider.of<AppProvider>(context, listen: false);
    final currentUserId = _getEffectiveUserId(provider);
    final currentUserName = _getEffectiveUserName(provider);

    final msgId = DateTime.now().millisecondsSinceEpoch;
    final payload = {
      'id': msgId,
      'chatId': 'support_chat',
      'userId': currentUserId,
      'senderId': currentUserId,
      'sender': currentUserName,
      'senderName': currentUserName,
      'userName': currentUserName,
      'device': 'Mobile App',
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
              Text('Item Original Price: \$${widget.itemPrice ?? "349.99"}', style: TextStyle(color: provider.subtextColor, fontSize: 13)),
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

    if (!provider.isLoggedIn || provider.userEmail.isEmpty) {
      return Scaffold(
        backgroundColor: provider.scaffoldBg,
        appBar: AppBar(
          backgroundColor: provider.cardBg,
          elevation: 1,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: provider.textColor),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text('Live Chat Support', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: provider.textColor)),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.lock, size: 52, color: Color(0xFF6366F1)),
                ),
                const SizedBox(height: 20),
                Text(
                  'Login Required to Chat',
                  style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: provider.textColor),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please log in to your Marketplace account to start chatting with Support and merchants.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: provider.subtextColor, fontSize: 13.5),
                ),
                const SizedBox(height: 28),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(LucideIcons.logIn, color: Colors.white, size: 18),
                  label: const Text('Log In / Register', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                  onPressed: () {
                    provider.setTab(3); // Navigate to Profile / Login tab
                    Navigator.pop(context);
                  },
                )
              ],
            ),
          ),
        ),
      );
    }

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
