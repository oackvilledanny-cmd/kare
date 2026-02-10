
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio dio = Dio(BaseOptions(
    baseUrl: 'https://api.k-daycare.os', // 실제 백엔드 주소
    connectTimeout: const Duration(seconds: 10),
  ));
  
  final _storage = const FlutterSecureStorage();

  ApiService() {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // 토큰 만료 시 처리 (예: 로그인 화면 리다이렉트)
          await _storage.delete(key: 'jwt_token');
        }
        return handler.next(e);
      },
    ));
  }

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }
}
