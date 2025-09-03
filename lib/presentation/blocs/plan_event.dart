part of 'plan_bloc.dart';

abstract class PlanEvent extends Equatable {
  const PlanEvent();

  @override
  List<Object> get props => [];
}

class LoadAllPlans extends PlanEvent {}

class LoadPlansByProducer extends PlanEvent {
  final String producerId;

  const LoadPlansByProducer(this.producerId);

  @override
  List<Object> get props => [producerId];
}

class LoadPlansByCustomer extends PlanEvent {
  final String customerId;

  const LoadPlansByCustomer(this.customerId);

  @override
  List<Object> get props => [customerId];
}

class CreatePlan extends PlanEvent {
  final Plan plan;

  const CreatePlan(this.plan);

  @override
  List<Object> get props => [plan];
}

class UpdatePlan extends PlanEvent {
  final Plan plan;

  const UpdatePlan(this.plan);

  @override
  List<Object> get props => [plan];
}

class PurchasePlan extends PlanEvent {
  final String planId;
  final String customerId;

  const PurchasePlan({
    required this.planId,
    required this.customerId,
  });

  @override
  List<Object> get props => [planId, customerId];
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
