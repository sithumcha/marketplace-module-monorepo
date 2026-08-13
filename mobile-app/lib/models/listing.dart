class Listing {
  final String id;
  final String title;
  final String description;
  final String category;
  final double price;
  final int stockQuantity;
  final String condition;
  final bool isNegotiable;
  final bool isStoreItem;
  final String storeBadge;
  final List<String> images;
  final String locationAddress;
  final String sellerName;
  final String sellerAvatar;
  final String status;

  Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    required this.stockQuantity,
    required this.condition,
    required this.isNegotiable,
    required this.isStoreItem,
    required this.storeBadge,
    required this.images,
    required this.locationAddress,
    required this.sellerName,
    required this.sellerAvatar,
    required this.status,
  });

  factory Listing.fromJson(Map<String, dynamic> json) {
    List<String> parsedImages = [];
    if (json['images'] != null && json['images'] is List) {
      parsedImages = (json['images'] as List)
          .map((img) => img?.toString() ?? '')
          .where((img) => img.isNotEmpty)
          .toList();
    } else if (json['images'] != null && json['images'] is String) {
      parsedImages = [json['images'].toString()];
    }

    if (parsedImages.isEmpty) {
      parsedImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
    }

    // Sanitize image URLs to ensure broken 404 URLs are replaced
    parsedImages = parsedImages.map((img) {
      if (img.contains('photo-1580481072645') || img.isEmpty) {
        return 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800';
      }
      return img;
    }).toList();

    String sellerName = 'Official Store';
    String sellerAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    if (json['sellerId'] != null && json['sellerId'] is Map) {
      sellerName = json['sellerId']['name'] ?? 'Official Store';
      sellerAvatar = json['sellerId']['avatar'] ?? sellerAvatar;
    }

    String location = 'Store HQ';
    if (json['location'] != null && json['location'] is Map) {
      location = json['location']['address'] ?? 'Store HQ';
    }

    return Listing(
      id: json['_id'] ?? json['id'] ?? 'item_${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? 'Store Product',
      description: json['description'] ?? 'Official store product with warranty.',
      category: json['category'] ?? 'electronics',
      price: (json['price'] != null) ? (json['price'] as num).toDouble() : 0.0,
      stockQuantity: (json['stockQuantity'] != null) ? (json['stockQuantity'] as num).toInt() : 1,
      condition: json['condition'] ?? 'new',
      isNegotiable: json['isNegotiable'] ?? false,
      isStoreItem: json['isStoreItem'] ?? true,
      storeBadge: json['storeBadge'] ?? 'Official Store',
      images: parsedImages,
      locationAddress: location,
      sellerName: sellerName,
      sellerAvatar: sellerAvatar,
      status: json['status'] ?? 'active',
    );
  }
}
