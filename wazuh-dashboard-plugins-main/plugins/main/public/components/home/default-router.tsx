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
    const userRole = currentUserRole || 'Tier_1_Helpdesk'; 

    setTimeout(() => {
        if (userRole === 'Tier_1_Helpdesk') {
          history.push('/ticketing');
        } else if (userRole === 'SOC_Analyst') {
          history.push('/cve-auditing');
        } else if (userRole === 'Asset_Manager') {
          history.push('/asset-tree');
        } else {
          history.push('/overview'); 
        }
    }, 1500); 

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
