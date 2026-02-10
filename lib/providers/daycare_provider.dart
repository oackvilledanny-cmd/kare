
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/daycare_models.dart';

class DaycareState {
  final List<Child> children;
  final List<Staff> staff;
  final List<AbsenceRequest> absenceRequests;

  DaycareState({
    required this.children,
    required this.staff,
    required this.absenceRequests,
  });

  DaycareState copyWith({
    List<Child>? children,
    List<Staff>? staff,
    List<AbsenceRequest>? absenceRequests,
  }) {
    return DaycareState(
      children: children ?? this.children,
      staff: staff ?? this.staff,
      absenceRequests: absenceRequests ?? this.absenceRequests,
    );
  }
}

class DaycareNotifier extends StateNotifier<DaycareState> {
  DaycareNotifier() : super(DaycareState(children: [], staff: [], absenceRequests: []));

  // 부재 신청 승인 및 직원 레코드 동기화
  void approveAbsenceRequest(String requestId) {
    final request = state.absenceRequests.firstWhere((r) => r.id == requestId);
    if (request.status != AbsenceStatus.Pending) return;

    final updatedRequests = state.absenceRequests.map((r) {
      if (r.id == requestId) r.status = AbsenceStatus.Approved;
      return r;
    }).toList();

    final updatedStaff = state.staff.map((s) {
      if (s.id == request.staffId) {
        if (request.type == AbsenceCategory.Vacation) {
          s.vacationDaysUsed += request.duration;
        } else if (request.type == AbsenceCategory.Sick) {
          s.sickDaysUsed += request.duration;
        }
      }
      return s;
    }).toList();

    state = state.copyWith(
      absenceRequests: updatedRequests,
      staff: updatedStaff,
    );
  }

  void toggleChildStatus(String childId) {
    final updatedChildren = state.children.map((c) {
      if (c.id == childId) {
        c.status = (c.status == 'Checked-in') ? 'Checked-out' : 'Checked-in';
      }
      return c;
    }).toList();
    state = state.copyWith(children: updatedChildren);
  }
}

final daycareProvider = StateNotifierProvider<DaycareNotifier, DaycareState>((ref) {
  return DaycareNotifier();
});
