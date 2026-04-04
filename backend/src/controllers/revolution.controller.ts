import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import revolutionService from '../services/revolution.service';

class RevolutionController {
  private getInstanceNameFromParams(rawValue: string | string[] | undefined): string {
    if (Array.isArray(rawValue)) {
      return rawValue[0] || '';
    }

    return rawValue || '';
  }

  async listInstances(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await revolutionService.listInstances();
      res.json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar instancias da Revolution API';
      res.status(400).json({ error: message });
    }
  }

  async createInstance(req: AuthRequest, res: Response): Promise<void> {
    const { instanceName, webhookUrl, phone } = req.body as {
      instanceName?: string;
      webhookUrl?: string;
      phone?: string;
    };

    if (!instanceName) {
      res.status(400).json({ error: 'instanceName e obrigatorio' });
      return;
    }

    try {
      const result = await revolutionService.createInstance({ instanceName, webhookUrl, phone });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar instancia na Revolution API';
      res.status(400).json({ error: message });
    }
  }

  async connectInstance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.getInstanceNameFromParams(req.params.instanceName);
      const result = await revolutionService.connectInstance(instanceName);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao conectar instancia na Revolution API';
      res.status(404).json({ error: message });
    }
  }

  async disconnectInstance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.getInstanceNameFromParams(req.params.instanceName);
      const result = await revolutionService.disconnectInstance(instanceName);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desconectar instancia na Revolution API';
      res.status(404).json({ error: message });
    }
  }

  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.getInstanceNameFromParams(req.params.instanceName);
      const result = await revolutionService.getInstanceStatus(instanceName);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar status da instancia';
      res.status(404).json({ error: message });
    }
  }

  async getQrCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.getInstanceNameFromParams(req.params.instanceName);
      const result = await revolutionService.getQrCode(instanceName);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar QR Code da instancia';
      res.status(404).json({ error: message });
    }
  }

  async sendTextMessage(req: AuthRequest, res: Response): Promise<void> {
    const { instanceName, to, text } = req.body as {
      instanceName?: string;
      to?: string;
      text?: string;
    };

    if (!instanceName || !to || !text) {
      res.status(400).json({ error: 'instanceName, to e text sao obrigatorios' });
      return;
    }

    try {
      const result = await revolutionService.sendTextMessage({ instanceName, to, text });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem de texto';
      res.status(400).json({ error: message });
    }
  }
}

export default new RevolutionController();