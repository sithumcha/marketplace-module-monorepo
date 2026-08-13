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
    Map<String, dynamic> listingMap = {};
    if (json.containsKey('listing') && json['listing'] is Map) {
      listingMap = Map<String, dynamic>.from(json['listing'] as Map);
    } else {
      listingMap = Map<String, dynamic>.from(json);
    }
    return CartItem(
      listing: Listing.fromJson(listingMap),
      quantity: (json['quantity'] != null) ? (json['quantity'] as num).toInt() : 1,
    );
  }
}
