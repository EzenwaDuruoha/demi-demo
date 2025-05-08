import axios from 'axios';

export class TonoClient {
  constructor(apiKey) {
    this.tono = axios.create({
      baseURL: 'https://sandboxapi.tonoapp.live/api/v3',
      headers: {
        'Content-Type': 'application/json',
        'ds-api-token': apiKey,
      },
    });
    this.spike = axios.create({
      baseURL: 'https://sandboxapi.dataspike.io/api/v4/nondoc',
      headers: {
        'Content-Type': 'application/json',
        'ds-api-token': apiKey,
      },
    });
  }

  async getApplicants() {
    return (await this.tono.get('/applicants')).data;
  }

  async getBVNStatus(applicantId, bvn) {
    return (
      await this.spike.post(`/${applicantId}/verify`, {
        verification_type: 'NONDOC_NIGERIA_BVN_BASIC',
        request_data: {
          bvn,
        },
      })
    ).data;
  }

  async getNINStatus(applicantId, nin) {
    return (
      await this.spike.post(`/${applicantId}/verify`, {
        verification_type: 'NONDOC_NIGERIA_NIN',
        request_data: {
          nin,
        },
      })
    ).data;
  }
}
