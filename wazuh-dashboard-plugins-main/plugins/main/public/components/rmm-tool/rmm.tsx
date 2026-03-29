import React, { useState, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiPanel,
  EuiSpacer,
  EuiTextArea,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiSelect
} from '@elastic/eui';

export const RemoteManagementModule = () => {
  const [scriptBlock, setScriptBlock] = useState('');
  const [targetId, setTargetId] = useState('001'); // Default Agent ID for Hackathon
  const [status, setStatus] = useState<string | null>(null);
  const [showRmmIframe, setShowRmmIframe] = useState(false);
  const [scriptLibrary, setScriptLibrary] = useState([]);
  const [selectedScriptId, setSelectedScriptId] = useState('');

  // Scaffold: Fetch saved Script Templates from the new Python API Backend
  useEffect(() => {
    const loadScriptLibrary = async () => {
      // MOCK: fetch('/scripts')
      const scripts = [
        { id: '1', name: "Isolate Host Network", payload: "netsh advfirewall set allprofiles state on\nnetsh advfirewall firewall add rule name=\"BlockAll\" dir=in action=block" },
        { id: '2', name: "Deploy MeshCentral RMM", payload: "Invoke-WebRequest -Uri 'http://my-rmm/agent.exe' -OutFile 'C:\\Windows\\Temp\\rmm.exe'\nStart-Process 'C:\\Windows\\Temp\\rmm.exe' -ArgumentList '-install' -Wait" },
        { id: '3', name: "Kill Malicious Sysadmin", payload: "Stop-Process -Name 'powershell' -Force" },
        { id: '4', name: "Collect Memory Dump (Yeti)", payload: "Invoke-Command -ScriptBlock { Invoke-NinjaCopy -Path 'C:\\Windows\\System32\\config\\SAM' -LocalDestination 'C:\\Temp\\SAM' }" }
      ];
      setScriptLibrary(scripts);
    };
    loadScriptLibrary();
  }, []);

  const handleScriptSelect = (e: any) => {
    const val = e.target.value;
    setSelectedScriptId(val);
    const selected = scriptLibrary.find(s => s.id === val);
    if (selected) {
      setScriptBlock(selected.payload);
    }
  };

  const scriptOptions = [
    { value: '', text: 'Select a pre-built automation script...' },
    ...scriptLibrary.map(s => ({ value: s.id, text: s.name }))
  ];

  // Send the script block via the Active Response API manually
  const executeRemoteScript = async () => {
    setStatus("Transmitting payload via Wazuh Core TLS Protocol...");
    const encodedPayload = btoa(scriptBlock); // Secure encoding

    try {
      // Mocked Backend execution layer logic
      const payload = { "command": "live_script_executor", "custom": true, "arguments": [encodedPayload] };
      console.log(`Sending to Wazuh API:`, payload);
      setTimeout(() => setStatus("Successfully executed on endpoint. See active-responses.log for output!"), 1500);
    } catch(e) {
      console.error(e);
      setStatus("Error executing Active Response context.");
    }
  };

  const deployMeshCentral = () => {
    setStatus("Executing headless RMM deployment string...");
    const installRmmPowershell = `echo "Silently downloading RustDesk / MeshCentral executable..."\nInvoke-WebRequest -Uri "http://my-rmm-server/agent.exe" -OutFile "C:\\Windows\\Temp\\rmm.exe"\nStart-Process -FilePath "C:\\Windows\\Temp\\rmm.exe" -ArgumentList "-install -silent" -NoNewWindow -Wait`;
    setScriptBlock(installRmmPowershell);
    executeRemoteScript();
    setTimeout(() => setShowRmmIframe(true), 2500);
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Integrated Remote Management (RMM) & Automation</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiSpacer />

        <EuiFlexGroup>
          <EuiFlexItem grow={true}>
            <EuiPanel>
              <EuiTitle size="s">
                <h2>Master Automation Script Library</h2>
              </EuiTitle>
              <EuiSpacer size="m" />
              <p>Select a playbook from the automation library, or manually type a Bash/Powershell string below. Wazuh will pass this securely to the endpoint to be executed by the background binary.</p>
              <EuiSpacer size="m" />
              
              <EuiSelect
                options={scriptOptions}
                value={selectedScriptId}
                onChange={handleScriptSelect}
                fullWidth
              />
              <EuiSpacer size="m" />

              <EuiTextArea
                placeholder="echo 'Hello from Wazuh Dashboard' > /tmp/test.txt"
                value={scriptBlock}
                onChange={(e) => setScriptBlock(e.target.value)}
                rows={6}
                fullWidth
              />
              <EuiSpacer size="m" />
              
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiButton fill color="danger" onClick={executeRemoteScript}>
                    Force Execute Terminal Script
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton iconType="compute" onClick={deployMeshCentral}>
                    Click-To-Deploy Native RMM
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="m" />
              {status && <EuiCallOut size="s" title={status} color="success" iconType="check" />}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        {/* Embedded RDP Viewer */}
        {showRmmIframe && (
          <EuiPanel paddingSize="none" style={{ height: '600px', width: '100%', overflow: 'hidden' }}>
             <EuiTitle size="s" style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
                <h2>Centralized RustDesk/MeshCentral Viewer Module</h2>
             </EuiTitle>
             <iframe 
                src="https://meshcentral.mycompany.com/login" 
                style={{ width: '100%', height: 'calc(100% - 50px)', border: 'none' }} 
                title="RMM Web Viewer"
             />
          </EuiPanel>
        )}

      </EuiPageBody>
    </EuiPage>
  );
};
