import React, { useState, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiCodeBlock,
  EuiBadge,
  EuiAccordion
} from '@elastic/eui';

export const ITDocumentationWiki = () => {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    // Scaffold: In production, this fetches from our Flask API: GET /kb
    const loadMockWikiDB = () => {
      const db = [
        { id: 1, title: 'Malware Remediation Playbook', category: 'Incident Response', content: '1. Isolate the Host using the Automator script.\n2. Run a full Yeti hunt.\n3. Image the drive.' },
        { id: 2, title: 'Active Directory Pass-The-Hash', category: 'Threat Analysis', content: 'When Event ID 4624 coincides with abnormal lateral movement, immediately suspend the User Account.' },
        { id: 3, title: 'Hardware Replacement (Laptop Screen)', category: 'Helpdesk', content: 'Send the user a box. Log the serial number. Trigger deployment script 4A.' }
      ];
      setArticles(db);
    };
    loadMockWikiDB();
  }, []);

  const columns = [
    { field: 'id', name: 'Wiki ID', width: '80px', sortable: true },
    { 
      field: 'category', 
      name: 'Category', 
      sortable: true,
      render: (cat: string) => <EuiBadge color={cat === 'Incident Response' ? 'danger' : 'primary'}>{cat}</EuiBadge> 
    },
    { field: 'title', name: 'Documentation Title' },
    { 
      name: 'Internal Viewer', 
      render: (item: any) => (
        <EuiAccordion id={`acc-${item.id}`} buttonContent="Expand Playbook Document">
          <EuiSpacer size="s" />
          <EuiCodeBlock paddingSize="s" language="markdown" whiteSpace="pre-wrap">
              {item.content}
          </EuiCodeBlock>
        </EuiAccordion>
      )
    }
  ];

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Integrated Document Wiki & IT Knowledge Base</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiSpacer />

        <EuiPanel>
          <EuiTitle size="s">
            <h2>Standard Operating Procedures & Playbooks</h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          <p>This Knowledge Base integrates dynamically with the Helpdesk Ticketing System. Security Analysts can attach <b>Wiki IDs</b> to live tickets so Tier 1 Support or end-users know exactly how to remediate the issue natively.</p>
          <EuiSpacer size="l" />
          
          <EuiBasicTable 
            items={articles} 
            columns={columns} 
          />
        </EuiPanel>
      </EuiPageBody>
    </EuiPage>
  );
};
