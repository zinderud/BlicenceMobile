part of 'plan_bloc.dart';

abstract class PlanState extends Equatable {
  @override
  List<Object?> get props => [];
}

class PlanInitial extends PlanState {}

class PlanLoading extends PlanState {}

class PlansLoaded extends PlanState {
  final List<Plan> plans;

  PlansLoaded(this.plans);

  @override
  List<Object> get props => [plans];
}

class PlanLoaded extends PlanState {
  final Plan plan;

  PlanLoaded(this.plan);

  @override
  List<Object> get props => [plan];
}

class CustomerPlansLoaded extends PlanState {
  final List<CustomerPlan> customerPlans;

  CustomerPlansLoaded(this.customerPlans);

  @override
  List<Object> get props => [customerPlans];
}

class CustomerPlanCreated extends PlanState {
  final CustomerPlan customerPlan;

  CustomerPlanCreated(this.customerPlan);

  @override
  List<Object> get props => [customerPlan];
}

class PlanError extends PlanState {
  final String message;

  PlanError(this.message);

  @override
  List<Object> get props => [message];
}
