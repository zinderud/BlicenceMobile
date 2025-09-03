import '../../../core/storage/hive_service.dart';

class LocalStorageService {
  static const String _userKey = 'current_user';
  static const String _plansKey = 'user_plans';
  static const String _customerDataKey = 'customer_data_';
  static const String _settingsKey = 'app_settings';

  // User operations
  Future<void> saveUser(Map<String, dynamic> userData) async {
    await HiveService.saveUserData(_userKey, userData);
  }

  Future<Map<String, dynamic>?> getUser() async {
    final userData = HiveService.getUserData<Map<String, dynamic>>(_userKey);
    return userData;
  }

  Future<void> clearUser() async {
    await HiveService.saveUserData(_userKey, null);
  }

  // Plans operations
  Future<void> savePlans(List<Map<String, dynamic>> plans) async {
    await HiveService.saveUserData(_plansKey, plans);
  }

  Future<List<Map<String, dynamic>>> getPlans() async {
    final plans = HiveService.getUserData<List>(_plansKey);
    if (plans != null) {
      return plans.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> savePlan(Map<String, dynamic> plan) async {
    final plans = await getPlans();
    final existingIndex = plans.indexWhere((p) => p['planId'] == plan['planId']);
    
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.add(plan);
    }
    
    await savePlans(plans);
  }

  Future<void> updatePlan(String planId, Plan updatedPlan) async {
    final plans = await getPlans();
    final index = plans.indexWhere((p) => p.planId == planId);
    if (index >= 0) {
      plans[index] = updatedPlan;
      await savePlans(plans);
    } else {
      throw Exception('Plan bulunamadı: $planId');
    }
  }

  Future<void> deletePlan(String planId) async {
    final plans = await getPlans();
    plans.removeWhere((p) => p.planId == planId);
    await savePlans(plans);
  }

  Future<void> clearPlans() async {
    await HiveService.saveUserData(_plansKey, []);
  }

  // Customer data operations for blockchain integration
  Future<void> saveCustomerData(String customerAddress, Map<String, dynamic> data) async {
    await HiveService.saveUserData('$_customerDataKey$customerAddress', data);
  }

  Future<Map<String, dynamic>?> getCustomerData(String customerAddress) async {
    return HiveService.getUserData<Map<String, dynamic>>('$_customerDataKey$customerAddress');
  }

  // Settings operations
  Future<void> saveSettings(Map<String, dynamic> settings) async {
    await HiveService.saveSetting(_settingsKey, settings);
  }

  Future<Map<String, dynamic>> getSettings() async {
    final settings = HiveService.getSetting<Map<String, dynamic>>(_settingsKey);
    return settings ?? {};
  }

  // Theme
  Future<void> saveThemeMode(String themeMode) async {
    await HiveService.saveSetting('theme_mode', themeMode);
  }

  Future<String> getThemeMode() async {
    return HiveService.getSetting<String>('theme_mode') ?? 'system';
  }

  // Language
  Future<void> saveLanguage(String language) async {
    await HiveService.saveSetting('language', language);
  }

  Future<String> getLanguage() async {
    return HiveService.getSetting<String>('language') ?? 'tr';
  }

  // Onboarding
  Future<void> setOnboardingCompleted(bool completed) async {
    await HiveService.saveSetting('onboarding_completed', completed);
  }

  Future<bool> isOnboardingCompleted() async {
    return HiveService.getSetting<bool>('onboarding_completed') ?? false;
  }
}
