
import 'package:intl/intl.dart';

enum StaffRole { Teacher, Assistant, Admin }
enum AbsenceStatus { Pending, Approved, Denied }
enum AbsenceCategory { Sick, Vacation, Personal, Other }

class Bid {
  final String id;
  final String staffId;
  final String staffName;
  final double amount;
  final DateTime timestamp;

  Bid({
    required this.id,
    required this.staffId,
    required this.staffName,
    required this.amount,
    required this.timestamp,
  });

  String get formattedTime => DateFormat('HH:mm:ss').format(timestamp);
}

class OpenShift {
  final String id;
  final String classroom;
  final String date;
  final String timeRange;
  final double bonusAmount;
  final String urgency;
  final List<Bid> bidHistory;
  bool userHasBid;

  OpenShift({
    required this.id,
    required this.classroom,
    required this.date,
    required this.timeRange,
    required this.bonusAmount,
    required this.urgency,
    required this.bidHistory,
    this.userHasBid = false,
  });

  double get highestBid => bidHistory.isEmpty 
      ? 0.0 
      : bidHistory.map((b) => b.amount).reduce((a, b) => a > b ? a : b);
}

class Staff {
  final String id;
  final String name;
  final StaffRole role;
  int vacationDaysUsed;
  int sickDaysUsed;
  bool isOnDuty;

  Staff({
    required this.id,
    required this.name,
    required this.role,
    this.vacationDaysUsed = 0,
    this.sickDaysUsed = 0,
    this.isOnDuty = false,
  });
}
