part of 'plan_bloc.dart';

abstract class PlanEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadPlans extends PlanEvent {}

class LoadPlansByProducer extends PlanEvent {
  final int producerId;

  LoadPlansByProducer(this.producerId);

  @override
  List<Object> get props => [producerId];
}

class LoadPlanById extends PlanEvent {
  final int planId;

  LoadPlanById(this.planId);

  @override
  List<Object> get props => [planId];
}

class SearchPlans extends PlanEvent {
  final String? query;
  final PlanType? type;
  final double? minPrice;
  final double? maxPrice;

  const SearchPlans({
    this.query,
    this.type,
    this.minPrice,
    this.maxPrice,
  });

  @override
  List<Object?> get props => [query, type, minPrice, maxPrice];
}

class PurchasePlan extends PlanEvent {
  final int planId;
  final int customerId;

  const PurchasePlan({
    required this.planId,
    required this.customerId,
  });

  @override
  List<Object> get props => [planId, customerId];
}

class LoadCustomerPlans extends PlanEvent {
  final String customerAddress;

  LoadCustomerPlans(this.customerAddress);

  @override
  List<Object> get props => [customerAddress];
}
