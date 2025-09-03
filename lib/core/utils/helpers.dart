import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:intl/intl.dart';

class StringUtils {
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  static String formatPhoneNumber(String phone) {
    // Remove all non-digit characters
    final digitsOnly = phone.replaceAll(RegExp(r'[^\d]'), '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (digitsOnly.length == 10) {
      return '(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}';
    }

    return phone;
  }

  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(email);
  }

  static String generateSHA256(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}

class DateUtils {
  static String formatDate(DateTime date, {String format = 'dd/MM/yyyy'}) {
    final formatter = DateFormat(format);
    return formatter.format(date);
  }

  static String formatDateTime(DateTime dateTime) {
    final formatter = DateFormat('dd/MM/yyyy HH:mm');
    return formatter.format(dateTime);
  }

  static String timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 365) {
      final years = (difference.inDays / 365).floor();
      return '$years yıl önce';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ay önce';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} gün önce';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} saat önce';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} dakika önce';
    } else {
      return 'Şimdi';
    }
  }

  static DateTime parseDate(String dateString, {String format = 'dd/MM/yyyy'}) {
    final formatter = DateFormat(format);
    return formatter.parse(dateString);
  }
}

class NumberUtils {
  static String formatCurrency(double amount, {String symbol = '₺'}) {
    final formatter = NumberFormat.currency(
      locale: 'tr_TR',
      symbol: symbol,
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static String formatNumber(double number, {int decimalPlaces = 2}) {
    final formatter = NumberFormat.decimalPattern('tr_TR');
    formatter.maximumFractionDigits = decimalPlaces;
    formatter.minimumFractionDigits = decimalPlaces;
    return formatter.format(number);
  }

  static String formatPercentage(double percentage) {
    return '${percentage.toStringAsFixed(1)}%';
  }
}

class ValidationUtils {
  static bool isValidPhoneNumber(String phone) {
    final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]{10,}$');
    return phoneRegex.hasMatch(phone);
  }

  static bool isValidPassword(String password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    final passwordRegex = RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$');
    return passwordRegex.hasMatch(password);
  }

  static bool isValidUrl(String url) {
    final urlRegex = RegExp(
      r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$',
    );
    return urlRegex.hasMatch(url);
  }

  static String? validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'E-posta adresi gerekli';
    }
    if (!StringUtils.isValidEmail(email)) {
      return 'Geçerli bir e-posta adresi girin';
    }
    return null;
  }

  static String? validatePassword(String? password) {
    if (password == null || password.isEmpty) {
      return 'Şifre gerekli';
    }
    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalı';
    }
    if (!isValidPassword(password)) {
      return 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermeli';
    }
    return null;
  }

  static String? validatePhone(String? phone) {
    if (phone == null || phone.isEmpty) {
      return 'Telefon numarası gerekli';
    }
    if (!isValidPhoneNumber(phone)) {
      return 'Geçerli bir telefon numarası girin';
    }
    return null;
  }
}

class FileUtils {
  static String getFileExtension(String fileName) {
    return fileName.split('.').last.toLowerCase();
  }

  static String getFileNameWithoutExtension(String fileName) {
    final parts = fileName.split('.');
    if (parts.length > 1) {
      return parts.sublist(0, parts.length - 1).join('.');
    }
    return fileName;
  }

  static bool isImageFile(String fileName) {
    final extension = getFileExtension(fileName);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].contains(extension);
  }

  static bool isVideoFile(String fileName) {
    final extension = getFileExtension(fileName);
    return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].contains(extension);
  }

  static bool isDocumentFile(String fileName) {
    final extension = getFileExtension(fileName);
    return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].contains(extension);
  }

  static String formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else {
      return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    }
  }
}
