import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import 'profile_options_screens.dart';

ImageProvider getProfileImageProvider(String url) {
  if (url.startsWith('data:image')) {
    try {
      final base64Content = url.split(',').last;
      return MemoryImage(base64Decode(base64Content));
    } catch (e) {}
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return NetworkImage(url);
  }
  return const NetworkImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300');
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String _authMode = 'signin'; // 'signin' or 'signup'

  final TextEditingController _loginEmailController = TextEditingController(text: 'sithum@marketplace.lk');
  final TextEditingController _loginPassController = TextEditingController(text: '••••••••');

  // Sign Up Controllers
  final TextEditingController _signupNameController = TextEditingController();
  final TextEditingController _signupEmailController = TextEditingController();
  final TextEditingController _signupPhoneController = TextEditingController();
  final TextEditingController _signupPassController = TextEditingController();
  final TextEditingController _signupConfirmPassController = TextEditingController();
  String _signupRole = 'Buyer / Shopper';
  bool _agreeTerms = true;

  @override
  void dispose() {
    _loginEmailController.dispose();
    _loginPassController.dispose();
    _signupNameController.dispose();
    _signupEmailController.dispose();
    _signupPhoneController.dispose();
    _signupPassController.dispose();
    _signupConfirmPassController.dispose();
    super.dispose();
  }

  void _showEditProfileModal(BuildContext context, AppProvider provider) {
    final nameCtrl = TextEditingController(text: provider.userName);
    final emailCtrl = TextEditingController(text: provider.userEmail);
    final phoneCtrl = TextEditingController(text: provider.userPhone);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Edit User Profile',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildModalTextField('Full Name', nameCtrl, LucideIcons.user),
              const SizedBox(height: 12),
              _buildModalTextField('Email Address', emailCtrl, LucideIcons.mail),
              const SizedBox(height: 12),
              _buildModalTextField('Phone Number', phoneCtrl, LucideIcons.phone),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    provider.updateProfile(
                      name: nameCtrl.text,
                      email: emailCtrl.text,
                      phone: phoneCtrl.text,
                    );
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✅ Profile updated successfully!'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  },
                  child: Text('Save Changes', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAvatarUploadModal(BuildContext context, AppProvider provider) {
    final urlCtrl = TextEditingController(text: provider.userAvatar);
    String selectedUrl = provider.userAvatar;

    final List<String> presetAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Change Profile Photo',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: CircleAvatar(
                      radius: 45,
                      backgroundImage: getProfileImageProvider(selectedUrl),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Upload Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF818CF8),
                        side: const BorderSide(color: Color(0xFF818CF8)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () async {
                        try {
                          final picker = ImagePicker();
                          final picked = await picker.pickImage(
                            source: ImageSource.gallery,
                            maxWidth: 600,
                            maxHeight: 600,
                            imageQuality: 85,
                          );
                          if (picked != null) {
                            final bytes = await picked.readAsBytes();
                            final base64Str = base64Encode(bytes);
                            final mimeType = picked.mimeType ?? 'image/jpeg';
                            final dataUrl = 'data:$mimeType;base64,$base64Str';
                            setModalState(() {
                              selectedUrl = dataUrl;
                              urlCtrl.text = dataUrl;
                            });
                          }
                        } catch (e) {
                          debugPrint('Image picker error: $e');
                        }
                      },
                      icon: const Icon(LucideIcons.uploadCloud, size: 18),
                      label: Text('Upload Image from Gallery / File', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),

                  const SizedBox(height: 16),
                  Text('Or Select a Preset Avatar', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF9CA3AF))),
                  const SizedBox(height: 10),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: presetAvatars.map((url) {
                      final isSel = selectedUrl == url;
                      return GestureDetector(
                        onTap: () {
                          setModalState(() {
                            selectedUrl = url;
                            urlCtrl.text = url;
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSel ? const Color(0xFF6366F1) : Colors.transparent,
                              width: 3,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 18,
                            backgroundImage: NetworkImage(url),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 16),
                  Text('Or Paste Custom Image URL', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF9CA3AF))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: urlCtrl,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'https://...',
                      hintStyle: GoogleFonts.inter(color: const Color(0xFF64748B)),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
                    ),
                    onChanged: (val) {
                      setModalState(() {
                        selectedUrl = val.isNotEmpty ? val : provider.userAvatar;
                      });
                    },
                  ),

                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        provider.updateAvatar(selectedUrl);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('📸 Profile photo updated successfully!'),
                            backgroundColor: Color(0xFF10B981),
                          ),
                        );
                      },
                      child: Text('Save Profile Photo', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showLogoutDialog(BuildContext context, AppProvider provider) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(LucideIcons.logOut, color: Color(0xFFEF4444), size: 22),
              const SizedBox(width: 10),
              Text(
                'Log Out?',
                style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
              ),
            ],
          ),
          content: Text(
            'Are you sure you want to log out of your Marketplace account?',
            style: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 13, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                Navigator.pop(context);
                provider.logout();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('👋 Logged out successfully.'),
                    backgroundColor: Color(0xFFEF4444),
                  ),
                );
              },
              child: Text('Log Out', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildModalTextField(String label, TextEditingController controller, IconData icon) {
    return TextField(
      controller: controller,
      style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 12),
        prefixIcon: Icon(icon, color: const Color(0xFF818CF8), size: 16),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF6366F1))),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);

    if (!provider.isLoggedIn) {
      return _buildLoggedOutView(context, provider);
    }

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => _showAvatarUploadModal(context, provider),
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 34,
                        backgroundImage: getProfileImageProvider(provider.userAvatar),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF1E293B), width: 2),
                          ),
                          child: const Icon(LucideIcons.camera, size: 12, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              provider.userName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'VERIFIED',
                              style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.bold, color: const Color(0xFF818CF8)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(provider.userEmail, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF9CA3AF))),
                      Text(provider.userPhone, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF))),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.edit3, color: Color(0xFF818CF8), size: 18),
                  onPressed: () => _showEditProfileModal(context, provider),
                  tooltip: 'Edit Profile',
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Stats Cards Row
          Row(
            children: [
              _buildStatCard(
                'Saved Items',
                '${provider.favorites.length}',
                LucideIcons.heart,
                const Color(0xFFEF4444),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                  );
                },
              ),
              const SizedBox(width: 12),
              _buildStatCard(
                'My Orders',
                '${provider.userOrders.length}',
                LucideIcons.package,
                const Color(0xFF6366F1),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Options List
          _buildOptionTile(
            icon: LucideIcons.package,
            title: 'My Orders (${provider.userOrders.length})',
            subtitle: provider.userOrders.isEmpty ? 'No orders placed yet' : '${provider.userOrders.length} order(s) recorded',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
              );
            },
          ),
          _buildOptionTile(
            icon: LucideIcons.heart,
            title: 'Saved Favorites (${provider.favorites.length})',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FavoritesScreen()),
              );
            },
          ),
          _buildOptionTile(
            icon: LucideIcons.shieldCheck,
            title: 'Safety Guidelines & Security',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SafetySecurityScreen()),
              );
            },
          ),
          _buildOptionTile(
            icon: LucideIcons.settings,
            title: 'Settings & Preferences',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),

          const SizedBox(height: 10),

          // Functional Log Out Button
          _buildOptionTile(
            icon: LucideIcons.logOut,
            title: 'Log Out of Account',
            isDanger: true,
            onTap: () => _showLogoutDialog(context, provider),
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildLoggedOutView(BuildContext context, AppProvider provider) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.userPlus, size: 42, color: Color(0xFF818CF8)),
            ),
            const SizedBox(height: 16),
            Text(
              _authMode == 'signin' ? 'Welcome Back!' : 'Create New Account',
              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              _authMode == 'signin'
                  ? 'Sign in to access your orders, favorites, and wallet.'
                  : 'Join Marketplace to buy, sell, and negotiate items.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
            ),
            const SizedBox(height: 20),

            // Segmented Tab Switcher (Sign In vs Sign Up)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _authMode = 'signin'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _authMode == 'signin' ? const Color(0xFF6366F1) : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            'Sign In',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _authMode == 'signin' ? Colors.white : const Color(0xFF9CA3AF),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _authMode = 'signup'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _authMode == 'signup' ? const Color(0xFF6366F1) : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            'Sign Up (Register)',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _authMode == 'signup' ? Colors.white : const Color(0xFF9CA3AF),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Form Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: _authMode == 'signin'
                  ? _buildSignInForm(context, provider)
                  : _buildSignUpForm(context, provider),
            ),

            const SizedBox(height: 16),

            // Quick Demo Login Button
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF818CF8),
                side: const BorderSide(color: Color(0xFF818CF8)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onPressed: () {
                provider.login(name: 'Sithum Nethsara', email: 'sithum@marketplace.lk');
              },
              child: Text('⚡ Quick Demo Login as Sithum Nethsara', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignInForm(BuildContext context, AppProvider provider) {
    return Column(
      children: [
        _buildModalTextField('Email Address', _loginEmailController, LucideIcons.mail),
        const SizedBox(height: 12),
        _buildModalTextField('Password', _loginPassController, LucideIcons.lock),
        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              provider.login(
                name: 'Sithum Nethsara',
                email: _loginEmailController.text,
              );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🎉 Welcome back to Marketplace!'),
                  backgroundColor: Color(0xFF10B981),
                ),
              );
            },
            child: Text('Sign In to Account', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () => setState(() => _authMode = 'signup'),
          child: Text(
            'Don\'t have an account? Sign Up now',
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF818CF8), fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildSignUpForm(BuildContext context, AppProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildModalTextField('Full Name', _signupNameController, LucideIcons.user),
        const SizedBox(height: 12),
        _buildModalTextField('Email Address', _signupEmailController, LucideIcons.mail),
        const SizedBox(height: 12),
        _buildModalTextField('Phone Number', _signupPhoneController, LucideIcons.phone),
        const SizedBox(height: 14),

        // Account Role Selector
        Text('Account Role', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF9CA3AF))),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                selected: _signupRole == 'Buyer / Shopper',
                selectedColor: const Color(0xFF6366F1),
                backgroundColor: const Color(0xFF0F172A),
                side: BorderSide(color: _signupRole == 'Buyer / Shopper' ? const Color(0xFF6366F1) : const Color(0xFF334155)),
                label: Text('🛍️ Buyer', style: GoogleFonts.inter(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                onSelected: (_) => setState(() => _signupRole = 'Buyer / Shopper'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                selected: _signupRole == 'Seller / Merchant',
                selectedColor: const Color(0xFF6366F1),
                backgroundColor: const Color(0xFF0F172A),
                side: BorderSide(color: _signupRole == 'Seller / Merchant' ? const Color(0xFF6366F1) : const Color(0xFF334155)),
                label: Text('🏪 Seller', style: GoogleFonts.inter(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                onSelected: (_) => setState(() => _signupRole = 'Seller / Merchant'),
              ),
            ),
          ],
        ),

        const SizedBox(height: 14),
        _buildModalTextField('Password', _signupPassController, LucideIcons.lock),
        const SizedBox(height: 12),
        _buildModalTextField('Confirm Password', _signupConfirmPassController, LucideIcons.lock),
        const SizedBox(height: 12),

        // Terms & Conditions Checkbox
        Row(
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Checkbox(
                value: _agreeTerms,
                activeColor: const Color(0xFF6366F1),
                side: const BorderSide(color: Color(0xFF9CA3AF)),
                onChanged: (val) => setState(() => _agreeTerms = val ?? true),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'I agree to Marketplace Terms & Privacy Policy',
                style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF)),
              ),
            ),
          ],
        ),

        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              final name = _signupNameController.text.isNotEmpty ? _signupNameController.text : 'New User';
              final email = _signupEmailController.text.isNotEmpty ? _signupEmailController.text : 'user@marketplace.lk';
              final phone = _signupPhoneController.text.isNotEmpty ? _signupPhoneController.text : '+94 77 000 0000';
              final password = _signupPassController.text.isNotEmpty ? _signupPassController.text : 'password123';

              await provider.registerUser(
                name: name,
                email: email,
                phone: phone,
                password: password,
                role: _signupRole.toLowerCase().contains('seller') ? 'seller' : 'buyer',
              );

              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('🎉 Account created & saved to Database! Welcome, $name.'),
                  backgroundColor: const Color(0xFF10B981),
                ),
              );
            },
            child: Text('Register & Create Account', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
          ),
        ),

        const SizedBox(height: 12),
        Center(
          child: GestureDetector(
            onTap: () => setState(() => _authMode = 'signin'),
            child: Text(
              'Already have an account? Sign In',
              style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF818CF8), fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, {VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Row(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(value, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(label, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOptionTile({
    required IconData icon,
    required String title,
    String? subtitle,
    bool isDanger = false,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDanger ? const Color(0xFFEF4444).withOpacity(0.4) : const Color(0xFF334155)),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: isDanger ? const Color(0xFFEF4444) : const Color(0xFF818CF8), size: 18),
        title: Text(title, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: isDanger ? const Color(0xFFEF4444) : Colors.white)),
        subtitle: subtitle != null ? Text(subtitle, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9CA3AF))) : null,
        trailing: Icon(Icons.chevron_right, color: isDanger ? const Color(0xFFEF4444) : const Color(0xFF9CA3AF), size: 18),
      ),
    );
  }
}

