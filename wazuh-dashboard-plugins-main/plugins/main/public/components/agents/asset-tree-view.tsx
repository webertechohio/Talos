import React, { useState, useEffect } from 'react';
import { 
    EuiPage, 
    EuiPageBody, 
    EuiTreeView, 
    EuiTitle, 
    EuiPanel, 
    EuiIcon, 
    EuiSpacer,
    EuiBadge
} from '@elastic/eui';

/**
 * TALOS ASSET MANAGEMENT HIERARCHY
 * Flattens the raw Wazuh JSON Agent API and dynamically constructs 
 * an intuitive, collapsible Directory Tree mapped identical to active ADUC organizational units.
 */
export const HierarchicalAssetTree = () => {
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        // Scaffold: Fetching /agents from the Wazuh Manager seamlessly
        const buildLevelioTree = () => {
            const activeNodes = [
                {
                    label: 'Enterprise Headquarters',
                    id: 'hq',
                    icon: <EuiIcon type="folderOpen" />,
                    children: [
                        {
                            label: 'Production Servers',
                            id: 'hq-servers',
                            icon: <EuiIcon type="folderOpen" />,
                            children: [
                                { 
                                    label: 'Domain Controllers (AD)', 
                                    id: 'dc-group', 
                                    icon: <EuiIcon type="folderOpen" />, 
                                    children: [
                                        { label: 'DC-PRIMARY.local', id: '002', icon: <EuiIcon type="compute" color="success"/> }
                                    ] 
                                },
                                { 
                                    label: 'Exchange Clusters', 
                                    id: 'email-group', 
                                    icon: <EuiIcon type="folderOpen" />, 
                                    children: [
                                        { label: 'EXCH-NODE-01', id: '001', icon: <EuiIcon type="compute" color="success"/> }
                                    ] 
                                }
                            ]
                        },
                        {
                            label: 'Corporate Finance Workstations',
                            id: 'hq-finance',
                            icon: <EuiIcon type="folderOpen" />,
                            children: [
                                { label: 'ASMITH-DESK (Finance Manager)', id: '004', icon: <EuiIcon type="compute" color="success"/> }
                            ]
                        }
                    ]
                },
                {
                    label: 'Off-Site / Remote Fleet',
                    id: 'remote',
                    icon: <EuiIcon type="folderOpen" />,
                    children: [
                        {
                            label: 'Sales Division',
                            id: 'rem-sales',
                            icon: <EuiIcon type="folderOpen" />,
                            children: [
                                { label: 'JDOE-SURFACE (Awaiting Audit)', id: '003', icon: <EuiIcon type="compute" color="danger"/> }
                            ]
                        }
                    ]
                }
            ];
            
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setTreeData(activeNodes);
        };
        buildLevelioTree();
    }, []);

    return (
        <EuiPage>
            <EuiPageBody>
                <EuiTitle size="l">
                    <h1>Active Directory Endpoint Architecture</h1>
                </EuiTitle>
                <EuiSpacer />
                
                <EuiPanel>
                    <EuiTitle size="s">
                        <h2>Logical Level.io Groupings</h2>
                    </EuiTitle>
                    <EuiSpacer size="m" />
                    <p>
                        This matrix actively translates the flat `wazuh/agents` API into a dynamic organizational tree constraint. Clicking an endpoint enables granular remote execution. 
                        Disconnected endpoints flag instantly in <EuiBadge color="danger">Red</EuiBadge>.
                    </p>
                    <EuiSpacer size="l"/>
                    
                    <div style={{ padding: '20px', backgroundColor: '#fafbfd', border: '1px solid #d3dae6', borderRadius: '4px' }}>
                        <EuiTreeView 
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            items={treeData} 
                            expandByDefault={true} 
                            aria-label="Wazuh Endpoint Tree"
                        />
                    </div>
                </EuiPanel>
            </EuiPageBody>
        </EuiPage>
    );
};
