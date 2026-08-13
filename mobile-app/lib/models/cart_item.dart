import 'listing.dart';

class CartItem {
  final Listing listing;
  int quantity;

  CartItem({
    required this.listing,
    this.quantity = 1,
  });

  double get totalPrice => listing.price * quantity;

  Map<String, dynamic> toJson() {
    return {
      'listing': listing.toJson(),
      'quantity': quantity,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      listing: Listing.fromJson(json['listing'] is Map<String, dynamic> ? json['listing'] : json['listing']),
      quantity: json['quantity'] ?? 1,
    );
  }
}
