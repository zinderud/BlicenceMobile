import 'package:dio/dio.dart';
import '../../../core/constants/app_constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late final Dio _dio;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
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

  Dio get dio => _dio;

  void _setupInterceptors() {
    _dio.interceptors.addAll([
      // Request interceptor
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token if available
          // final token = await _getAuthToken();
          // if (token != null) {
          //   options.headers['Authorization'] = 'Bearer $token';
          // }

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
            // Handle unauthorized
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

  // Future<String?> _getAuthToken() async {
  //   // Get token from secure storage
  //   // return await SecureStorageService.getToken();
  //   return null;
  // }

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
}
