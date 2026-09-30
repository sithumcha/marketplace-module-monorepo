import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../services/api_service.dart';
import 'create_listing_screen.dart';
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

  final TextEditingController _loginEmailController = TextEditingController();
  final TextEditingController _loginPassController = TextEditingController();

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
      backgroundColor: provider.cardBg,
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
                    'Edit Profile Information',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: provider.textColor),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildModalTextField('Full Name', nameCtrl, LucideIcons.user, provider),
              const SizedBox(height: 12),
              _buildModalTextField('Email Address', emailCtrl, LucideIcons.mail, provider),
              const SizedBox(height: 12),
              _buildModalTextField('Phone Number', phoneCtrl, LucideIcons.phone, provider),
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

  void _showBankPayoutModal(BuildContext context, AppProvider provider) {
    final details = provider.bankPayoutDetails;
    final bankCtrl = TextEditingController(text: details['bankName']);
    final holderCtrl = TextEditingController(text: details['accountHolder']);
    final numberCtrl = TextEditingController(text: details['accountNumber']);
    final branchCtrl = TextEditingController(text: details['branch']);
    final swiftCtrl = TextEditingController(text: details['swiftCode']);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: provider.cardBg,
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
                    'Payment & Bank Payouts',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: provider.textColor),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.landmark, color: Color(0xFF6366F1), size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            details['bankName'] ?? 'Bank of Ceylon',
                            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                          ),
                          Text(
                            'Acc: ${details['accountNumber']} • ${details['accountHolder']}',
                            style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text('Update Bank Account Details', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
              const SizedBox(height: 10),
              _buildModalTextField('Bank Name', bankCtrl, LucideIcons.building, provider),
              const SizedBox(height: 10),
              _buildModalTextField('Account Holder Name', holderCtrl, LucideIcons.userCheck, provider),
              const SizedBox(height: 10),
              _buildModalTextField('Account Number', numberCtrl, LucideIcons.creditCard, provider),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _buildModalTextField('Branch', branchCtrl, LucideIcons.mapPin, provider)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildModalTextField('SWIFT / BIC Code', swiftCtrl, LucideIcons.hash, provider)),
                ],
              ),
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
                    provider.updateBankPayoutDetails(
                      bankName: bankCtrl.text,
                      accountHolder: holderCtrl.text,
                      accountNumber: numberCtrl.text,
                      branch: branchCtrl.text,
                      swiftCode: swiftCtrl.text,
                    );
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('💳 Bank payout details saved successfully!'),
                        backgroundColor: Color(0xFF10B981),
                      ),
                    );
                  },
                  child: Text('Save Bank Details', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSavedAddressesModal(BuildContext context, AppProvider provider) {
    final labelCtrl = TextEditingController();
    final nameCtrl = TextEditingController(text: provider.userName);
    final addressCtrl = TextEditingController();
    final cityCtrl = TextEditingController(text: 'Colombo');
    final phoneCtrl = TextEditingController(text: provider.userPhone);
    String? modalError;
    String? editingId;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: provider.cardBg,
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
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Saved Delivery Addresses',
                          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                        ),
                        IconButton(
                          icon: Icon(Icons.close, color: provider.textColor),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Popup Error Alert Displayed ON TOP inside Modal
                    if (modalError != null) ...[
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.alertTriangle, color: Color(0xFFDC2626), size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                modalError!,
                                style: GoogleFonts.inter(
                                  color: const Color(0xFF991B1B),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => setModalState(() => modalError = null),
                              child: const Icon(Icons.close, color: Color(0xFF991B1B), size: 18),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // List of saved addresses
                    if (provider.savedAddresses.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        child: Text('No saved addresses. Add a new address below.', style: GoogleFonts.inter(color: provider.subtextColor, fontSize: 12)),
                      )
                    else
                      Column(
                        children: provider.savedAddresses.map((addr) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: provider.inputBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: provider.cardBorder),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(LucideIcons.mapPin, color: Color(0xFF0284C7), size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(addr['label'] ?? 'Address', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.textColor)),
                                      const SizedBox(height: 2),
                                      Text(addr['fullName'] ?? '', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor, fontWeight: FontWeight.w600)),
                                      Text('${addr['addressLine']}, ${addr['city']}', style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor)),
                                      Text(addr['phone'] ?? '', style: GoogleFonts.inter(fontSize: 10, color: provider.subtextColor)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.edit2, color: Color(0xFF0284C7), size: 18),
                                  onPressed: () {
                                    setModalState(() {
                                      editingId = addr['id'];
                                      labelCtrl.text = addr['label'] ?? '';
                                      nameCtrl.text = addr['fullName'] ?? provider.userName;
                                      addressCtrl.text = addr['addressLine'] ?? '';
                                      cityCtrl.text = addr['city'] ?? 'Colombo';
                                      phoneCtrl.text = addr['phone'] ?? provider.userPhone;
                                      modalError = null;
                                    });
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.trash2, color: Color(0xFFEF4444), size: 18),
                                  onPressed: () {
                                    provider.removeSavedAddress(addr['id']!);
                                    if (editingId == addr['id']) {
                                      editingId = null;
                                    }
                                    setModalState(() {});
                                  },
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),

                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          editingId != null ? 'Edit Delivery Address' : '+ Add New Delivery Address',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: provider.textColor),
                        ),
                        if (editingId != null)
                          TextButton(
                            onPressed: () {
                              setModalState(() {
                                editingId = null;
                                labelCtrl.clear();
                                nameCtrl.text = provider.userName;
                                addressCtrl.clear();
                                cityCtrl.text = 'Colombo';
                                phoneCtrl.text = provider.userPhone;
                                modalError = null;
                              });
                            },
                            child: Text('Cancel Edit', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFEF4444), fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildModalTextField('Address Label (e.g. Home / Work / Store)', labelCtrl, LucideIcons.tag, provider),
                    const SizedBox(height: 10),
                    _buildModalTextField('Recipient Full Name', nameCtrl, LucideIcons.user, provider),
                    const SizedBox(height: 10),
                    _buildModalTextField('Street Address Line', addressCtrl, LucideIcons.home, provider),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: _buildModalTextField('City / District', cityCtrl, LucideIcons.mapPin, provider)),
                        const SizedBox(width: 10),
                        Expanded(child: _buildModalTextField('Phone Number', phoneCtrl, LucideIcons.phone, provider)),
                      ],
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0284C7),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          if (addressCtrl.text.trim().isEmpty) {
                            setModalState(() {
                              modalError = '⚠️ Please enter street address line.';
                            });
                            return;
                          }
                          if (phoneCtrl.text.trim().isEmpty) {
                            setModalState(() {
                              modalError = '⚠️ Please enter phone number.';
                            });
                            return;
                          }

                          if (editingId != null) {
                            provider.updateSavedAddress(
                              id: editingId!,
                              label: labelCtrl.text.isNotEmpty ? labelCtrl.text : 'Delivery Address',
                              fullName: nameCtrl.text.isNotEmpty ? nameCtrl.text : provider.userName,
                              addressLine: addressCtrl.text,
                              city: cityCtrl.text,
                              phone: phoneCtrl.text,
                            );
                          } else {
                            provider.addSavedAddress(
                              label: labelCtrl.text.isNotEmpty ? labelCtrl.text : 'New Delivery Address',
                              fullName: nameCtrl.text.isNotEmpty ? nameCtrl.text : provider.userName,
                              addressLine: addressCtrl.text,
                              city: cityCtrl.text,
                              phone: phoneCtrl.text,
                            );
                          }

                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(editingId != null ? '📍 Delivery address updated successfully!' : '📍 Delivery address added successfully!'),
                              backgroundColor: const Color(0xFF10B981),
                            ),
                          );
                        },
                        child: Text(
                          editingId != null ? 'Save Address Changes' : 'Add New Address',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
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
      backgroundColor: provider.cardBg,
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
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                      ),
                      IconButton(
                        icon: Icon(Icons.close, color: provider.textColor),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFFA855F7), Color(0xFFEC4899)],
                        ),
                      ),
                      child: CircleAvatar(
                        radius: 42,
                        backgroundImage: getProfileImageProvider(selectedUrl),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Upload Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6366F1),
                        side: const BorderSide(color: Color(0xFF6366F1)),
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
                      label: Text('Upload Photo from Gallery', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),

                  const SizedBox(height: 16),
                  Text('Or Select Preset Avatar', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: provider.subtextColor)),
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
                            content: Text('📸 Profile photo updated!'),
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
          backgroundColor: provider.cardBg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(LucideIcons.logOut, color: Color(0xFFEF4444), size: 22),
              const SizedBox(width: 10),
              Text(
                'Log Out?',
                style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: provider.textColor, fontSize: 18),
              ),
            ],
          ),
          content: Text(
            'Are you sure you want to log out of your Marketplace Pro account?',
            style: GoogleFonts.inter(color: provider.subtextColor, fontSize: 13, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: GoogleFonts.inter(color: provider.subtextColor, fontWeight: FontWeight.bold)),
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

  Widget _buildModalTextField(String label, TextEditingController controller, IconData icon, AppProvider provider) {
    return TextField(
      controller: controller,
      style: GoogleFonts.inter(color: provider.textColor, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.inter(color: provider.subtextColor, fontSize: 12),
        prefixIcon: Icon(icon, color: const Color(0xFF6366F1), size: 16),
        filled: true,
        fillColor: provider.inputBg,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: provider.cardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: provider.cardBorder)),
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

    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // 1. Top App Header Bar
            _buildTopAppBar(context, provider),

            const SizedBox(height: 14),

            // 2. Main User Profile Card with Gradient Accent & Verified Badge
            _buildUserProfileCard(context, provider),

            const SizedBox(height: 16),

            // 3. 4-Column Quick Stats Grid
            _buildStatsGrid(context, provider),

            const SizedBox(height: 16),

            // 4. Marketplace Membership Banner (Purple Gradient)
            _buildMembershipBanner(context, provider),

            const SizedBox(height: 18),

            // 5. Menu Section: Marketplace Hub
            _buildMarketplaceHubSection(context, provider),

            const SizedBox(height: 16),

            // 6. Menu Section: Preferences & Support
            _buildPreferencesSection(context, provider),

            const SizedBox(height: 20),

            // 7. Footer Info
            Center(
              child: Text(
                'Marketplace Pro Sri Lanka • Protected by SecurePay',
                style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }


  // 1. Top Header Component
  Widget _buildTopAppBar(BuildContext context, AppProvider provider) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(LucideIcons.user, color: Color(0xFF6366F1), size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Profile',
                  style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: provider.textColor),
                ),
                Text(
                  'Marketplace Pro Account',
                  style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ],
        ),
        Row(
          children: [
            // Settings Button
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                );
              },
              borderRadius: BorderRadius.circular(20),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: provider.cardBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: provider.cardBorder),
                ),
                child: Icon(LucideIcons.settings, color: provider.textColor, size: 18),
              ),
            ),
            const SizedBox(width: 8),
            // Share Button
            InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('🔗 Profile link copied to clipboard!')),
                );
              },
              borderRadius: BorderRadius.circular(20),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: provider.cardBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: provider.cardBorder),
                ),
                child: Icon(LucideIcons.share2, color: provider.textColor, size: 18),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 2. User Profile Card
  Widget _buildUserProfileCard(BuildContext context, AppProvider provider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: provider.cardBg,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: provider.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // User Avatar with Camera Badge
          Stack(
            children: [
              Container(
                padding: const EdgeInsets.all(3.5),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Color(0xFF605DEC), Color(0xFF8553F2), Color(0xFFDC429B)],
                  ),
                ),
                child: CircleAvatar(
                  radius: 44,
                  backgroundImage: getProfileImageProvider(provider.userAvatar),
                ),
              ),
              Positioned(
                bottom: 2,
                right: 2,
                child: GestureDetector(
                  onTap: () => _showAvatarUploadModal(context, provider),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4F46E5),
                      shape: BoxShape.circle,
                      border: Border.all(color: provider.cardBg, width: 2.5),
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                    ),
                    child: const Icon(LucideIcons.camera, size: 14, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // User Name & Verified Checkmark
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                provider.userName,
                style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: provider.textColor),
              ),
              const SizedBox(width: 5),
              const Icon(Icons.verified, color: Color(0xFF6366F1), size: 20),
            ],
          ),

          const SizedBox(height: 6),

          // Pro Seller Status Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.25)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF6366F1), shape: BoxShape.circle)),
                const SizedBox(width: 6),
                Text(
                  'Pro Seller • Verified Store',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF6366F1)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Email & Phone with quick edit
          Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.mail, size: 14, color: provider.subtextColor),
                  const SizedBox(width: 6),
                  Text(provider.userEmail, style: GoogleFonts.inter(fontSize: 12, color: provider.textColor, fontWeight: FontWeight.w500)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.phone, size: 14, color: provider.subtextColor),
                  const SizedBox(width: 6),
                  Text(provider.userPhone, style: GoogleFonts.inter(fontSize: 12, color: provider.textColor, fontWeight: FontWeight.w500)),
                  const SizedBox(width: 4),
                  GestureDetector(
                    onTap: () => _showEditProfileModal(context, provider),
                    child: const Icon(LucideIcons.edit2, size: 13, color: Color(0xFF6366F1)),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFF334155)),
          const SizedBox(height: 14),

          // Action Buttons: Edit Profile & Store Dashboard
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: provider.chipBg,
                    foregroundColor: provider.textColor,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => _showEditProfileModal(context, provider),
                  icon: const Icon(LucideIcons.edit, size: 14),
                  label: Text('Edit Profile', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1).withOpacity(0.15),
                    foregroundColor: const Color(0xFF6366F1),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                    );
                  },
                  icon: const Icon(LucideIcons.barChart2, size: 14),
                  label: Text('Store Dashboard', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Stats Grid Component (4 Columns)
  Widget _buildStatsGrid(BuildContext context, AppProvider provider) {
    return Row(
      children: [
        _buildStatTile(
          provider: provider,
          icon: LucideIcons.package,
          iconBg: const Color(0xFFEEF2FF),
          iconColor: const Color(0xFF6366F1),
          value: '${provider.listings.length}',
          label: 'Listings',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
            );
          },
        ),
        const SizedBox(width: 8),
        _buildStatTile(
          provider: provider,
          icon: LucideIcons.heart,
          iconBg: const Color(0xFFFFE4E6),
          iconColor: const Color(0xFFF43F5E),
          value: '${provider.favorites.length}',
          label: 'Wishlist',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const FavoritesScreen()),
            );
          },
        ),
        const SizedBox(width: 8),
        _buildStatTile(
          provider: provider,
          icon: LucideIcons.checkCircle2,
          iconBg: const Color(0xFFD1FAE5),
          iconColor: const Color(0xFF10B981),
          value: '${provider.userOrders.length}',
          label: 'Sold',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
            );
          },
        ),
        const SizedBox(width: 8),
        _buildStatTile(
          provider: provider,
          icon: LucideIcons.star,
          iconBg: const Color(0xFFFEF3C7),
          iconColor: const Color(0xFFF59E0B),
          value: '4.9',
          label: '28 reviews',
        ),
      ],
    );
  }

  Widget _buildStatTile({
    required AppProvider provider,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String value,
    required String label,
    VoidCallback? onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: provider.cardBg,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: provider.cardBorder),
          ),
          child: Column(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: provider.textColor),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 10, color: provider.subtextColor, fontWeight: FontWeight.w500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 4. Membership Banner
  Widget _buildMembershipBanner(BuildContext context, AppProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF605DEC), Color(0xFF8553F2), Color(0xFFDC429B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF605DEC).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'PRO SELLER TIER',
                    style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Boost Your Listings',
                  style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 2),
                Text(
                  '0% fee on next 5 sold items this month',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.white.withOpacity(0.85)),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF4F46E5),
              elevation: 2,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('✨ Pro Seller membership active!')),
              );
            },
            child: Text('Upgrade', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // 5. Menu Group: Marketplace Hub (My Listings Removed as requested)
  Widget _buildMarketplaceHubSection(BuildContext context, AppProvider provider) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: provider.cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: provider.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 10, top: 4, bottom: 8),
            child: Text(
              'MARKETPLACE HUB',
              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: provider.subtextColor, letterSpacing: 0.8),
            ),
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.shoppingBag,
            iconBg: const Color(0xFFD1FAE5),
            iconColor: const Color(0xFF10B981),
            title: 'Orders & Purchases',
            subtitle: 'Track shipments & history',
            badgeText: '${provider.userOrders.length} in transit',
            badgeBg: const Color(0xFFD1FAE5),
            badgeTextColor: const Color(0xFF10B981),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
              );
            },
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.creditCard,
            iconBg: const Color(0xFFF3E8FF),
            iconColor: const Color(0xFF9333EA),
            title: 'Payment & Bank Payouts',
            subtitle: '${provider.bankPayoutDetails['bankName']} • ${provider.bankPayoutDetails['accountNumber']}',
            onTap: () => _showBankPayoutModal(context, provider),
          ),
        ],
      ),
    );
  }

  // 6. Menu Group: Preferences & Support
  Widget _buildPreferencesSection(BuildContext context, AppProvider provider) {
    final firstAddr = provider.savedAddresses.isNotEmpty ? provider.savedAddresses.first['addressLine'] : 'Colombo, Sri Lanka';
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: provider.cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: provider.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 10, top: 4, bottom: 8),
            child: Text(
              'PREFERENCES & SUPPORT',
              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: provider.subtextColor, letterSpacing: 0.8),
            ),
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.mapPin,
            iconBg: const Color(0xFFE0F2FE),
            iconColor: const Color(0xFF0284C7),
            title: 'Saved Addresses',
            subtitle: '$firstAddr (${provider.savedAddresses.length} saved)',
            onTap: () => _showSavedAddressesModal(context, provider),
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.languages,
            iconBg: const Color(0xFFFEF3C7),
            iconColor: const Color(0xD9D97706),
            title: 'Language',
            badgeText: 'සිංහල / English',
            badgeBg: const Color(0xFFEEF2FF),
            badgeTextColor: const Color(0xFF4F46E5),
            onTap: () {},
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.bell,
            iconBg: const Color(0xFFF3E8FF),
            iconColor: const Color(0xFFA855F7),
            title: 'Notifications & Alerts',
            showDot: true,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.helpCircle,
            iconBg: const Color(0xFFF1F5F9),
            iconColor: const Color(0xFF64748B),
            title: 'Help Center & FAQ',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SafetySecurityScreen()),
              );
            },
          ),

          _buildMenuTile(
            provider: provider,
            icon: LucideIcons.logOut,
            iconBg: const Color(0xFFFFE4E6),
            iconColor: const Color(0xFFF43F5E),
            title: 'Log Out',
            badgeText: 'v2.4.1',
            badgeBg: Colors.transparent,
            badgeTextColor: const Color(0xFFF43F5E),
            isDanger: true,
            onTap: () => _showLogoutDialog(context, provider),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile({
    required AppProvider provider,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    String? subtitle,
    String? badgeText,
    Color? badgeBg,
    Color? badgeTextColor,
    bool showDot = false,
    bool isDanger = false,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        leading: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDanger ? const Color(0xFFF43F5E) : provider.textColor,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
              )
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badgeText != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeBg ?? const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badgeText,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: badgeTextColor ?? const Color(0xFF4F46E5),
                  ),
                ),
              ),
            if (showDot)
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF4F46E5),
                  shape: BoxShape.circle,
                ),
              ),
            const SizedBox(width: 4),
            Icon(LucideIcons.chevronRight, size: 16, color: isDanger ? const Color(0xFFF43F5E) : provider.subtextColor),
          ],
        ),
      ),
    );
  }

  // Logged Out Screen
  Widget _buildLoggedOutView(BuildContext context, AppProvider provider) {
    return Scaffold(
      backgroundColor: provider.scaffoldBg,
      body: SafeArea(
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
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: provider.textColor),
              ),
              const SizedBox(height: 6),
              Text(
                _authMode == 'signin'
                    ? 'Sign in to access your orders, favorites, and wallet.'
                    : 'Join Marketplace Pro to buy, sell, and negotiate items.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: provider.subtextColor),
              ),
              const SizedBox(height: 20),

              // Segmented Tab Switcher (Sign In vs Sign Up)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: provider.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: provider.cardBorder),
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
                                color: _authMode == 'signin' ? Colors.white : provider.subtextColor,
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
                                color: _authMode == 'signup' ? Colors.white : provider.subtextColor,
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
                  color: provider.cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: provider.cardBorder),
                ),
                child: _authMode == 'signin'
                    ? _buildSignInForm(context, provider)
                    : _buildSignUpForm(context, provider),
              ),

              const SizedBox(height: 16),

            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSignInForm(BuildContext context, AppProvider provider) {
    return Column(
      children: [
        _buildModalTextField('Email Address', _loginEmailController, LucideIcons.mail, provider),
        const SizedBox(height: 12),
        _buildModalTextField('Password', _loginPassController, LucideIcons.lock, provider),
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
            onPressed: () async {
              final email = _loginEmailController.text.trim();
              final password = _loginPassController.text.trim();
              if (email.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter your email address.')),
                );
                return;
              }
              final result = await ApiService.loginUser(email: email, password: password);
              if (!context.mounted) return;
              if (result['success'] == true && result['user'] != null) {
                final u = result['user'];
                provider.login(
                  name: u['name'] ?? email.split('@')[0],
                  email: u['email'] ?? email,
                  phone: u['phone'] ?? '+94 77 000 0000',
                  avatar: u['avatar'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                  role: u['role'] ?? 'Verified Buyer',
                  token: result['token'] ?? '',
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🎉 Welcome back to Marketplace Pro!'),
                    backgroundColor: Color(0xFF10B981),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('❌ ${result['message'] ?? 'Login failed. Invalid credentials.'}'),
                    backgroundColor: const Color(0xFFEF4444),
                  ),
                );
              }
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
        _buildModalTextField('Full Name', _signupNameController, LucideIcons.user, provider),
        const SizedBox(height: 12),
        _buildModalTextField('Email Address', _signupEmailController, LucideIcons.mail, provider),
        const SizedBox(height: 12),
        _buildModalTextField('Phone Number', _signupPhoneController, LucideIcons.phone, provider),
        const SizedBox(height: 14),

        // Account Role Selector
        Text('Account Role', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: provider.subtextColor)),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                selected: _signupRole == 'Buyer / Shopper',
                selectedColor: const Color(0xFF6366F1),
                backgroundColor: provider.chipBg,
                side: BorderSide(color: _signupRole == 'Buyer / Shopper' ? const Color(0xFF6366F1) : provider.cardBorder),
                label: Text('🛍️ Buyer', style: GoogleFonts.inter(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                onSelected: (_) => setState(() => _signupRole = 'Buyer / Shopper'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                selected: _signupRole == 'Seller / Merchant',
                selectedColor: const Color(0xFF6366F1),
                backgroundColor: provider.chipBg,
                side: BorderSide(color: _signupRole == 'Seller / Merchant' ? const Color(0xFF6366F1) : provider.cardBorder),
                label: Text('🏪 Seller', style: GoogleFonts.inter(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                onSelected: (_) => setState(() => _signupRole = 'Seller / Merchant'),
              ),
            ),
          ],
        ),

        const SizedBox(height: 14),
        _buildModalTextField('Password', _signupPassController, LucideIcons.lock, provider),
        const SizedBox(height: 12),
        _buildModalTextField('Confirm Password', _signupConfirmPassController, LucideIcons.lock, provider),
        const SizedBox(height: 12),

        // Terms Checkbox
        Row(
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Checkbox(
                value: _agreeTerms,
                activeColor: const Color(0xFF6366F1),
                side: BorderSide(color: provider.subtextColor),
                onChanged: (val) => setState(() => _agreeTerms = val ?? true),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'I agree to Marketplace Terms & Privacy Policy',
                style: GoogleFonts.inter(fontSize: 11, color: provider.subtextColor),
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
}
