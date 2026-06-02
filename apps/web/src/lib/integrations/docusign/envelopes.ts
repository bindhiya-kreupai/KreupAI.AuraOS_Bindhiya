import type { DocuSignClient } from './client';

export type OfferLetterData = {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  startDate: string;
  salary: string;
  documentBase64: string;
};

export type ContractData = {
  employeeName: string;
  employeeEmail: string;
  contractType: 'permanent' | 'fixed_term' | 'contractor';
  startDate: string;
  endDate?: string;
  documentBase64: string;
};

export async function sendOfferLetter(client: DocuSignClient, data: OfferLetterData): Promise<string> {
  return client.createEnvelope({
    subject: `Offer Letter - ${data.position} at ${data.department}`,
    signerEmail: data.candidateEmail,
    signerName: data.candidateName,
    documentBase64: data.documentBase64,
    documentName: `Offer_Letter_${data.candidateName.replace(/\s+/g, '_')}.pdf`,
  });
}

export async function sendEmploymentContract(client: DocuSignClient, data: ContractData): Promise<string> {
  const contractLabel = data.contractType === 'permanent' ? 'Employment Contract' : data.contractType === 'fixed_term' ? 'Fixed-Term Contract' : 'Contractor Agreement';
  return client.createEnvelope({
    subject: `${contractLabel} - ${data.employeeName}`,
    signerEmail: data.employeeEmail,
    signerName: data.employeeName,
    documentBase64: data.documentBase64,
    documentName: `${contractLabel.replace(/\s+/g, '_')}_${data.employeeName.replace(/\s+/g, '_')}.pdf`,
  });
}

export async function checkEnvelopeCompletion(client: DocuSignClient, envelopeId: string): Promise<{ completed: boolean; status: string }> {
  const envelope = await client.getEnvelopeStatus(envelopeId);
  return { completed: envelope.status === 'completed', status: envelope.status };
}
