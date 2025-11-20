/**
 * @module ChatbotBuilderPage
 * @description Chatbot Builder module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function ChatbotBuilderPage() {
  return (
    <ModulePage
      moduleCode="CHATBOT_BUILDER"
      moduleName="Chatbot Builder"
      moduleIcon="chatbot"
      featureCount={8}
      isImplemented={false}
    />
  );
}
