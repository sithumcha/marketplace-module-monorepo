import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import '../models/listing.dart';
import '../services/api_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class AppProvider extends ChangeNotifier {
  List<Listing> _listings = [];
  final Set<String> _favorites = {};
  String _selectedCategory = 'All';
  int _currentTabIndex = 0;
  bool _isLoading = false;
  Timer? _autoRefreshTimer;

  // Shopping Cart State
  final List<CartItem> _cartItems = [];

  // User Auth & Profile State
  bool _isLoggedIn = false;
  String _userName = '';
  String _userEmail = '';
  String _userPhone = '';
  String _userAvatar = '';
  String _userRole = '';
  double _walletBalance = 0.0;

  // Theme Mode State ('amoled', 'dark', 'light')
  String _themeMode = 'amoled';
  bool _isAmoledMode = true;


  // User Orders State
  List<Map<String, dynamic>> _userOrders = [];

  // Bank Payout Details State
  Map<String, String> _bankPayoutDetails = {
    'bankName': 'Bank of Ceylon (BOC)',
    'accountHolder': 'Account Holder',
    'accountNumber': '884920194821',
    'branch': 'Colombo Super Grade Branch',
    'swiftCode': 'BCEYLKLX',
  };

  // Saved Delivery Addresses State
  List<Map<String, String>> _savedAddresses = [
    {
      'id': '1',
      'label': 'Home Address (Default)',
      'fullName': 'Delivery Customer',
      'addressLine': 'No. 45, Galle Road, Colombo 03',
      'city': 'Colombo',
      'phone': '+94 77 123 4567',
    },
    {
      'id': '2',
      'label': 'Office / Business Store',
      'fullName': 'Marketplace Pro Customer',
      'addressLine': 'Level 4, Liberty Plaza, Duplication Road',
      'city': 'Colombo 03',
      'phone': '+94 11 234 5678',
    }
  ];

  Map<String, String> get bankPayoutDetails => _bankPayoutDetails;
  List<Map<String, String>> get savedAddresses => _savedAddresses;

  void updateBankPayoutDetails({
    required String bankName,
    required String accountHolder,
    required String accountNumber,
    required String branch,
    required String swiftCode,
  }) {
    _bankPayoutDetails = {
      'bankName': bankName,
      'accountHolder': accountHolder,
      'accountNumber': accountNumber,
      'branch': branch,
      'swiftCode': swiftCode,
    };
    notifyListeners();
    _saveBankDetailsToStorage();
  }

  void addSavedAddress({
    required String label,
    required String fullName,
    required String addressLine,
    required String city,
    required String phone,
  }) {
    _savedAddresses.insert(0, {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'label': label,
      'fullName': fullName,
      'addressLine': addressLine,
      'city': city,
      'phone': phone,
    });
    notifyListeners();
    _saveAddressesToStorage();
  }

  void updateSavedAddress({
    required String id,
    required String label,
    required String fullName,
    required String addressLine,
    required String city,
    required String phone,
  }) {
    final index = _savedAddresses.indexWhere((a) => a['id'] == id);
    if (index != -1) {
      _savedAddresses[index] = {
        'id': id,
        'label': label,
        'fullName': fullName,
        'addressLine': addressLine,
        'city': city,
        'phone': phone,
      };
      notifyListeners();
      _saveAddressesToStorage();
    }
  }

  void removeSavedAddress(String id) {
    _savedAddresses.removeWhere((a) => a['id'] == id);
    notifyListeners();
    _saveAddressesToStorage();
  }

  Future<void> _saveAddressesToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final strList = _savedAddresses.map((a) => json.encode(a)).toList();
      await prefs.setStringList('user_saved_addresses', strList);
      if (_userEmail.isNotEmpty) {
        await ApiService.saveAddressesToDb(_userEmail, _savedAddresses);
      }
    } catch (e) {
      debugPrint('Error saving addresses: $e');
    }
  }

  Future<void> _loadAddressesFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final strList = prefs.getStringList('user_saved_addresses');
      if (strList != null && strList.isNotEmpty) {
        _savedAddresses = strList.map((s) => Map<String, String>.from(json.decode(s) as Map)).toList();
        notifyListeners();
      }
    } catch (e) {}
  }

  Future<void> _saveBankDetailsToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_bank_details', json.encode(_bankPayoutDetails));
      if (_userEmail.isNotEmpty) {
        await ApiService.saveBankPayoutToDb(_userEmail, _bankPayoutDetails);
      }
    } catch (e) {
      debugPrint('Error saving bank details: $e');
    }
  }

  Future<void> _loadBankDetailsFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedStr = prefs.getString('user_bank_details');
      if (savedStr != null) {
        _bankPayoutDetails = Map<String, String>.from(json.decode(savedStr) as Map);
        notifyListeners();
      }
    } catch (e) {}
  }


  List<Listing> get listings => _listings;
  Set<String> get favorites => _favorites;
  String get selectedCategory => _selectedCategory;
  int get currentTabIndex => _currentTabIndex;
  bool get isLoading => _isLoading;

  void addListing(Listing listing) {
    _listings.insert(0, listing);
    notifyListeners();
  }

  // Cart Getters & Methods
  List<CartItem> get cartItems => _cartItems;
  int get cartCount => _cartItems.fold(0, (sum, item) => sum + item.quantity);
  double get cartSubtotal => _cartItems.fold(0.0, (sum, item) => sum + item.totalPrice);

  DateTime? _lastCartMutation;
  DateTime? _lastWishlistMutation;

  bool isInCart(String listingId) => _cartItems.any((item) => item.listing.id == listingId);

  void addToCart(Listing item, {int quantity = 1}) {
    _lastCartMutation = DateTime.now();
    final index = _cartItems.indexWhere((c) => c.listing.id == item.id);
    if (index != -1) {
      _cartItems[index].quantity += quantity;
    } else {
      _cartItems.add(CartItem(listing: item, quantity: quantity));
    }
    notifyListeners();
    _saveCartToStorage();
  }

  void removeFromCart(String listingId) {
    _lastCartMutation = DateTime.now();
    _cartItems.removeWhere((item) => item.listing.id == listingId);
    notifyListeners();
    _saveCartToStorage();
  }

  void updateCartQuantity(String listingId, int quantity) {
    _lastCartMutation = DateTime.now();
    if (quantity <= 0) {
      removeFromCart(listingId);
      return;
    }
    final index = _cartItems.indexWhere((item) => item.listing.id == listingId);
    if (index != -1) {
      _cartItems[index].quantity = quantity;
      notifyListeners();
      _saveCartToStorage();
    }
  }

  void clearCart() {
    _lastCartMutation = DateTime.now();
    _cartItems.clear();
    notifyListeners();
    _saveCartToStorage();
  }

  Future<void> _saveCartToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final compactCart = _cartItems.map((item) {
        String realImg = item.listing.images.isNotEmpty ? item.listing.images.first : '';
        return json.encode({
          'id': item.listing.id,
          'title': item.listing.title,
          'price': item.listing.price,
          'quantity': item.quantity,
          'image': realImg,
          'category': item.listing.category,
        });
      }).toList();

      await prefs.setStringList('user_cart_items', compactCart);
      debugPrint('✅ Compact Cart saved to SharedPreferences: ${compactCart.length} items');

      // Persist directly to MongoDB Database via Express Backend API
      final dbPayload = _cartItems.map((item) => {
        'listingId': item.listing.id,
        'itemTitle': item.listing.title,
        'price': item.listing.price,
        'quantity': item.quantity,
        'image': item.listing.images.isNotEmpty ? item.listing.images.first : '',
      }).toList();
      await ApiService.syncCartToDb(_userEmail, dbPayload);
    } catch (e) {
      debugPrint('Error saving cart to storage/db: $e');
    }
  }

  Future<void> _loadCartFromStorage() async {
    try {
      if (_lastCartMutation != null && DateTime.now().difference(_lastCartMutation!).inSeconds < 2) {
        return;
      }
      if (_userEmail.isNotEmpty) {
        final dbCart = await ApiService.fetchCartFromDb(_userEmail);
        _cartItems.clear();
        if (dbCart.isNotEmpty) {
          for (var item in dbCart) {
            final String lId = item['listingId'] ?? 'item_cart';
            final String lTitle = item['itemTitle'] ?? 'Product Item';
            final double lPrice = (item['price'] is num) ? (item['price'] as num).toDouble() : (double.tryParse(item['price']?.toString() ?? '0') ?? 0.0);
            final String lImg = (item['image'] != null && item['image'].toString().isNotEmpty)
                ? item['image'].toString()
                : (item['images'] != null && (item['images'] as List).isNotEmpty ? item['images'][0].toString() : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80');

            Listing? matchedListing;
            try {
              matchedListing = _listings.firstWhere((l) => l.id == lId);
            } catch (e) {
              matchedListing = null;
            }

            final listing = matchedListing ?? Listing(
              id: lId,
              title: lTitle,
              description: 'Verified store item.',
              category: 'electronics',
              price: lPrice,
              stockQuantity: 10,
              condition: 'Brand New',
              isNegotiable: true,
              isStoreItem: true,
              storeBadge: 'Official Store',
              images: [lImg],
              locationAddress: 'Colombo, Sri Lanka',
              sellerName: 'Official Merchant',
              sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              status: 'active',
            );
            _cartItems.add(CartItem(listing: listing, quantity: item['quantity'] ?? 1));
          }
        }
        final prefs = await SharedPreferences.getInstance();
        if (dbCart.isEmpty) {
          await prefs.remove('user_cart_items');
        }
        notifyListeners();
        return;
      }

      // Fallback to local SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final savedCart = prefs.getStringList('user_cart_items');
      if (savedCart != null && savedCart.isNotEmpty) {
        _cartItems.clear();
        for (var str in savedCart) {
          try {
            final dynamic decoded = json.decode(str);
            if (decoded is Map) {
              final map = Map<String, dynamic>.from(decoded);
              final String itemId = map['id'] ?? map['listingId'] ?? 'item_cart';
              final String itemTitle = map['title'] ?? map['itemTitle'] ?? 'Product Item';
              final double itemPrice = (map['price'] is num) ? (map['price'] as num).toDouble() : 0.0;
              final int itemQty = (map['quantity'] is num) ? (map['quantity'] as num).toInt() : 1;
              String itemImg = map['image'] ?? 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80';

              Listing? matchedListing;
              try {
                matchedListing = _listings.firstWhere((l) => l.id == itemId);
              } catch (e) {
                matchedListing = null;
              }

              final listing = matchedListing ?? Listing(
                id: itemId,
                title: itemTitle,
                description: 'Saved store item.',
                category: 'electronics',
                price: itemPrice,
                stockQuantity: 10,
                condition: 'Brand New',
                isNegotiable: true,
                isStoreItem: true,
                storeBadge: 'Official Store',
                images: [itemImg],
                locationAddress: 'Colombo, Sri Lanka',
                sellerName: 'Official Merchant',
                sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                status: 'active',
              );

              _cartItems.add(CartItem(listing: listing, quantity: itemQty));
            }
          } catch (err) {}
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading cart from storage: $e');
    }
  }

  List<Map<String, dynamic>> get userOrders => _userOrders;

  void addOrder(Map<String, dynamic> order) async {
    _userOrders.insert(0, order);
    notifyListeners();

    // Persist to MongoDB via Backend Express API
    await ApiService.createOrder({
      'orderId': order['id'],
      'listingId': order['listingId'],
      'itemTitle': order['itemTitle'],
      'price': order['price'],
      'quantity': order['quantity'] ?? 1,
      'image': order['image'],
      'status': order['status'] ?? 'Processing',
      'buyerName': _userName,
      'buyerEmail': _userEmail,
      'shippingAddress': order['shippingAddress'],
      'paymentMethod': order['paymentMethod'],
    });
  }

  Future<bool> cancelUserOrder(String orderId) async {
    final success = await ApiService.cancelOrder(orderId);
    if (success) {
      final index = _userOrders.indexWhere((o) => o['id'] == orderId || o['_id'] == orderId);
      if (index != -1) {
        _userOrders[index]['status'] = 'Cancelled';
        notifyListeners();
      }
      loadStoreItems(silent: true);
      loadUserOrders(silent: true);
    }
    return success;
  }

  bool get isLoggedIn => _isLoggedIn;
  String get userName => _userName;
  String get userEmail => _userEmail;
  String get userPhone => _userPhone;
  String get userAvatar => _userAvatar;
  String get userRole => _userRole;
  double get walletBalance => _walletBalance;

  String get themeMode => _themeMode;
  bool get isLightMode => _themeMode == 'light';
  bool get isDarkMode => _themeMode == 'dark';
  bool get isAmoledMode => _themeMode == 'amoled';

  // Dynamic Theme Color Getters
  Color get scaffoldBg {
    if (_themeMode == 'light') return const Color(0xFFF1F5F9);
    if (_themeMode == 'dark') return const Color(0xFF0F172A);
    return const Color(0xFF000000); // amoled
  }

  Color get cardBg {
    if (_themeMode == 'light') return const Color(0xFFFFFFFF);
    if (_themeMode == 'dark') return const Color(0xFF1E293B);
    return const Color(0xFF0A0F1D); // amoled
  }

  Color get cardBorder {
    if (_themeMode == 'light') return const Color(0xFFE2E8F0);
    if (_themeMode == 'dark') return const Color(0xFF334155);
    return const Color(0xFF1E293B); // amoled
  }

  Color get navBg {
    if (_themeMode == 'light') return const Color(0xFFFFFFFF);
    if (_themeMode == 'dark') return const Color(0xFF1E293B);
    return const Color(0xFF050505); // amoled
  }

  Color get textColor {
    if (_themeMode == 'light') return const Color(0xFF0F172A);
    return const Color(0xFFFFFFFF); // dark & amoled
  }

  Color get subtextColor {
    if (_themeMode == 'light') return const Color(0xFF64748B);
    return const Color(0xFF9CA3AF); // dark & amoled
  }

  Color get inputBg {
    if (_themeMode == 'light') return const Color(0xFFF8FAFC);
    return const Color(0xFF0F172A); // dark & amoled
  }

  Color get chipBg {
    if (_themeMode == 'light') return const Color(0xFFE2E8F0);
    return const Color(0xFF1E293B); // dark & amoled
  }


  List<Listing> get filteredListings {
    if (_selectedCategory == 'All') return _listings;
    return _listings.where((l) => l.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
  }

  IO.Socket? _socket;

  AppProvider() {
    _loadThemeMode();
    _loadSavedUser();
    _loadAddressesFromStorage();
    _loadBankDetailsFromStorage();
    loadStoreItems();
    _loadSavedFavorites();
    _loadCartFromStorage();
    loadUserOrders();
    _startAutoRefresh();
    _initSocket();
  }

  Future<void> _saveUserToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('user_is_logged_in', _isLoggedIn);
      await prefs.setString('user_name', _userName);
      await prefs.setString('user_email', _userEmail);
      await prefs.setString('user_phone', _userPhone);
      await prefs.setString('user_avatar', _userAvatar);
      await prefs.setString('user_role', _userRole);
      await prefs.setString('user_token', ApiService.authToken);
    } catch (e) {
      debugPrint('Error saving user state: $e');
    }
  }

  Future<void> _loadSavedUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('user_is_logged_in') ?? false;
      if (isLoggedIn) {
        _isLoggedIn = true;
        _userName = prefs.getString('user_name') ?? 'User';
        _userEmail = prefs.getString('user_email') ?? '';
        _userPhone = prefs.getString('user_phone') ?? '';
        _userAvatar = prefs.getString('user_avatar') ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
        _userRole = prefs.getString('user_role') ?? 'Verified Buyer';
        ApiService.authToken = prefs.getString('user_token') ?? '';
        if (_userName.isNotEmpty) {
          _bankPayoutDetails['accountHolder'] = _userName;
          for (var addr in _savedAddresses) {
            addr['fullName'] = _userName;
            if (_userPhone.isNotEmpty) addr['phone'] = _userPhone;
          }
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading saved user state: $e');
    }
  }

  void _initSocket() {
    try {
      _socket = IO.io('http://localhost:5000', IO.OptionBuilder()
        .setTransports(['websocket', 'polling'])
        .enableAutoConnect()
        .build());

      _socket?.on('cart_updated', (data) {
        if (data != null && data['userEmail'] == _userEmail) {
          if (_lastCartMutation == null || DateTime.now().difference(_lastCartMutation!).inSeconds >= 2) {
            _loadCartFromStorage();
          }
        }
      });
    } catch (e) {
      debugPrint('Error initializing socket in AppProvider: $e');
    }
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      loadStoreItems(silent: true);
      loadUserOrders(silent: true);
      _loadSavedFavorites();
      _loadCartFromStorage();
    });
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    _socket?.disconnect();
    _socket?.dispose();
    super.dispose();
  }

  Future<void> loadUserOrders({bool silent = false}) async {
    final fetched = await ApiService.fetchOrders(_userEmail);
    _userOrders = fetched;
    notifyListeners();
  }

  Future<void> _loadSavedFavorites() async {
    try {
      if (_lastWishlistMutation != null && DateTime.now().difference(_lastWishlistMutation!).inSeconds < 4) {
        return;
      }
      final dbFavs = await ApiService.fetchWishlistFromDb(_userEmail);
      _favorites.clear();
      _favorites.addAll(dbFavs);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading saved favorites: $e');
    }
  }

  Future<void> loadStoreItems({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      notifyListeners();
    }
    final fetched = await ApiService.fetchStoreItems();
    if (fetched.isNotEmpty) {
      _listings = fetched;
    }
    _isLoading = false;
    notifyListeners();
  }

  void setCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setTab(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  Future<void> toggleFavorite(String id) async {
    _lastWishlistMutation = DateTime.now();
    if (_favorites.contains(id)) {
      _favorites.remove(id);
    } else {
      _favorites.add(id);
    }
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('user_favorites', _favorites.toList());
      
      // Persist directly to MongoDB wishlist API
      final updatedDbFavs = await ApiService.toggleWishlistInDb(_userEmail, id);
      if (updatedDbFavs.isNotEmpty) {
        _favorites.clear();
        _favorites.addAll(updatedDbFavs);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error saving favorites: $e');
    }
  }

  bool isFavorite(String id) => _favorites.contains(id);
  Set<String> get favoriteIds => _favorites;

  // Theme Mode Switcher & Persistence
  void setThemeMode(String mode) {
    if (mode == 'light' || mode == 'dark' || mode == 'amoled') {
      _themeMode = mode;
      _isAmoledMode = (mode == 'amoled');
      notifyListeners();
      _saveThemeMode();
    }
  }

  void toggleAmoledMode(bool value) {
    setThemeMode(value ? 'amoled' : 'light');
  }

  Future<void> _saveThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('app_theme_mode', _themeMode);
    } catch (e) {
      debugPrint('Error saving theme mode: $e');
    }
  }

  Future<void> _loadThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('app_theme_mode');
      if (saved != null && (saved == 'light' || saved == 'dark' || saved == 'amoled')) {
        _themeMode = saved;
        _isAmoledMode = (saved == 'amoled');
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading theme mode: $e');
    }
  }


  // Stock Deduction Method
  void decreaseStock(String listingId, int quantity) async {
    final index = _listings.indexWhere((l) => l.id == listingId);
    if (index != -1) {
      final title = _listings[index].title;
      final currentStock = _listings[index].stockQuantity;
      final newStock = (currentStock - quantity).clamp(0, 9999);

      _listings[index] = Listing(
        id: _listings[index].id,
        title: _listings[index].title,
        description: _listings[index].description,
        category: _listings[index].category,
        price: _listings[index].price,
        stockQuantity: newStock,
        condition: _listings[index].condition,
        isNegotiable: _listings[index].isNegotiable,
        isStoreItem: _listings[index].isStoreItem,
        storeBadge: _listings[index].storeBadge,
        images: _listings[index].images,
        locationAddress: _listings[index].locationAddress,
        sellerName: _listings[index].sellerName,
        sellerAvatar: _listings[index].sellerAvatar,
        status: newStock == 0 ? 'sold' : _listings[index].status,
      );
      notifyListeners();

      // Persist stock reduction in MongoDB Database
      await ApiService.updateStockQuantity(listingId, quantity, title);
    }
  }

  // User Profile & Authentication Methods
  void logout() async {
    _isLoggedIn = false;
    _userName = '';
    _userEmail = '';
    _userPhone = '';
    _userAvatar = '';
    _userRole = '';
    ApiService.authToken = '';
    _cartItems.clear();
    _favorites.clear();
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_cart_items');
      await prefs.remove('user_favorites');
      await prefs.remove('user_saved_addresses');
      await prefs.remove('user_bank_details');
      await prefs.remove('user_is_logged_in');
      await prefs.remove('user_name');
      await prefs.remove('user_email');
      await prefs.remove('user_phone');
      await prefs.remove('user_avatar');
      await prefs.remove('user_role');
      await prefs.remove('user_token');
    } catch (e) {}
  }

  void login({String? name, String? email, String? phone, String? avatar, String? role, String? token}) async {
    _isLoggedIn = true;
    if (name != null && name.isNotEmpty) _userName = name;
    if (email != null && email.isNotEmpty) _userEmail = email;
    if (phone != null && phone.isNotEmpty) _userPhone = phone;
    if (avatar != null && avatar.isNotEmpty) _userAvatar = avatar;
    if (role != null && role.isNotEmpty) _userRole = role;
    if (_userAvatar.isEmpty) {
      _userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
    }
    if (_userRole.isEmpty) {
      _userRole = 'Verified Buyer';
    }
    if (token != null && token.isNotEmpty) ApiService.authToken = token;
    if (_userName.isNotEmpty) {
      _bankPayoutDetails['accountHolder'] = _userName;
      for (var addr in _savedAddresses) {
        addr['fullName'] = _userName;
        if (_userPhone.isNotEmpty) addr['phone'] = _userPhone;
      }
    }
    notifyListeners();
    _saveUserToStorage();
    
    // Merge guest local cart with MongoDB database cart upon login
    if (_cartItems.isNotEmpty) {
      final localPayload = _cartItems.map((item) => {
        'listingId': item.listing.id,
        'itemTitle': item.listing.title,
        'price': item.listing.price,
        'quantity': item.quantity,
        'image': item.listing.images.isNotEmpty ? item.listing.images.first : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      }).toList();
      _cartItems.clear();
      await ApiService.mergeCartToDb(_userEmail, localPayload);
    }

    // Immediately fetch orders, cart, and wishlist for logged-in user from MongoDB
    loadUserOrders(silent: false);
    _loadSavedFavorites();
    _loadCartFromStorage();
  }

  void updateProfile({required String name, required String email, required String phone}) {
    _userName = name;
    _userEmail = email;
    _userPhone = phone;
    notifyListeners();
    _saveUserToStorage();
  }

  void updateAvatar(String newAvatarUrl) {
    if (newAvatarUrl.isNotEmpty) {
      _userAvatar = newAvatarUrl;
      notifyListeners();
      _saveUserToStorage();
    }
  }

  Future<bool> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String role,
  }) async {
    _userName = name;
    _userEmail = email;
    _userPhone = phone;
    _userRole = role == 'seller' ? 'Verified Store Seller' : 'Verified Buyer';
    _isLoggedIn = true;
    notifyListeners();

    final result = await ApiService.registerUser(
      name: name,
      email: email,
      phone: phone,
      password: password,
      role: role,
    );

    if (result['success'] == true && result['token'] != null) {
      ApiService.authToken = result['token'];
    }

    _saveUserToStorage();

    // Merge guest local cart upon registration
    if (_cartItems.isNotEmpty) {
      final localPayload = _cartItems.map((item) => {
        'listingId': item.listing.id,
        'itemTitle': item.listing.title,
        'price': item.listing.price,
        'quantity': item.quantity,
        'image': item.listing.images.isNotEmpty ? item.listing.images.first : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      }).toList();
      await ApiService.mergeCartToDb(_userEmail, localPayload);
    }

    _loadCartFromStorage();
    _loadSavedFavorites();
    return result['success'] == true;
  }
}
