import { QueryInterface } from 'sequelize';

const INDEX_TICKETS_INBOUND_LOOKUP = 'idx_tickets_company_instance_contact_status_updated';
const INDEX_FLOWS_WEBHOOK_ROUTING = 'idx_flows_company_active_trigger_updated';
const INDEX_MESSAGES_TICKET_TIMELINE = 'idx_messages_company_ticket_created';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addIndex('tickets', ['company_id', 'instance_id', 'contact_phone', 'status', 'updated_at'], {
    name: INDEX_TICKETS_INBOUND_LOOKUP,
  });

  await queryInterface.addIndex('flows', ['company_id', 'is_active', 'trigger_type', 'updated_at'], {
    name: INDEX_FLOWS_WEBHOOK_ROUTING,
  });

  await queryInterface.addIndex('messages', ['company_id', 'ticket_id', 'created_at'], {
    name: INDEX_MESSAGES_TICKET_TIMELINE,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('messages', INDEX_MESSAGES_TICKET_TIMELINE);
  await queryInterface.removeIndex('flows', INDEX_FLOWS_WEBHOOK_ROUTING);
  await queryInterface.removeIndex('tickets', INDEX_TICKETS_INBOUND_LOOKUP);
}
