import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/plan.dart';
import '../../domain/entities/customer_plan.dart';
import '../../domain/usecases/plan_usecases.dart';

part 'plan_event.dart';
part 'plan_state.dart';

class PlanBloc extends Bloc<PlanEvent, PlanState> {
  final GetAllPlansUseCase _getAllPlansUseCase;
  final GetPlansByProducerUseCase _getPlansByProducerUseCase;
  final GetPlansByCustomerUseCase _getPlansByCustomerUseCase;
  final CreatePlanUseCase _createPlanUseCase;
  final PurchasePlanUseCase _purchasePlanUseCase;
  final SearchPlansUseCase _searchPlansUseCase;

  PlanBloc({
    required GetAllPlansUseCase getAllPlansUseCase,
    required GetPlansByProducerUseCase getPlansByProducerUseCase,
    required GetPlansByCustomerUseCase getPlansByCustomerUseCase,
    required CreatePlanUseCase createPlanUseCase,
    required PurchasePlanUseCase purchasePlanUseCase,
    required SearchPlansUseCase searchPlansUseCase,
  })  : _getAllPlansUseCase = getAllPlansUseCase,
        _getPlansByProducerUseCase = getPlansByProducerUseCase,
        _getPlansByCustomerUseCase = getPlansByCustomerUseCase,
        _createPlanUseCase = createPlanUseCase,
        _purchasePlanUseCase = purchasePlanUseCase,
        _searchPlansUseCase = searchPlansUseCase,
        super(PlanInitial()) {
    on<LoadAllPlans>(_onLoadAllPlans);
    on<LoadPlansByProducer>(_onLoadPlansByProducer);
    on<LoadPlansByCustomer>(_onLoadPlansByCustomer);
    on<CreatePlan>(_onCreatePlan);
    on<UpdatePlan>(_onUpdatePlan);
    on<PurchasePlan>(_onPurchasePlan);
    on<SearchPlans>(_onSearchPlans);
  }

  Future<void> _onLoadAllPlans(
    LoadAllPlans event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _getAllPlansUseCase();
      result.fold(
        (error) => emit(PlanError(error)),
        (plans) => emit(PlanLoaded(plans)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onLoadPlansByProducer(
    LoadPlansByProducer event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _getPlansByProducerUseCase(int.parse(event.producerId));
      result.fold(
        (error) => emit(PlanError(error)),
        (plans) => emit(PlanLoaded(plans)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onLoadPlansByCustomer(
    LoadPlansByCustomer event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _getPlansByCustomerUseCase(event.customerId);
      result.fold(
        (error) => emit(PlanError(error)),
        (customerPlans) => emit(CustomerPlansLoaded(customerPlans)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onCreatePlan(
    CreatePlan event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _createPlanUseCase(event.plan);
      result.fold(
        (error) => emit(PlanError(error)),
        (plan) => emit(PlanCreated(plan)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onUpdatePlan(
    UpdatePlan event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      // Update plan logic here
      emit(PlanUpdated(event.plan));
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onPurchasePlan(
    PurchasePlan event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _purchasePlanUseCase(int.parse(event.planId), event.customerId);
      result.fold(
        (error) => emit(PlanError(error)),
        (customerPlan) => emit(PlanPurchased(customerPlan)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }

  Future<void> _onSearchPlans(
    SearchPlans event,
    Emitter<PlanState> emit,
  ) async {
    emit(PlanLoading());
    try {
      final result = await _searchPlansUseCase(
        query: event.query,
        type: event.type,
        minPrice: event.minPrice,
        maxPrice: event.maxPrice,
      );
      result.fold(
        (error) => emit(PlanError(error)),
        (plans) => emit(PlanLoaded(plans)),
      );
    } catch (e) {
      emit(PlanError(e.toString()));
    }
  }
}
