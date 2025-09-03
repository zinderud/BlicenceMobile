part of 'plan_bloc.dart';

abstract class PlanState extends Equatable {
  const PlanState();

  @override
  List<Object?> get props => [];
}

class PlanInitial extends PlanState {}

class PlanLoading extends PlanState {}

class PlanLoaded extends PlanState {
  final List<Plan> plans;

  const PlanLoaded(this.plans);

  @override
  List<Object> get props => [plans];
}

class PlanError extends PlanState {
  final String message;

  const PlanError(this.message);

  @override
  List<Object> get props => [message];
}

class PlanCreated extends PlanState {
  final Plan plan;

  const PlanCreated(this.plan);

  @override
  List<Object> get props => [plan];
}

class PlanUpdated extends PlanState {
  final Plan plan;

  const PlanUpdated(this.plan);

  @override
  List<Object> get props => [plan];
}

class PlanPurchased extends PlanState {
  final Plan plan;

  const PlanPurchased(this.plan);

  @override
  List<Object> get props => [plan];
}
