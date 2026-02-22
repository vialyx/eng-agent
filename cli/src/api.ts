import axios, { AxiosInstance } from "axios";
import { ReasonRequest, ReasonResponse, EmbedRequest, EmbedResponse } from "./types";

export class AgentApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 120000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async health(): Promise<boolean> {
    try {
      const resp = await this.client.get("/health");
      return resp.status === 200;
    } catch {
      return false;
    }
  }

  async reason(request: ReasonRequest): Promise<ReasonResponse> {
    const resp = await this.client.post<ReasonResponse>("/reason", request);
    return resp.data;
  }

  async embed(request: EmbedRequest): Promise<EmbedResponse> {
    const resp = await this.client.post<EmbedResponse>("/embed", request);
    return resp.data;
  }
}
