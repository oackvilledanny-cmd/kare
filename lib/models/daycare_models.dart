
import 'package:intl/intl.dart';

enum StaffRole { Teacher, Assistant, Admin }
enum AbsenceStatus { Pending, Approved, Denied }
enum AbsenceCategory { Sick, Vacation, Personal, Other }

class Child {
  final String id;
  final String name;
  final int age;
  final String classroom;
  String status;
  final List<String> allergies;
  String? lastActivity;
  final List<Map<String, dynamic>> attendanceHistory;

  Child({
    required this.id,
    required this.name,
    required this.age,
    required this.classroom,
    required this.status,
    required this.allergies,
    this.lastActivity,
    required this.attendanceHistory,
  });

  factory Child.fromJson(Map<String, dynamic> json) {
    return Child(
      id: json['id'],
      name: json['name'],
      age: json['age'],
      classroom: json['classroom'],
      status: json['status'],
      allergies: List<String>.from(json['allergies']),
      lastActivity: json['lastActivity'],
      attendanceHistory: List<Map<String, dynamic>>.from(json['attendanceHistory']),
    );
  }
}

class Staff {
  final String id;
  final String name;
  final StaffRole role;
  bool isOnDuty;
  int vacationDaysUsed;
  int sickDaysUsed;
  final double hourlyRate;

  Staff({
    required this.id,
    required this.name,
    required this.role,
    required this.isOnDuty,
    required this.vacationDaysUsed,
    required this.sickDaysUsed,
    required this.hourlyRate,
  });

  factory Staff.fromJson(Map<String, dynamic> json) {
    return Staff(
      id: json['id'],
      name: json['name'],
      role: StaffRole.values.firstWhere((e) => e.toString().split('.').last == json['role']),
      isOnDuty: json['isOnDuty'],
      vacationDaysUsed: json['vacationDaysUsed'] ?? 0,
      sickDaysUsed: json['sickDaysUsed'] ?? 0,
      hourlyRate: (json['hourlyRate'] as num).toDouble(),
    );
  }
}

class AbsenceRequest {
  final String id;
  final String staffId;
  final String staffName;
  final AbsenceCategory type;
  final DateTime startDate;
  final DateTime endDate;
  final String reason;
  AbsenceStatus status;

  AbsenceRequest({
    required this.id,
    required this.staffId,
    required this.staffName,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.reason,
    required this.status,
  });

  int get duration => endDate.difference(startDate).inDays + 1;
}
