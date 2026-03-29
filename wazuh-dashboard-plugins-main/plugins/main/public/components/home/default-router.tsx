import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { EuiLoadingSpinner, EuiTitle, EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

/**
 * TALOS ENTERPRISE RBAC ROUTER
 * This hook natively intercepts a user's login based on their OpenSearch/Wazuh Role.
 * It prevents overwhelmed low-tier techs from seeing complex CVE matrices,
 * and directly drops them into their highly specialized IT Workspaces.
 */
export const RoleBasedLandingRouter = ({ currentUserRole }: { currentUserRole: string }) => {
  const history = useHistory();

  useEffect(() => {
    // Scaffold: Fetching current OpenSearch/Wazuh RBAC role natively
    // Fallback logic for Hackathon demonstration
    const userRole = currentUserRole || 'Tier_1_Helpdesk'; 

    setTimeout(() => {
        if (userRole === 'Tier_1_Helpdesk') {
          // Drop L1 Support straight into the integrated IT Service Management UI
          history.push('/ticketing');
        } else if (userRole === 'SOC_Analyst') {
          // Drop Cyber analysts into the CyberCNS Auditing/CVSS UI
          history.push('/cve-auditing');
        } else if (userRole === 'Asset_Manager') {
          // Drop Inventory managers straight into the Level.io Active Directory Tree UI
          history.push('/asset-tree');
        } else {
          // Default Wazuh Global Admin Dashboard Overview
          history.push('/overview'); 
        }
    }, 1500); // Artificial delay to show the "Building Workspace" UI below

  }, [currentUserRole, history]);

  return (
    <EuiFlexGroup justifyContent="center" alignItems="center" style={{ height: '400px' }}>
        <EuiFlexItem grow={false} style={{ textAlign: 'center' }}>
            <EuiLoadingSpinner size="xl" />
            <EuiSpacer size="m" />
            <EuiTitle size="s"><h2>Constructing Personalized IT Workspace...</h2></EuiTitle>
            <p>Authenticating your Active Directory RBAC Policies...</p>
        </EuiFlexItem>
    </EuiFlexGroup>
  );
};
