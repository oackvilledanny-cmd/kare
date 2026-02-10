
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';

class ShiftNotifier extends StateNotifier<List<OpenShift>> {
  ShiftNotifier() : super([
    OpenShift(
      id: 'os1',
      classroom: 'Infant A',
      date: 'Tomorrow',
      timeRange: '08:00 - 16:00',
      bonusAmount: 50.0,
      urgency: 'Critical',
      bidHistory: [
        Bid(id: 'b1', staffId: 's2', staffName: 'Bob Roberts', amount: 135.0, timestamp: DateTime.now().subtract(const Duration(hours: 1))),
        Bid(id: 'b2', staffId: 's6', staffName: 'Fiona Apple', amount: 140.0, timestamp: DateTime.now().subtract(const Duration(minutes: 30))),
      ],
    ),
    OpenShift(
      id: 'os2',
      classroom: 'Preschool B',
      date: 'Fri, May 18',
      timeRange: '13:00 - 17:00',
      bonusAmount: 0.0,
      urgency: 'Low',
      bidHistory: [],
    ),
  ]);

  void placeBid(String shiftId, double amount) {
    state = [
      for (final shift in state)
        if (shift.id == shiftId)
          OpenShift(
            id: shift.id,
            classroom: shift.classroom,
            date: shift.date,
            timeRange: shift.timeRange,
            bonusAmount: shift.bonusAmount,
            urgency: shift.urgency,
            userHasBid: true,
            bidHistory: [
              Bid(
                id: DateTime.now().toString(),
                staffId: 'me',
                staffName: 'You',
                amount: amount,
                timestamp: DateTime.now(),
              ),
              ...shift.bidHistory,
            ],
          )
        else
          shift
    ];
  }
}

final shiftProvider = StateNotifierProvider<ShiftNotifier, List<OpenShift>>((ref) => ShiftNotifier());
