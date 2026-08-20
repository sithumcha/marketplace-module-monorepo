import 'package:flutter/material.dart';

class LocaleProvider extends ChangeNotifier {
  String _locale = 'en'; // 'en' or 'si'

  String get locale => _locale;
  bool get isSinhala => _locale == 'si';

  void setLocale(String langCode) {
    if (_locale != langCode) {
      _locale = langCode;
      notifyListeners();
    }
  }

  void toggleLanguage() {
    _locale = _locale == 'en' ? 'si' : 'en';
    notifyListeners();
  }

  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'appTitle': 'Marketplace Pro',
      'home': 'Home',
      'search': 'Search',
      'chats': 'Chats',
      'profile': 'Profile',
      'cart': 'Shopping Cart',
      'searchPlaceholder': 'Search products, electronics, vehicles...',
      'sellItem': 'Sell Item',
      'categories': 'Explore Categories',
      'featuredItems': 'Featured Store Items',
      'addToCart': 'Add to Cart',
      'checkout': 'Proceed to Checkout',
      'subtotal': 'Subtotal',
      'langToggle': 'සිංහල',
      'sellerTyping': 'Seller is typing...',
      'makeOffer': 'Submit Counter Offer',
      'acceptOffer': 'Accept Offer',
      'rejectOffer': 'Reject Offer',
      'filterTitle': 'Filter & Sort Products',
      'priceRange': 'Price Range (USD)',
      'sortBy': 'Sort By',
      'applyFilter': 'Apply Filters',
    },
    'si': {
      'appTitle': 'මාර්කට්ප්ලේස් ප්‍රෝ',
      'home': 'මුල් පිටුව',
      'search': 'සොයන්න',
      'chats': 'සංවාද',
      'profile': 'ගිණුම',
      'cart': 'කාට් එක',
      'searchPlaceholder': 'භාණ්ඩ, ඉලෙක්ට්‍රොනික්ස්, වාහන සොයන්න...',
      'sellItem': 'විකුණන්න',
      'categories': 'ප්‍රධාන වර්ගීකරණයන්',
      'featuredItems': 'විශේෂිත භාණ්ඩ',
      'addToCart': 'කාට් එකට එක්කරන්න',
      'checkout': 'මිලදී ගන්න',
      'subtotal': 'මුළු එකතුව',
      'langToggle': 'English',
      'sellerTyping': 'විකුණුම්කරු සටහන් කරමින් පවතී...',
      'makeOffer': 'මිල ඉදිරිපත් කරන්න',
      'acceptOffer': 'පිළිගන්න',
      'rejectOffer': 'ප්‍රතික්ෂේප කරන්න',
      'filterTitle': 'භාණ්ඩ පෙරහන සහ වර්ග කිරීම',
      'priceRange': 'මිල පරාසය (USD)',
      'sortBy': 'වර්ග කරන ආකාරය',
      'applyFilter': 'පෙරහන යොදන්න',
    },
  };

  String getText(String key) {
    return _localizedValues[_locale]?[key] ?? _localizedValues['en']?[key] ?? key;
  }
}
