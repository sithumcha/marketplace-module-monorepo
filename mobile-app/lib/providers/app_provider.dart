import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import '../models/listing.dart';
import '../services/api_service.dart';

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
  bool _isLoggedIn = true;
  String _userName = 'Sithum Nethsara';
  String _userEmail = 'sithum@marketplace.lk';
  String _userPhone = '+94 77 123 4567';
  String _userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
  String _userRole = 'Verified Buyer & Seller';
  double _walletBalance = 1250.00;

  // Dark Glass AMOLED Theme State
  bool _isAmoledMode = true;

  // User Orders State
  List<Map<String, dynamic>> _userOrders = [];

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

  bool isInCart(String listingId) => _cartItems.any((item) => item.listing.id == listingId);

  void addToCart(Listing item, {int quantity = 1}) {
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
    _cartItems.removeWhere((item) => item.listing.id == listingId);
    notifyListeners();
    _saveCartToStorage();
  }

  void updateCartQuantity(String listingId, int quantity) {
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
    _cartItems.clear();
    notifyListeners();
    _saveCartToStorage();
  }

  Future<void> _saveCartToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJsonList = _cartItems.map((item) => json.encode(item.toJson())).toList();
      await prefs.setStringList('user_cart_items', cartJsonList);

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
      // 1. Try loading from local SharedPreferences FIRST (Instant UI restoration)
      final prefs = await SharedPreferences.getInstance();
      final savedCart = prefs.getStringList('user_cart_items');
      if (savedCart != null && savedCart.isNotEmpty) {
        _cartItems.clear();
        for (var str in savedCart) {
          try {
            final dynamic decoded = json.decode(str);
            if (decoded is Map) {
              final map = Map<String, dynamic>.from(decoded);
              _cartItems.add(CartItem.fromJson(map));
            }
          } catch (err) {
            debugPrint('Error decoding cart item JSON: $err');
          }
        }
        notifyListeners();
        return;
      }

      // 2. Fallback to loading from MongoDB database
      final dbCart = await ApiService.fetchCartFromDb(_userEmail);
      if (dbCart.isNotEmpty) {
        _cartItems.clear();
        for (var item in dbCart) {
          final listing = Listing(
            id: item['listingId'] ?? 'item_cart',
            title: item['itemTitle'] ?? 'Product Item',
            description: 'Item stored in MongoDB cart.',
            category: 'electronics',
            price: (item['price'] is num) ? (item['price'] as num).toDouble() : (double.tryParse(item['price']?.toString() ?? '0') ?? 0.0),
            stockQuantity: 10,
            condition: 'Brand New',
            isNegotiable: true,
            isStoreItem: true,
            storeBadge: 'Verified Seller',
            images: [item['image'] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
            locationAddress: 'Colombo, Sri Lanka',
            sellerName: 'Official Store',
            sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            status: 'active',
          );
          _cartItems.add(CartItem(listing: listing, quantity: item['quantity'] ?? 1));
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

  bool get isAmoledMode => _isAmoledMode;

  // Dynamic Theme Color Getters
  Color get scaffoldBg => _isAmoledMode ? const Color(0xFF000000) : const Color(0xFF0F172A);
  Color get cardBg => _isAmoledMode ? const Color(0xFF0A0F1D) : const Color(0xFF1E293B);
  Color get cardBorder => _isAmoledMode ? const Color(0xFF1E293B) : const Color(0xFF334155);
  Color get navBg => _isAmoledMode ? const Color(0xFF050505) : const Color(0xFF1E293B);

  List<Listing> get filteredListings {
    if (_selectedCategory == 'All') return _listings;
    return _listings.where((l) => l.category.toLowerCase() == _selectedCategory.toLowerCase()).toList();
  }

  AppProvider() {
    loadStoreItems();
    _loadSavedFavorites();
    _loadCartFromStorage();
    loadUserOrders();
    _startAutoRefresh();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      loadStoreItems(silent: true);
      loadUserOrders(silent: true);
    });
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  Future<void> loadUserOrders({bool silent = false}) async {
    final fetched = await ApiService.fetchOrders(_userEmail);
    _userOrders = fetched;
    notifyListeners();
  }

  Future<void> _loadSavedFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getStringList('user_favorites');
      if (saved != null) {
        _favorites.clear();
        _favorites.addAll(saved);
        notifyListeners();
      }
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
    if (_favorites.contains(id)) {
      _favorites.remove(id);
    } else {
      _favorites.add(id);
    }
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('user_favorites', _favorites.toList());
    } catch (e) {
      debugPrint('Error saving favorites: $e');
    }
  }

  bool isFavorite(String id) => _favorites.contains(id);
  Set<String> get favoriteIds => _favorites;

  // AMOLED Mode Switch
  void toggleAmoledMode(bool value) {
    _isAmoledMode = value;
    notifyListeners();
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
  void logout() {
    _isLoggedIn = false;
    notifyListeners();
  }

  void login({String? name, String? email}) {
    _isLoggedIn = true;
    if (name != null && name.isNotEmpty) _userName = name;
    if (email != null && email.isNotEmpty) _userEmail = email;
    notifyListeners();
  }

  void updateProfile({required String name, required String email, required String phone}) {
    _userName = name;
    _userEmail = email;
    _userPhone = phone;
    notifyListeners();
  }

  void updateAvatar(String newAvatarUrl) {
    if (newAvatarUrl.isNotEmpty) {
      _userAvatar = newAvatarUrl;
      notifyListeners();
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

    return result['success'] == true;
  }
}
