import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:dartz/dartz.dart';
import '../../../domain/entities/plan.dart';
import '../../../domain/entities/customer_plan.dart';
import '../../../domain/repositories/plan_repository.dart';

// Events
abstract class PlanEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadPlans extends PlanEvent {}

class LoadPlansByProducer extends PlanEvent {
  final int producerId;
  LoadPlansByProducer(this.producerId);
  
  @override
  List<Object?> get props => [producerId];
}

class LoadPlanById extends PlanEvent {
  final int planId;
  LoadPlanById(this.planId);
  
  @override
  List<Object?> get props => [planId];
}

class SearchPlans extends PlanEvent {
  final String? query;
  final PlanType? type;
  final PlanStatus? status;
  
  SearchPlans({this.query, this.type, this.status});
  
  @override
  List<Object?> get props => [query, type, status];
}

class PurchasePlan extends PlanEvent {
  final int planId;
  final int customerId;
  
  PurchasePlan({required this.planId, required this.customerId});
  
  @override
  List<Object?> get props => [planId, customerId];
}

class LoadCustomerPlans extends PlanEvent {
  final int customerId;
  
  LoadCustomerPlans(this.customerId);
  
  @override
  List<Object?> get props => [customerId];
}

// States
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
  List<Object?> get props => [plans];
}

class PlanLoaded extends PlanState {
  final Plan plan;
  
  PlanLoaded(this.plan);
  
  @override
  List<Object?> get props => [plan];
}

class CustomerPlansLoaded extends PlanState {
  final List<CustomerPlan> customerPlans;
  
  CustomerPlansLoaded(this.customerPlans);
  
  @override
  List<Object?> get props => [customerPlans];
}

class PlanPurchased extends PlanState {
  final CustomerPlan customerPlan;
  
  PlanPurchased(this.customerPlan);
  
  @override
  List<Object?> get props => [customerPlan];
}

class PlanError extends PlanState {
  final String message;
  
  PlanError(this.message);
  
  @override
  List<Object?> get props => [message];
}

// BLoC
class PlanBloc extends Bloc<PlanEvent, PlanState> {
  final PlanRepository _planRepository;

  PlanBloc({required PlanRepository planRepository})
      : _planRepository = planRepository,
        super(PlanInitial()) {
    on<LoadPlans>(_onLoadPlans);
    on<LoadPlansByProducer>(_onLoadPlansByProducer);
    on<LoadPlanById>(_onLoadPlanById);
    on<SearchPlans>(_onSearchPlans);
    on<PurchasePlan>(_onPurchasePlan);
    on<LoadCustomerPlans>(_onLoadCustomerPlans);
  }

  Future<void> _onLoadPlans(LoadPlans event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.getPlans();
    result.fold(
      (error) => emit(PlanError(error)),
      (plans) => emit(PlansLoaded(plans)),
    );
  }

  Future<void> _onLoadPlansByProducer(LoadPlansByProducer event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.getPlansByProducer(event.producerId);
    result.fold(
      (error) => emit(PlanError(error)),
      (plans) => emit(PlansLoaded(plans)),
    );
  }

  Future<void> _onLoadPlanById(LoadPlanById event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.getPlanById(event.planId);
    result.fold(
      (error) => emit(PlanError(error)),
      (plan) => emit(PlanLoaded(plan)),
    );
  }

  Future<void> _onSearchPlans(SearchPlans event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.searchPlans(
      query: event.query,
      type: event.type,
      status: event.status,
    );
    result.fold(
      (error) => emit(PlanError(error)),
      (plans) => emit(PlansLoaded(plans)),
    );
  }

  Future<void> _onPurchasePlan(PurchasePlan event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.purchasePlan(
      event.planId,
      event.customerId.toString(), // Convert to string for customer address
    );
    result.fold(
      (error) => emit(PlanError(error)),
      (customerPlan) => emit(PlanPurchased(customerPlan)),
    );
  }

  Future<void> _onLoadCustomerPlans(LoadCustomerPlans event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.getCustomerPlans(event.customerId.toString());
    result.fold(
      (error) => emit(PlanError(error)),
      (customerPlans) => emit(CustomerPlansLoaded(customerPlans)),
    );
  }
}
