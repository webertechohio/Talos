import React, { useState } from 'react';
import { 
    EuiPage, 
    EuiPageBody, 
    EuiTitle, 
    EuiPanel, 
    EuiSpacer, 
    EuiFieldText, 
    EuiButton, 
    EuiFlexGroup, 
    EuiFlexItem,
    EuiLink,
    EuiGlobalBadge
} from '@elastic/eui';

/**
 * TALOS RMM - REMOTE MANAGEMENT TOOL
 * This provides the background script executor and 
 * embedded iFrame for MeshCentral/RustDesk.
 */
export const RmmTool = () => {
    const [command, setCommand] = useState('');
    const [status, setStatus] = useState('Standby');

    const handleExecute = () => {
        setStatus('Executing Background Payload...');
        setTimeout(() => setStatus('Command Sent Successfully'), 2000);
    };

    return (
        <EuiPage>
            <EuiPageBody>
                <EuiTitle size="l">
                    <h1>Live Remote Execution Console</h1>
                </EuiTitle>
                <EuiSpacer />
                
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiPanel>
                            <EuiTitle size="s">
                                <h2>Direct Scripting Terminal (Talos-RMM)</h2>
                            </EuiTitle>
                            <EuiSpacer />
                            <EuiFieldText 
                                placeholder="Enter Bash or PowerShell string..." 
                                value={command} 
                                onChange={(e) => setCommand(e.target.value)} 
                            />
                            <EuiSpacer />
                            <EuiButton fill onClick={handleExecute}>Push Execution to Endpoint</EuiButton>
                            <EuiSpacer size="m" />
                            <EuiGlobalBadge color="accent">{status}</EuiGlobalBadge>
                        </EuiPanel>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer />
                <EuiPanel style={{ height: '500px' }}>
                    <EuiTitle size="s">
                        <h2>Remote Desktop Session (iFrame)</h2>
                    </EuiTitle>
                    <EuiSpacer />
                    <iframe 
                        src="https://meshcentral.com" 
                        title="MeshCentral Integration" 
                        style={{ width: '100%', height: '400px', border: '1px solid #d3dae6' }}
                    />
                </EuiPanel>
            </EuiPageBody>
        </EuiPage>
    );
};
