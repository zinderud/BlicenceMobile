import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../domain/entities/plan.dart';
import '../../../domain/entities/customer_plan.dart';
import '../../../domain/repositories/plan_repository.dart';

part 'plan_event.dart';
part 'plan_state.dart';

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
    
    final result = await _planRepository.getAllPlans();
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
      minPrice: event.minPrice,
      maxPrice: event.maxPrice,
    );
    
    result.fold(
      (error) => emit(PlanError(error)),
      (plans) => emit(PlansLoaded(plans)),
    );
  }

  Future<void> _onPurchasePlan(PurchasePlan event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    final result = await _planRepository.purchasePlan(event.planId, event.customerId);
    result.fold(
      (error) => emit(PlanError(error)),
      (customerPlan) => emit(CustomerPlanCreated(customerPlan)),
    );
  }

  Future<void> _onLoadCustomerPlans(LoadCustomerPlans event, Emitter<PlanState> emit) async {
    emit(PlanLoading());
    
    // Bu mock implementation, gerçek uygulamada customer plans repository olacak
    try {
      final mockCustomerPlans = <CustomerPlan>[
        CustomerPlan(
          customerPlanId: 1,
          planId: 1,
          customerAddress: 'customer_${event.customerId}',
          startTime: DateTime.now().subtract(const Duration(days: 10)),
          endTime: DateTime.now().add(const Duration(days: 20)),
          quota: 100,
          used: 35,
          isActive: true,
          createdAt: DateTime.now().subtract(const Duration(days: 10)),
          updatedAt: DateTime.now(),
        ),
      ];
      
      emit(CustomerPlansLoaded(mockCustomerPlans));
    } catch (e) {
      emit(PlanError('Customer planları yüklenirken hata oluştu: ${e.toString()}'));
    }
  }
}
