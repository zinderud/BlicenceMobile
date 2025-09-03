import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import '../constants/app_constants.dart';

class NetworkService {
  static final NetworkService _instance = NetworkService._internal();
  late final Dio _dio;
  late final Connectivity _connectivity;

  factory NetworkService() {
    return _instance;
  }

  NetworkService._internal() {
    _connectivity = Connectivity();
    _setupDio();
  }

  void _setupDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseApiUrl,
        connectTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        receiveTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.addAll([
      // Request interceptor
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Check network connectivity
          final connectivityResult = await _connectivity.checkConnectivity();
          if (connectivityResult == ConnectivityResult.none) {
            return handler.reject(
              DioException(
                requestOptions: options,
                error: 'No internet connection',
                type: DioExceptionType.connectionError,
              ),
            );
          }

          print('🌐 API Request: ${options.method} ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ API Response: ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          print('❌ API Error: ${error.response?.statusCode} ${error.requestOptions.path}');
          print('Error details: ${error.message}');

          // Handle common errors
          if (error.response?.statusCode == 401) {
            // Handle unauthorized - maybe refresh token
            print('Unauthorized access - token might be expired');
          } else if (error.response?.statusCode == 500) {
            // Handle server errors
            print('Server error occurred');
          }

          return handler.next(error);
        },
      ),
    ]);
  }

  Dio get dio => _dio;

  // Check network connectivity
  Future<bool> isConnected() async {
    final connectivityResult = await _connectivity.checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  // Listen to connectivity changes
  Stream<ConnectivityResult> get connectivityStream => _connectivity.onConnectivityChanged;

  // Generic GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Generic DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Set auth token
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  // Clear auth token
  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
  }
}
