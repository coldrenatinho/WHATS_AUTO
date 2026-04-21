import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares';
import DomainError from '../core/errors/domain.error';
import sendControllerError from '../core/http/controller-error';
import revolutionService from '../services/revolution.service';

const createInstanceSchema = z.object({
  instanceName: z.string().trim().min(1, 'instanceName e obrigatorio'),
  webhookUrl: z.string().trim().url('webhookUrl invalido').optional(),
  phone: z.string().trim().regex(/^\d{10,15}$/, 'phone invalido').optional(),
});

const sendTextSchema = z.object({
  instanceName: z.string().trim().min(1, 'instanceName e obrigatorio'),
  to: z.string().trim().regex(/^\d{10,15}$/, 'to invalido'),
  text: z.string().trim().min(1, 'text e obrigatorio').max(4096, 'text muito longo'),
});

class RevolutionController {
  private getInstanceNameFromParams(rawValue: string | string[] | undefined): string {
    if (Array.isArray(rawValue)) {
      return rawValue[0] || '';
    }

    return rawValue || '';
  }

  private requireInstanceName(rawValue: string | string[] | undefined): string {
    const value = this.getInstanceNameFromParams(rawValue).trim();
    if (!value) {
      throw new DomainError('instanceName e obrigatorio', 400);
    }

    return value;
  }

  async listInstances(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await revolutionService.listInstances();
      res.json(data);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao listar instancias da Revolution API', 400);
    }
  }

  async createInstance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = createInstanceSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new DomainError(parsed.error.issues[0]?.message || 'Payload invalido', 400);
      }

      const { instanceName, webhookUrl, phone } = parsed.data;
      const result = await revolutionService.createInstance({ instanceName, webhookUrl, phone });
      res.status(201).json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao criar instancia na Revolution API', 400);
    }
  }

  async connectInstance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.requireInstanceName(req.params.instanceName);
      const result = await revolutionService.connectInstance(instanceName);
      res.json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao conectar instancia na Revolution API', 404);
    }
  }

  async disconnectInstance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.requireInstanceName(req.params.instanceName);
      const result = await revolutionService.disconnectInstance(instanceName);
      res.json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao desconectar instancia na Revolution API', 404);
    }
  }

  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.requireInstanceName(req.params.instanceName);
      const result = await revolutionService.getInstanceStatus(instanceName);
      res.json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao buscar status da instancia', 404);
    }
  }

  async getQrCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instanceName = this.requireInstanceName(req.params.instanceName);
      const result = await revolutionService.getQrCode(instanceName);
      res.json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao buscar QR Code da instancia', 404);
    }
  }

  async sendTextMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = sendTextSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new DomainError(parsed.error.issues[0]?.message || 'Payload invalido', 400);
      }

      const { instanceName, to, text } = parsed.data;
      const result = await revolutionService.sendTextMessage({ instanceName, to, text });
      res.status(201).json(result);
    } catch (error) {
      sendControllerError(res, error, 'Erro ao enviar mensagem de texto', 400);
    }
  }
}

export default new RevolutionController();