import 'listing.dart';

class CartItem {
  final Listing listing;
  int quantity;

  CartItem({
    required this.listing,
    this.quantity = 1,
  });

  double get totalPrice => listing.price * quantity;
}
