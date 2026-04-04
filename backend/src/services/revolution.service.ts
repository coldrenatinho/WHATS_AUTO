type RevolutionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface RevolutionInstancePayload {
  instanceName: string;
  webhookUrl?: string;
  phone?: string;
}

interface RevolutionMessagePayload {
  instanceName: string;
  to: string;
  text: string;
}

interface RevolutionInstanceMock {
  instanceName: string;
  status: RevolutionStatus;
  webhookUrl?: string;
  phone?: string;
  qrCode: string;
  lastUpdateAt: string;
}

interface RevolutionMessageResponse {
  messageId: string;
  status: 'queued' | 'sent';
  instanceName: string;
  to: string;
  text: string;
  sentAt: string;
}

class RevolutionService {
  private readonly instances = new Map<string, RevolutionInstanceMock>();

  private get mode(): string {
    return process.env.REVOLUTION_API_MODE || 'mock';
  }

  private get baseUrl(): string {
    return (
      process.env.REVOLUTION_API_URL ||
      process.env.EVOLUTION_SERVER_URL ||
      ''
    ).replace(/\/$/, '');
  }

  private get apiKey(): string {
    return process.env.REVOLUTION_API_KEY || process.env.EVOLUTION_API_KEY || '';
  }

  private get endpoints(): {
    list: string;
    create: string;
    connect: string;
    disconnect: string;
    status: string;
    qrcode: string;
    sendText: string;
  } {
    return {
      list: process.env.REVOLUTION_ENDPOINT_LIST || '/instance/fetchInstances',
      create: process.env.REVOLUTION_ENDPOINT_CREATE || '/instance/create',
      connect: process.env.REVOLUTION_ENDPOINT_CONNECT || '/instance/connect/{instanceName}',
      disconnect: process.env.REVOLUTION_ENDPOINT_DISCONNECT || '/instance/logout/{instanceName}',
      status: process.env.REVOLUTION_ENDPOINT_STATUS || '/instance/connectionState/{instanceName}',
      qrcode: process.env.REVOLUTION_ENDPOINT_QRCODE || '/instance/connect/{instanceName}',
      sendText: process.env.REVOLUTION_ENDPOINT_SEND_TEXT || '/message/sendText/{instanceName}',
    };
  }

  private buildQrCode(instanceName: string): string {
    return `data:image/png;base64,QR_${Buffer.from(instanceName).toString('base64')}`;
  }

  private buildEndpoint(pathTemplate: string, instanceName?: string): string {
    const withParams = instanceName
      ? pathTemplate.replace('{instanceName}', encodeURIComponent(instanceName))
      : pathTemplate;

    if (!this.baseUrl) {
      throw new Error('REVOLUTION_API_URL ou EVOLUTION_SERVER_URL nao configurada');
    }

    return `${this.baseUrl}${withParams.startsWith('/') ? '' : '/'}${withParams}`;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    pathTemplate: string,
    body?: Record<string, unknown>,
    instanceName?: string
  ): Promise<T> {
    const url = this.buildEndpoint(pathTemplate, instanceName);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers.apikey = this.apiKey;
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const rawText = await response.text();
    let parsed = {} as T;

    if (rawText) {
      try {
        parsed = JSON.parse(rawText) as T;
      } catch {
        parsed = { message: rawText } as T;
      }
    }

    if (!response.ok) {
      const details =
        typeof parsed === 'object' && parsed !== null && 'message' in parsed
          ? String((parsed as Record<string, unknown>).message)
          : rawText;
      throw new Error(`Revolution API retornou ${response.status}: ${details}`);
    }

    return parsed;
  }

  private ensureInstance(instanceName: string): RevolutionInstanceMock {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error('Instancia da Revolution API nao encontrada');
    }
    return instance;
  }

  private normalizeStatus(rawStatus: unknown): RevolutionStatus {
    const status = String(rawStatus || '').toLowerCase();

    if (status.includes('open') || status.includes('connected')) return 'connected';
    if (status.includes('connect')) return 'connecting';
    if (status.includes('close') || status.includes('disconnect')) return 'disconnected';
    return 'error';
  }

  async listInstances(): Promise<RevolutionInstanceMock[]> {
    if (this.mode !== 'mock') {
      const data = await this.request<unknown>('GET', this.endpoints.list);
      const list = Array.isArray(data)
        ? data
        : (data as Record<string, unknown>)?.instances ||
          (data as Record<string, unknown>)?.data ||
          [];

      if (!Array.isArray(list)) {
        return [];
      }

      return list.map((item) => {
        const parsed = item as Record<string, unknown>;
        const instanceName = String(
          parsed.instanceName || parsed.name || parsed.instance || ''
        );
        return {
          instanceName,
          status: this.normalizeStatus(parsed.status || parsed.connectionStatus),
          webhookUrl: parsed.webhookUrl ? String(parsed.webhookUrl) : undefined,
          phone: parsed.phone ? String(parsed.phone) : undefined,
          qrCode: parsed.qrcode ? String(parsed.qrcode) : '',
          lastUpdateAt: new Date().toISOString(),
        };
      });
    }

    return Array.from(this.instances.values());
  }

  async createInstance(payload: RevolutionInstancePayload): Promise<RevolutionInstanceMock> {
    if (this.mode !== 'mock') {
      await this.request<unknown>('POST', this.endpoints.create, {
        instanceName: payload.instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        token: this.apiKey || undefined,
        webhook: payload.webhookUrl || undefined,
      });

      return {
        instanceName: payload.instanceName,
        status: 'connecting',
        webhookUrl: payload.webhookUrl,
        phone: payload.phone,
        qrCode: '',
        lastUpdateAt: new Date().toISOString(),
      };
    }

    if (this.instances.has(payload.instanceName)) {
      throw new Error('Instancia ja existe na Revolution API');
    }

    const instance: RevolutionInstanceMock = {
      instanceName: payload.instanceName,
      status: 'disconnected',
      webhookUrl: payload.webhookUrl,
      phone: payload.phone,
      qrCode: this.buildQrCode(payload.instanceName),
      lastUpdateAt: new Date().toISOString(),
    };

    this.instances.set(payload.instanceName, instance);
    return instance;
  }

  async connectInstance(instanceName: string): Promise<RevolutionInstanceMock> {
    if (this.mode !== 'mock') {
      const result = await this.request<Record<string, unknown>>(
        'GET',
        this.endpoints.connect,
        undefined,
        instanceName
      );

      return {
        instanceName,
        status: 'connected',
        webhookUrl: undefined,
        phone: undefined,
        qrCode: result.base64 ? String(result.base64) : '',
        lastUpdateAt: new Date().toISOString(),
      };
    }

    const instance = this.ensureInstance(instanceName);
    instance.status = 'connected';
    instance.lastUpdateAt = new Date().toISOString();
    this.instances.set(instanceName, instance);
    return instance;
  }

  async disconnectInstance(instanceName: string): Promise<RevolutionInstanceMock> {
    if (this.mode !== 'mock') {
      await this.request<unknown>('DELETE', this.endpoints.disconnect, undefined, instanceName);
      return {
        instanceName,
        status: 'disconnected',
        webhookUrl: undefined,
        phone: undefined,
        qrCode: '',
        lastUpdateAt: new Date().toISOString(),
      };
    }

    const instance = this.ensureInstance(instanceName);
    instance.status = 'disconnected';
    instance.lastUpdateAt = new Date().toISOString();
    this.instances.set(instanceName, instance);
    return instance;
  }

  async getInstanceStatus(instanceName: string): Promise<Pick<RevolutionInstanceMock, 'instanceName' | 'status' | 'lastUpdateAt'>> {
    if (this.mode !== 'mock') {
      const data = await this.request<Record<string, unknown>>(
        'GET',
        this.endpoints.status,
        undefined,
        instanceName
      );

      const instanceData = (data.instance as Record<string, unknown> | undefined) || undefined;

      return {
        instanceName,
        status: this.normalizeStatus(
          data.status ||
          data.state ||
          data.connectionStatus ||
          instanceData?.state ||
          instanceData?.status
        ),
        lastUpdateAt: new Date().toISOString(),
      };
    }

    const instance = this.ensureInstance(instanceName);
    return {
      instanceName: instance.instanceName,
      status: instance.status,
      lastUpdateAt: instance.lastUpdateAt,
    };
  }

  async getQrCode(instanceName: string): Promise<{ instanceName: string; qrCode: string }> {
    if (this.mode !== 'mock') {
      const data = await this.request<Record<string, unknown>>(
        'GET',
        this.endpoints.qrcode,
        undefined,
        instanceName
      );

      return {
        instanceName,
        qrCode: String(data.base64 || data.qrcode || ''),
      };
    }

    const instance = this.ensureInstance(instanceName);
    return {
      instanceName: instance.instanceName,
      qrCode: instance.qrCode,
    };
  }

  async sendTextMessage(payload: RevolutionMessagePayload): Promise<RevolutionMessageResponse> {
    if (this.mode !== 'mock') {
      const data = await this.request<Record<string, unknown>>(
        'POST',
        this.endpoints.sendText,
        {
          number: payload.to,
          text: payload.text,
          options: {
            delay: 0,
            presence: 'composing',
          },
        },
        payload.instanceName
      );

      return {
        messageId: String(data.key || data.id || `msg_${Date.now()}`),
        status: 'sent',
        instanceName: payload.instanceName,
        to: payload.to,
        text: payload.text,
        sentAt: new Date().toISOString(),
      };
    }

    const instance = this.ensureInstance(payload.instanceName);
    if (instance.status !== 'connected') {
      throw new Error('Instancia precisa estar conectada para enviar mensagens');
    }

    return {
      messageId: `msg_${Date.now()}`,
      status: 'sent',
      instanceName: payload.instanceName,
      to: payload.to,
      text: payload.text,
      sentAt: new Date().toISOString(),
    };
  }
}

export default new RevolutionService();