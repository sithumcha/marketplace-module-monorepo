import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/listing.dart';

class ApiService {
  // Backend Express API URL
  static const String baseUrl = 'http://localhost:5000/api';

  /// Fetches real database listings directly from Express/MongoDB Backend API
  static Future<List<Listing>> fetchStoreItems() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/listings')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['listings'] != null) {
          final List list = data['listings'];
          return list.map((item) => Listing.fromJson(item)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching store items: $e');
    }
    return [];
  }

  /// Authenticates a user via Express Backend API
  static Future<Map<String, dynamic>> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final err = json.decode(response.body);
        return {'success': false, 'message': err['message'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Registers a user in the MongoDB database via Express Backend API
  static Future<Map<String, dynamic>> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String role,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          'role': role,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final err = json.decode(response.body);
        return {'success': false, 'message': err['message'] ?? 'Registration failed'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  /// Fetches real database user orders from Express/MongoDB Backend API for specific user
  static Future<List<Map<String, dynamic>>> fetchOrders([String? userEmail]) async {
    try {
      final Uri url = (userEmail != null && userEmail.isNotEmpty)
          ? Uri.parse('$baseUrl/orders?email=${Uri.encodeComponent(userEmail)}')
          : Uri.parse('$baseUrl/orders');

      final response = await http.get(url).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['orders'] != null) {
          final List list = data['orders'];
          return list.map((item) {
            return {
              'id': item['orderId'] ?? 'ORD-000',
              'itemTitle': item['itemTitle'] ?? 'Product Item',
              'price': (item['price'] is num) ? (item['price'] as num).toDouble() : 0.0,
              'quantity': item['quantity'] ?? 1,
              'image': item['image'] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
              'status': item['status'] ?? 'Processing',
              'statusColor': const Color(0xFF3B82F6),
              'date': item['createdAt'] != null
                  ? DateTime.parse(item['createdAt']).toLocal().toString().split(' ')[0]
                  : 'Today',
            };
          }).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    }
    return [];
  }

  /// Creates a new order in MongoDB database via Express API
  static Future<bool> createOrder(Map<String, dynamic> orderData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/orders'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(orderData),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('✅ Order saved to MongoDB: ${orderData['orderId']}');
        return true;
      }
    } catch (e) {
      debugPrint('Error creating order: $e');
    }
    return false;
  }

  /// Updates stock quantity of a listing in MongoDB
  static Future<bool> updateStockQuantity(String listingId, int quantity, String title) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/listings/$listingId/stock'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'quantity': quantity,
          'title': title,
        }),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        debugPrint('📉 Stock decreased in MongoDB for: $title');
        return true;
      }
    } catch (e) {
      debugPrint('Error updating stock in MongoDB: $e');
    }
    return false;
  }

  /// Cancels an order and restores stock in MongoDB
  static Future<bool> cancelOrder(String orderId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/orders/$orderId/cancel'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error cancelling order in MongoDB: $e');
    }
    return false;
  }

  /// Syncs user shopping cart items directly to MongoDB database
  static Future<bool> syncCartToDb(String userEmail, List<Map<String, dynamic>> cartItems) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/cart/sync'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userEmail': userEmail,
          'items': cartItems,
        }),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        debugPrint('✅ Cart synced to MongoDB for: $userEmail');
        return true;
      }
    } catch (e) {
      debugPrint('Error syncing cart to MongoDB: $e');
    }
    return false;
  }

  /// Fetches saved shopping cart items directly from MongoDB database
  static Future<List<Map<String, dynamic>>> fetchCartFromDb(String userEmail) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/cart?email=${Uri.encodeComponent(userEmail)}'),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['cart'] != null) {
          final List list = data['cart'];
          return list.map((item) => Map<String, dynamic>.from(item as Map)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching cart from MongoDB: $e');
    }
    return [];
  }

  static String authToken = '';

  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (authToken.isNotEmpty) 'Authorization': 'Bearer $authToken',
  };

  /// Merges local guest cart items with user's MongoDB database cart
  static Future<List<Map<String, dynamic>>> mergeCartToDb(String userEmail, List<Map<String, dynamic>> localCartItems) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/cart/merge'),
        headers: headers,
        body: json.encode({
          'userEmail': userEmail,
          'localCart': localCartItems,
        }),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['cart'] != null) {
          final List list = data['cart'];
          debugPrint('🔀 Guest cart merged in MongoDB: ${list.length} items');
          return list.map((item) => Map<String, dynamic>.from(item as Map)).toList();
        }
      }
    } catch (e) {
      debugPrint('Error merging guest cart in MongoDB: $e');
    }
    return [];
  }

  /// Fetches wishlist/favorites from MongoDB database for specific user
  static Future<List<String>> fetchWishlistFromDb(String userEmail) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/wishlist?email=${Uri.encodeComponent(userEmail)}'),
        headers: headers,
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['favorites'] != null) {
          final List list = data['favorites'];
          return list.map((e) => e.toString()).toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching wishlist from MongoDB: $e');
    }
    return [];
  }

  /// Toggles wishlist favorite item in MongoDB database
  static Future<List<String>> toggleWishlistInDb(String userEmail, String listingId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/wishlist/toggle'),
        headers: headers,
        body: json.encode({
          'email': userEmail,
          'listingId': listingId,
        }),
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['favorites'] != null) {
          final List list = data['favorites'];
          return list.map((e) => e.toString()).toList();
        }
      }
    } catch (e) {
      debugPrint('Error toggling wishlist in MongoDB: $e');
    }
    return [];
  }
  static Future<bool> saveAddressesToDb(String email, List<Map<String, String>> addresses) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/addresses'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'addresses': addresses}),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error saving addresses to MongoDB: $e');
    }
    return false;
  }

  /// Saves bank payout details to MongoDB database
  static Future<bool> saveBankPayoutToDb(String email, Map<String, String> bankDetails) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/bank-payout'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'bankPayoutDetails': bankDetails}),
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error saving bank payout to MongoDB: $e');
    }
    return false;
  }

  /// Fetches active promo codes from Express/MongoDB Backend API
  static Future<List<Map<String, dynamic>>> fetchPromoCodes() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/promos')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['promos'] != null) {
          final List list = data['promos'];
          return list.cast<Map<String, dynamic>>();
        }
      }
    } catch (e) {
      debugPrint('Error fetching promos: $e');
    }
    return [];
  }
}



