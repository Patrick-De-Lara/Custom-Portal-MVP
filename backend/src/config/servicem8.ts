import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class ServiceM8Client {
  private client: AxiosInstance;

  constructor() {
    // ServiceM8 API Key authentication
    // The API key goes in the X-API-Key header (NOT Basic Auth)
    const apiKey = process.env.SERVICEM8_API_KEY || '';
    
    if (!apiKey) {
      console.warn('⚠️  ServiceM8 API key not configured in .env file');
    }

    console.log('🔧 ServiceM8 Config:', {
      baseURL: 'https://api.servicem8.com/api_1.0',
      apiKeyPrefix: apiKey.substring(0, 10) + '***', // Show first 10 chars only
      hasApiKey: !!apiKey
    });

    this.client = axios.create({
      baseURL: 'https://api.servicem8.com/api_1.0',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  // Get job (booking) details
  async getJob(jobUuid: string) {
    try {
      const response = await this.client.get(`/job.json/${jobUuid}`);
      return response.data;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }

  // Get jobs for a company (customer)
  async getJobsByCompany(companyUuid: string) {
    try {
      const response = await this.client.get('/job.json', {
        params: {
          'company_uuid': companyUuid,
        },
      });
      return response.data;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }

  // Get job attachments
  async getJobAttachments(jobUuid: string) {
    try {
      const response = await this.client.get('/attachment.json', {
        params: {
          'related_object_uuid': jobUuid,
        },
      });
      return response.data;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }

  // Get company details
  async getCompany(companyUuid: string) {
    try {
      const response = await this.client.get(`/company.json/${companyUuid}`);
      return response.data;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }

  // Get all companies
  async getAllCompanies() {
    try {
      const response = await this.client.get('/company.json');
      return response.data;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }

  // Get attachment file URL
  async getAttachmentUrl(attachmentUuid: string) {
    try {
      // ServiceM8 stores files, we need to construct the download URL
      // The file can be accessed at: /attachment.json/{uuid}/file
      return `https://api.servicem8.com/api_1.0/attachment.json/${attachmentUuid}/file`;
    } catch (error) {
      console.error('ServiceM8 API Error:', error);
      throw error;
    }
  }
}

export default new ServiceM8Client();
