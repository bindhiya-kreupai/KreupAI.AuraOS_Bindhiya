/**
 * Compliance API - Main Route
 * Provides an overview of all compliance services and endpoints
 *
 * @swagger
 * /api/compliance:
 *   get:
 *     summary: Get compliance API overview and supported services
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: Compliance API overview
 */

import { NextResponse } from 'next/server';
import { LabourLawService } from '@/lib/services/compliance';

/**
 * GET /api/compliance
 * Get compliance API overview
 */
export async function GET() {
  try {
    const supportedCountries = LabourLawService.getSupportedCountries();

    return NextResponse.json({
      success: true,
      data: {
        name: 'MENA Compliance API',
        nameAr: 'واجهة برمجة تطبيقات الامتثال للشرق الأوسط وشمال أفريقيا',
        version: '1.0.0',
        supportedCountries,
        services: [
          {
            name: 'WPS (Wage Protection System)',
            nameAr: 'نظام حماية الأجور',
            country: 'UAE',
            countryAr: 'الإمارات',
            endpoint: '/api/compliance/wps',
            methods: ['GET', 'POST'],
            description: 'Generate WPS SIF files for UAE payroll compliance',
            descriptionAr: 'إنشاء ملفات SIF لامتثال رواتب الإمارات',
          },
          {
            name: 'GOSI (General Organization for Social Insurance)',
            nameAr: 'التأمينات الاجتماعية',
            country: 'Saudi Arabia',
            countryAr: 'السعودية',
            endpoint: '/api/compliance/gosi',
            methods: ['GET', 'POST'],
            description: 'Calculate GOSI contributions and generate submission files',
            descriptionAr: 'حساب اشتراكات التأمينات وإنشاء ملفات التقديم',
          },
          {
            name: 'Mudad (Wage Protection System)',
            nameAr: 'مدد',
            country: 'Saudi Arabia',
            countryAr: 'السعودية',
            endpoint: '/api/compliance/mudad',
            methods: ['GET', 'POST'],
            description: 'Generate Mudad salary files for KSA HRSD compliance',
            descriptionAr: 'إنشاء ملفات رواتب مدد لامتثال وزارة الموارد البشرية',
          },
          {
            name: 'Nitaqat (Saudization)',
            nameAr: 'نطاقات',
            country: 'Saudi Arabia',
            countryAr: 'السعودية',
            endpoint: '/api/compliance/nitaqat',
            methods: ['GET', 'POST'],
            description: 'Calculate Saudization ratios and compliance status',
            descriptionAr: 'حساب نسب التوطين وحالة الامتثال',
          },
          {
            name: 'EOSB (End of Service Benefits)',
            nameAr: 'مكافأة نهاية الخدمة',
            country: 'All GCC + India',
            countryAr: 'جميع دول الخليج + الهند',
            endpoint: '/api/compliance/eosb',
            methods: ['GET', 'POST'],
            description: 'Calculate gratuity and end of service benefits',
            descriptionAr: 'حساب المكافأة ومستحقات نهاية الخدمة',
          },
          {
            name: 'Labour Law',
            nameAr: 'قانون العمل',
            country: 'All GCC + India',
            countryAr: 'جميع دول الخليج + الهند',
            endpoint: '/api/compliance/labour-law',
            methods: ['GET', 'POST'],
            description: 'Access labour law configurations and perform compliance calculations',
            descriptionAr: 'الوصول لإعدادات قانون العمل وإجراء حسابات الامتثال',
          },
        ],
        features: [
          {
            name: 'Multi-Country Support',
            nameAr: 'دعم متعدد الدول',
            description: 'Support for UAE, Saudi Arabia, Bahrain, Qatar, Oman, Kuwait, and India',
            descriptionAr: 'دعم الإمارات والسعودية والبحرين وقطر وعمان والكويت والهند',
          },
          {
            name: 'Bilingual',
            nameAr: 'ثنائي اللغة',
            description: 'All responses include both English and Arabic content',
            descriptionAr: 'جميع الردود تتضمن محتوى بالإنجليزية والعربية',
          },
          {
            name: 'File Generation',
            nameAr: 'إنشاء الملفات',
            description: 'Generate compliant files in SIF, XML, and CSV formats',
            descriptionAr: 'إنشاء ملفات متوافقة بصيغ SIF و XML و CSV',
          },
          {
            name: 'Validation',
            nameAr: 'التحقق',
            description: 'Comprehensive validation with error and warning messages',
            descriptionAr: 'تحقق شامل مع رسائل الأخطاء والتحذيرات',
          },
        ],
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch compliance API overview', errorAr: 'فشل في جلب نظرة عامة على واجهة الامتثال' },
      { status: 500 }
    );
  }
}
