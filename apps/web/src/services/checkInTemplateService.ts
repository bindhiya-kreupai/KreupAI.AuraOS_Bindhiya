/**
 * @module checkInTemplateService
 * @description Service layer for reusable check-in / 1:1 templates.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

export interface CheckInTemplateQuestion {
  id?: string;
  text: string;
  type?: string;
  hint?: string;
  isRequired?: boolean;
}

export interface CheckInTemplateRecord {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  category: string;
  cadence: string;
  questions: CheckInTemplateQuestion[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInTemplateInput {
  name: string;
  description?: string;
  category?: string;
  cadence?: string;
  questions?: CheckInTemplateQuestion[];
  isDefault?: boolean;
}

export class CheckInTemplateService {
  private static endpoint = '/performance/check-in-templates';

  static async list(category?: string): Promise<CheckInTemplateRecord[]> {
    const res = await APIClient.get<{ templates?: CheckInTemplateRecord[] }>(
      this.endpoint,
      category ? { category } : undefined
    );
    return res.templates || [];
  }

  static async create(input: CheckInTemplateInput): Promise<CheckInTemplateRecord> {
    const res = await APIClient.post<{ template: CheckInTemplateRecord }>(this.endpoint, input);
    return res.template;
  }

  static async update(
    id: string,
    updates: Partial<CheckInTemplateInput> & { isActive?: boolean }
  ): Promise<CheckInTemplateRecord> {
    const res = await APIClient.put<{ template: CheckInTemplateRecord }>(this.endpoint, {
      id,
      ...updates,
    });
    return res.template;
  }

  static async remove(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}?id=${encodeURIComponent(id)}`);
  }

  /** Duplicate a template (name suffixed with "(Copy)"). */
  static async duplicate(t: CheckInTemplateRecord): Promise<CheckInTemplateRecord> {
    return this.create({
      name: `${t.name} (Copy)`,
      description: t.description ?? undefined,
      category: t.category,
      cadence: t.cadence,
      questions: t.questions,
    });
  }

  static async use(id: string): Promise<CheckInTemplateRecord> {
    const res = await APIClient.post<{ template: CheckInTemplateRecord }>(
      `${this.endpoint}/${id}/use`,
      {}
    );
    return res.template;
  }
}
