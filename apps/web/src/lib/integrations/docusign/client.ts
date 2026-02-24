import axios, { AxiosInstance } from 'axios';

export type DocuSignEnvelope = {
  envelopeId: string;
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  subject: string;
  createdDateTime: string;
  completedDateTime?: string;
};

export class DocuSignClient {
  private client: AxiosInstance;

  constructor(accessToken: string, accountId: string, baseUrl: string = 'https://demo.docusign.net/restapi') {
    this.client = axios.create({
      baseURL: `${baseUrl}/v2.1/accounts/${accountId}`,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
  }

  async createEnvelope(data: { subject: string; signerEmail: string; signerName: string; documentBase64: string; documentName: string }): Promise<string> {
    const { data: response } = await this.client.post('/envelopes', {
      emailSubject: data.subject,
      documents: [{ documentBase64: data.documentBase64, name: data.documentName, documentId: '1', fileExtension: 'pdf' }],
      recipients: { signers: [{ email: data.signerEmail, name: data.signerName, recipientId: '1', routingOrder: '1', tabs: { signHereTabs: [{ documentId: '1', pageNumber: '1', xPosition: '200', yPosition: '600' }] } }] },
      status: 'sent',
    });
    return response.envelopeId;
  }

  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    const { data } = await this.client.get(`/envelopes/${envelopeId}`);
    return { envelopeId: data.envelopeId, status: data.status, subject: data.emailSubject, createdDateTime: data.createdDateTime, completedDateTime: data.completedDateTime };
  }

  async voidEnvelope(envelopeId: string, reason: string): Promise<void> {
    await this.client.put(`/envelopes/${envelopeId}`, { status: 'voided', voidedReason: reason });
  }

  async getSigningUrl(envelopeId: string, returnUrl: string, signerEmail: string, signerName: string): Promise<string> {
    const { data } = await this.client.post(`/envelopes/${envelopeId}/views/recipient`, {
      returnUrl,
      authenticationMethod: 'none',
      email: signerEmail,
      userName: signerName,
    });
    return data.url;
  }
}
