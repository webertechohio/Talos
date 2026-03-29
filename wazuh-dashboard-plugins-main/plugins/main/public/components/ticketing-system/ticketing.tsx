import React, { useState, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiBasicTable,
  EuiButton,
  EuiSpacer,
  EuiPanel,
  EuiBadge
} from '@elastic/eui';

// This acts as a standalone page inside the Wazuh Dashboard specifically for Hackathon Ticketing
export const TicketingSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch from the custom python flask API we built
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Points to our custom API `ticket_routes.py` running on the manager
      const response = await fetch('http://localhost:55001/tickets');
      const data = await response.json();
      setTickets(data.data || []);
    } catch (e) {
      console.error("Error fetching tickets", e);
    }
    setLoading(false);
  };

  const createDemoTicket = async () => {
    try {
      await fetch('http://localhost:55001/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Suspected Privilege Escalation",
          description: "Wazuh FIM detected modifications to /etc/passwd or canary files.",
          alert_id: "alert-12345"
        })
      });
      fetchTickets();
    } catch (e) {
      console.error("Error creating ticket", e);
    }
  };

  const closeTicket = async (ticketId: number) => {
    try {
      await fetch(`http://localhost:55001/tickets/${ticketId}/close`, {
        method: 'POST'
      });
      fetchTickets();
    } catch (e) {
      console.error("Error closing ticket", e);
    }
  };

  const columns = [
    {
      field: 'id',
      name: 'Ticket ID',
      width: '100px',
    },
    {
      field: 'title',
      name: 'Incident Title',
    },
    {
      field: 'description',
      name: 'Description',
    },
    {
      field: 'status',
      name: 'Status',
      render: (status: string) => {
        const color = status === 'Open' ? 'danger' : 'success';
        return <EuiBadge color={color}>{status}</EuiBadge>;
      }
    },
    {
      name: 'Actions',
      render: (ticket: any) => {
        return ticket.status === 'Open' ? (
          <EuiButton size="s" color="success" onClick={() => closeTicket(ticket.id)}>
            Close Ticket
          </EuiButton>
        ) : null;
      }
    }
  ];

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Wazuh Hackathon: Incident Management Ticketing</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiSpacer />

        <EuiPanel>
          <EuiButton fill onClick={createDemoTicket}>
            Simulate Alert to Ticket (Demo)
          </EuiButton>
          <EuiSpacer />
          <EuiBasicTable
            items={tickets}
            columns={columns}
            loading={loading}
          />
        </EuiPanel>
      </EuiPageBody>
    </EuiPage>
  );
};
