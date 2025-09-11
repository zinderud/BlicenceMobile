import 'package:flutter/material.dart';
import '../../domain/entities/customer_plan.dart';

class CustomerPlanCard extends StatelessWidget {
  final CustomerPlan customerPlan;
  final VoidCallback? onTap;

  const CustomerPlanCard({
    Key? key,
    required this.customerPlan,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Plan #${customerPlan.customerPlanId}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getPlanTypeText(customerPlan.planType),
                          style: TextStyle(
                            color: _getPlanColor(customerPlan.planType),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(customerPlan.status),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getStatusText(customerPlan.status),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Plan Details
              Row(
                children: [
                  Icon(Icons.account_balance_wallet, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Text('${customerPlan.totalPaid.toStringAsFixed(2)} ${customerPlan.currency}'),
                  const Spacer(),
                  Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Text(_formatDate(customerPlan.startDate)),
                ],
              ),
              
              if (customerPlan.planType == PlanType.nUsage) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.trending_up, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text('Kalan: ${customerPlan.remainingQuota} kullanım'),
                  ],
                ),
              ],
              
              // Stream Information (if has active stream)
              if (customerPlan.hasActiveStream && customerPlan.streamLockId != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.stream, color: Colors.blue[700], size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Akış Ödeme Aktif',
                            style: TextStyle(
                              color: Colors.blue[700],
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            customerPlan.streamStatusText,
                            style: TextStyle(
                              color: Colors.blue[600],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 8),
                      
                      // Stream Progress Bar
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'İlerleme: ${(customerPlan.streamProgress * 100).toStringAsFixed(1)}%',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[700],
                                ),
                              ),
                              Text(
                                '${customerPlan.streamedAmount.toStringAsFixed(2)} / ${(customerPlan.streamedAmount + customerPlan.remainingStreamAmount).toStringAsFixed(2)} ${customerPlan.currency}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[700],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(
                            value: customerPlan.streamProgress,
                            backgroundColor: Colors.grey[300],
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                          ),
                        ],
                      ),
                      
                      if (customerPlan.streamTimeRemaining != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.timer, size: 14, color: Colors.grey[600]),
                            const SizedBox(width: 4),
                            Text(
                              'Kalan süre: ${_formatDuration(customerPlan.streamTimeRemaining!)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
              
              // Action Buttons
              const SizedBox(height: 12),
              Row(
                children: [
                  if (customerPlan.hasActiveStream && customerPlan.streamProgress > 0.1) ...[
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _claimStream(context),
                        icon: const Icon(Icons.download, size: 16),
                        label: const Text(
                          'Akışı Talep Et',
                          style: TextStyle(fontSize: 12),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showDetails(context),
                      icon: const Icon(Icons.info_outline, size: 16),
                      label: const Text(
                        'Detaylar',
                        style: TextStyle(fontSize: 12),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getPlanColor(PlanType type) {
    switch (type) {
      case PlanType.api:
        return Colors.green;
      case PlanType.nUsage:
        return Colors.blue;
      case PlanType.vestingApi:
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  Color _getStatusColor(PlanStatus status) {
    switch (status) {
      case PlanStatus.active:
        return Colors.green;
      case PlanStatus.expired:
        return Colors.red;
      case PlanStatus.pending:
        return Colors.orange;
      case PlanStatus.cancelled:
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  String _getPlanTypeText(PlanType type) {
    switch (type) {
      case PlanType.api:
        return 'API Abonelik';
      case PlanType.nUsage:
        return 'Kullanım Kartı';
      case PlanType.vestingApi:
        return 'Gelecek Hizmet';
      default:
        return 'Bilinmeyen';
    }
  }

  String _getStatusText(PlanStatus status) {
    switch (status) {
      case PlanStatus.active:
        return 'Aktif';
      case PlanStatus.expired:
        return 'Süresi Doldu';
      case PlanStatus.pending:
        return 'Bekliyor';
      case PlanStatus.cancelled:
        return 'İptal';
      default:
        return 'Bilinmeyen';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays} gün';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} saat';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes} dakika';
    } else {
      return '${duration.inSeconds} saniye';
    }
  }

  void _claimStream(BuildContext context) {
    // TODO: Implement stream claim functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Akış talep edildi: ${customerPlan.streamLockId}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showDetails(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Plan Detayları #${customerPlan.customerPlanId}'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('Plan ID', customerPlan.planId.toString()),
              _buildDetailRow('Müşteri Adresi', customerPlan.customerAddress),
              _buildDetailRow('Üretici ID', customerPlan.producerId.toString()),
              _buildDetailRow('Başlangıç', _formatDate(customerPlan.startDate)),
              _buildDetailRow('Bitiş', _formatDate(customerPlan.endDate)),
              _buildDetailRow('Tutar', '${customerPlan.totalPaid} ${customerPlan.currency}'),
              if (customerPlan.hasActiveStream) ...[
                const Divider(),
                const Text(
                  'Akış Detayları',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                _buildDetailRow('Akış ID', customerPlan.streamLockId?.toString() ?? 'N/A'),
                _buildDetailRow('Akış Başlangıç', customerPlan.streamStartDate != null 
                    ? _formatDate(customerPlan.streamStartDate!) : 'N/A'),
                _buildDetailRow('Akış Bitiş', customerPlan.streamEndDate != null 
                    ? _formatDate(customerPlan.streamEndDate!) : 'N/A'),
                _buildDetailRow('Akıştaki Tutar', '${customerPlan.streamedAmount.toStringAsFixed(2)} ${customerPlan.currency}'),
                _buildDetailRow('Kalan Tutar', '${customerPlan.remainingStreamAmount.toStringAsFixed(2)} ${customerPlan.currency}'),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Kapat'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}
