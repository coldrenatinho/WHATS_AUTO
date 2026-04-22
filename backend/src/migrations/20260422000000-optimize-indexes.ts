import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface) => {
    // Add missing indexes on tickets
    await queryInterface.addIndex('tickets', ['company_id', 'status'], {
      name: 'idx_tickets_company_status',
    });
    
    await queryInterface.addIndex('tickets', ['user_id', 'status'], {
      name: 'idx_tickets_user_status',
    });
    
    await queryInterface.addIndex('tickets', ['updated_at'], {
      name: 'idx_tickets_updated_at',
    });

    // Add missing indexes on messages (if messages table exists, but we know it's heavy)
    await queryInterface.addIndex('messages', ['ticket_id', 'created_at'], {
      name: 'idx_messages_ticket_created',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex('tickets', 'idx_tickets_company_status');
    await queryInterface.removeIndex('tickets', 'idx_tickets_user_status');
    await queryInterface.removeIndex('tickets', 'idx_tickets_updated_at');
    await queryInterface.removeIndex('messages', 'idx_messages_ticket_created');
  },
};
