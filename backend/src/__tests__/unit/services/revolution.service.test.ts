import revolutionService from '../../../services/revolution.service';

describe('RevolutionService (mock)', () => {
  beforeAll(() => {
    process.env.REVOLUTION_API_MODE = 'mock';
  });

  it('deve criar instancia, conectar e consultar status', async () => {
    const created = await revolutionService.createInstance({
      instanceName: 'teste-instancia',
      webhookUrl: 'https://webhook.local',
      phone: '5566999999999',
    });

    expect(created.instanceName).toBe('teste-instancia');
    expect(created.status).toBe('disconnected');

    const connected = await revolutionService.connectInstance('teste-instancia');
    expect(connected.status).toBe('connected');

    const status = await revolutionService.getInstanceStatus('teste-instancia');
    expect(status.status).toBe('connected');
    expect(status.instanceName).toBe('teste-instancia');
  });

  it('deve retornar erro ao enviar mensagem sem instancia conectada', async () => {
    await revolutionService.createInstance({ instanceName: 'instancia-offline' });

    await expect(
      revolutionService.sendTextMessage({
        instanceName: 'instancia-offline',
        to: '5566998887777',
        text: 'Oi',
      })
    ).rejects.toThrow('Instancia precisa estar conectada para enviar mensagens');
  });

  it('deve enviar mensagem de texto quando instancia estiver conectada', async () => {
    await revolutionService.createInstance({ instanceName: 'instancia-online' });
    await revolutionService.connectInstance('instancia-online');

    const sent = await revolutionService.sendTextMessage({
      instanceName: 'instancia-online',
      to: '5566998887777',
      text: 'Mensagem de teste',
    });

    expect(sent.status).toBe('sent');
    expect(sent.instanceName).toBe('instancia-online');
    expect(sent.to).toBe('5566998887777');
  });
});
