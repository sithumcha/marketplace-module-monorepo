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
    final List<String> sanitizedImages = listing.images.map((img) {
      if (img.startsWith('data:image') || img.length > 300) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
      }
      return img;
    }).toList();

    return {
      'listing': {
        'id': listing.id,
        'title': listing.title,
        'description': listing.description,
        'category': listing.category,
        'price': listing.price,
        'stockQuantity': listing.stockQuantity,
        'condition': listing.condition,
        'isNegotiable': listing.isNegotiable,
        'isStoreItem': listing.isStoreItem,
        'storeBadge': listing.storeBadge,
        'images': sanitizedImages,
        'locationAddress': listing.locationAddress,
        'sellerName': listing.sellerName,
        'sellerAvatar': listing.sellerAvatar,
        'status': listing.status,
      },
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
