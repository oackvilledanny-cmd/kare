
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models.dart';
import '../providers.dart';

class ShiftMarketplaceScreen extends ConsumerWidget {
  const ShiftMarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shifts = ref.watch(shiftProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Shift Marketplace', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: shifts.length,
        itemBuilder: (context, index) {
          return OpenShiftCard(shift: shifts[index]);
        },
      ),
    );
  }
}

class OpenShiftCard extends ConsumerStatefulWidget {
  final OpenShift shift;
  const OpenShiftCard({super.key, required this.shift});

  @override
  ConsumerState<OpenShiftCard> createState() => _OpenShiftCardState();
}

class _OpenShiftCardState extends ConsumerState<OpenShiftCard> {
  bool isExpanded = false;
  final TextEditingController _bidController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final shift = widget.shift;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 50, height: 50,
                          decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                          child: const Center(child: Text('🎨', style: TextStyle(fontSize: 24))),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(shift.classroom, style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 18)),
                            Text(shift.urgency, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                          ],
                        ),
                      ],
                    ),
                    if (shift.bonusAmount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.emerald.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                        child: Text('+\$${shift.bonusAmount.toInt()} Bonus', style: GoogleFonts.inter(color: Colors.emerald, fontSize: 10, fontWeight: FontWeight.w900)),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _infoChip('📅 ${shift.date}'),
                    const SizedBox(width: 8),
                    _infoChip('⏰ ${shift.timeRange}'),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _bidController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          hintText: 'Bid Amount',
                          prefixText: '\$ ',
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: () {
                        final amount = double.tryParse(_bidController.text);
                        if (amount != null) {
                          ref.read(shiftProvider.notifier).placeBid(shift.id, amount);
                          _bidController.clear();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('BID'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Bid History Section
          const Divider(height: 1),
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => setState(() => isExpanded = !isExpanded),
              borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text('📜', style: TextStyle(fontSize: 16)),
                        const SizedBox(width: 8),
                        Text('Bid History (${shift.bidHistory.length})', 
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.blueGrey)),
                      ],
                    ),
                    Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: Colors.blueGrey),
                  ],
                ),
              ),
            ),
          ),
          
          if (isExpanded)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              color: const Color(0xFFF8FAFC).withOpacity(0.5),
              child: shift.bidHistory.isEmpty 
                ? const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No bids yet. Be the first!', style: TextStyle(color: Colors.grey, fontSize: 12, fontStyle: FontStyle.italic)),
                  )
                : Column(
                    children: shift.bidHistory.map((bid) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: bid.staffId == 'me' ? Colors.blue : Colors.blueGrey.withOpacity(0.2),
                            child: Text(bid.staffName[0], style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(bid.staffName + (bid.staffId == 'me' ? ' (You)' : ''), 
                                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                                Text(bid.formattedTime, style: GoogleFonts.inter(fontSize: 10, color: Colors.grey)),
                              ],
                            ),
                          ),
                          Text('\$${bid.amount.toStringAsFixed(2)}', 
                            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
                        ],
                      ),
                    )).toList(),
                  ),
            ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _infoChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
      child: Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
    );
  }
}
