import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class HiveService {
  static const String _userBox = 'user_box';
  static const String _settingsBox = 'settings_box';
  static const String _plansBox = 'plans_box';
  
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Open boxes
    await Hive.openBox(_userBox);
    await Hive.openBox(_settingsBox);
    await Hive.openBox(_plansBox);
  }

  // User data operations
  static Box get userBox => Hive.box(_userBox);
  
  static Future<void> saveUserData(String key, dynamic value) async {
    await userBox.put(key, value);
  }
  
  static T? getUserData<T>(String key) {
    return userBox.get(key);
  }
  
  static Future<void> clearUserData() async {
    await userBox.clear();
  }

  // Settings operations
  static Box get settingsBox => Hive.box(_settingsBox);
  
  static Future<void> saveSetting(String key, dynamic value) async {
    await settingsBox.put(key, value);
  }
  
  static T? getSetting<T>(String key) {
    return settingsBox.get(key);
  }

  // Plans operations
  static Box get plansBox => Hive.box(_plansBox);
  
  static Future<void> savePlan(String planId, Map<String, dynamic> planData) async {
    await plansBox.put(planId, planData);
  }
  
  static Map<String, dynamic>? getPlan(String planId) {
    return plansBox.get(planId);
  }
  
  static List<Map<String, dynamic>> getAllPlans() {
    return plansBox.values.cast<Map<String, dynamic>>().toList();
  }

  // Secure storage operations (for sensitive data like private keys)
  static Future<void> saveSecure(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }
  
  static Future<String?> getSecure(String key) async {
    return await _secureStorage.read(key: key);
  }
  
  static Future<void> deleteSecure(String key) async {
    await _secureStorage.delete(key: key);
  }
  
  static Future<void> clearAllSecure() async {
    await _secureStorage.deleteAll();
  }
}
