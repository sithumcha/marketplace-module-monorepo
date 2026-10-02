import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
// Conditional html import for web print/download
import 'dart:html' as html if (dart.library.io) 'dart:io';

class InvoiceService {
  static String generateInvoiceHTML(Map<String, dynamic> order) {
    final orderId = order['id'] ?? order['orderId'] ?? 'ORD-100293';
    final itemTitle = order['itemTitle'] ?? 'Marketplace Product';
    final price = (order['price'] is num ? (order['price'] as num).toDouble() : 0.0);
    final quantity = order['quantity'] ?? 1;
    final shippingAddress = order['shippingAddress'] ?? 'Colombo, Sri Lanka';
    final paymentMethod = order['paymentMethod'] ?? 'CARD';
    final date = order['date'] ?? DateTime.now().toString().split(' ')[0];
    final status = order['status'] ?? 'Processing';

    return '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - $orderId</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 30px; background: #f8fafc; }
    .invoice-card { max-width: 750px; margin: auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { font-size: 22px; font-weight: 800; color: #4f46e5; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; font-size: 20px; color: #0f172a; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-box { background: #f1f5f9; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
    .info-box h4 { margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #cbd5e1; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .total-box { text-align: right; font-size: 16px; font-weight: bold; color: #047857; }
    @media print {
      body { background: none; padding: 0; }
      .invoice-card { border: none; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 750px; margin: 0 auto 15px auto; text-align: right;">
    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;">
      🖨️ Print / Save PDF
    </button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">MARKETPLACE APP</div>
        <div style="font-size: 12px; color: #64748b;">Official Order Invoice & Receipt</div>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <div style="font-size: 12px; color: #64748b;">#$orderId</div>
        <div style="font-size: 12px; color: #64748b;">Date: $date</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-box">
        <h4>Customer & Delivery</h4>
        <div><strong>Address:</strong> $shippingAddress</div>
        <div><strong>Status:</strong> $status</div>
      </div>
      <div class="info-box">
        <h4>Payment Info</h4>
        <div><strong>Method:</strong> $paymentMethod</div>
        <div><strong>Currency:</strong> LKR</div>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Item Title</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>$itemTitle</strong></td>
          <td style="text-align: center;">$quantity</td>
          <td style="text-align: right;">LKR ${(price / quantity).toStringAsFixed(2)}</td>
          <td style="text-align: right;">LKR ${price.toStringAsFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-box">
      Grand Total Paid: LKR ${price.toStringAsFixed(2)}
    </div>
  </div>
</body>
</html>
''';
  }

  static void downloadInvoice(BuildContext context, Map<String, dynamic> order) {
    final htmlContent = generateInvoiceHTML(order);
    
    if (kIsWeb) {
      try {
        final blob = html.Blob([htmlContent], 'text/html');
        final url = html.Url.createObjectUrlFromBlob(blob);
        html.AnchorElement(href: url)
          ..setAttribute('download', 'Invoice_${order['id'] ?? 'Order'}.html')
          ..click();
        html.Url.revokeObjectUrl(url);
      } catch (e) {
        debugPrint('Web download error: $e');
      }
    }

    // Always show full visual modal dialog inside Flutter as well
    showDialog(
      context: context,
      builder: (ctx) {
        final orderId = order['id'] ?? order['orderId'] ?? 'ORD-100293';
        final itemTitle = order['itemTitle'] ?? 'Marketplace Product';
        final price = (order['price'] is num ? (order['price'] as num).toDouble() : 0.0);
        final quantity = order['quantity'] ?? 1;
        final shippingAddress = order['shippingAddress'] ?? 'Colombo, Sri Lanka';
        final paymentMethod = order['paymentMethod'] ?? 'CARD';
        final date = order['date'] ?? 'Today';
        final status = order['status'] ?? 'Processing';

        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(LucideIcons.fileText, color: Color(0xFF6366F1), size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Order Invoice & Receipt', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold)),
                    Text('#$orderId • $date', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748b))),
                  ],
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('CUSTOMER & SHIPPING', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF64748b))),
                      const SizedBox(height: 4),
                      Text('Address: $shippingAddress', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: const Color(0xFF0F172A))),
                      Text('Payment: $paymentMethod • Status: $status', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF4F46E5), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text('ORDER ITEMS', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF64748b))),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(itemTitle, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                            Text('Qty: $quantity', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748b))),
                          ],
                        ),
                      ),
                      Text('LKR ${price.toStringAsFixed(2)}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF047857))),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Grand Total Paid:', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                    Text('LKR ${price.toStringAsFixed(2)}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF047857))),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            if (kIsWeb)
              TextButton.icon(
                onPressed: () {
                  final blob = html.Blob([htmlContent], 'text/html');
                  final url = html.Url.createObjectUrlFromBlob(blob);
                  html.AnchorElement(href: url)
                    ..setAttribute('download', 'Invoice_$orderId.html')
                    ..click();
                  html.Url.revokeObjectUrl(url);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('📄 Invoice Bill Downloaded!'), backgroundColor: Color(0xFF10B981)),
                  );
                },
                icon: const Icon(LucideIcons.download, size: 16, color: Color(0xFF6366F1)),
                label: Text('Save HTML Bill', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: const Color(0xFF6366F1))),
              ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }
}
