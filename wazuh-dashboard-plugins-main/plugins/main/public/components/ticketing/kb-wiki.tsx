import React, { useState, useEffect } from 'react';
import { 
    EuiPage, 
    EuiPageBody, 
    EuiTitle, 
    EuiPanel, 
    EuiSpacer,
    EuiFlexGroup,
    EuiFlexItem,
    EuiListGroup,
    EuiDescriptionList,
    EuiButton,
    EuiIcon,
    EuiBadge
} from '@elastic/eui';

/**
 * TALOS WIKI & KNOWLEDGE BASE
 * Integrated IT documentation system mapping remediation playbooks
 * directly to endpoint incident tickets.
 */
export const KbWiki = () => {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        // Scaffold: Fetching KB from SQLite backend
        const loadArticles = () => {
            setArticles([
                { 
                    id: '1', 
                    title: 'Common Canary File False Positives', 
                    content: 'If Rule 100500 triggers on a fresh build, verify it isn\'t the automatic deployment script.',
                    tags: ['Syscheck', 'Canary']
                },
                { 
                    id: '2', 
                    title: 'Remote Execution Firewall Bypass', 
                    content: 'Run `netsh advfirewall set allprofiles state off` only in emergency scenarios.',
                    tags: ['Networking', 'RMM']
                }
            ]);
        };
        loadArticles();
    }, []);

    return (
        <EuiPage>
            <EuiPageBody>
                <EuiTitle size="l">
                    <h1>Integrated IT Wiki & Incident Playbooks</h1>
                </EuiTitle>
                <EuiSpacer />
                
                <EuiFlexGroup>
                    <EuiFlexItem grow={1}>
                        <EuiPanel>
                            <EuiTitle size="s">
                                <h2>Documentation Categories</h2>
                            </EuiTitle>
                            <EuiSpacer />
                            <EuiListGroup flush={true}>
                                <EuiButton iconType="document" color="primary">Endpoint Security Policies</EuiButton>
                                <EuiButton iconType="compute" color="accent">Automation Script Library</EuiButton>
                                <EuiButton iconType="help" color="warning">Onboarding Guides</EuiButton>
                            </EuiListGroup>
                        </EuiPanel>
                    </EuiFlexItem>
                    
                    <EuiFlexItem grow={2}>
                        <EuiPanel>
                            <EuiTitle size="s">
                                <h2>Active Incident Articles</h2>
                            </EuiTitle>
                            <EuiSpacer />
                            <EuiDescriptionList 
                                listItems={articles.map(a => ({
                                    title: (
                                        <span>
                                            {a.title} {a.tags.map(t => <EuiBadge key={t} color="hollow">{t}</EuiBadge>)}
                                        </span>
                                    ),
                                    description: a.content
                                }))} 
                            />
                        </EuiPanel>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPageBody>
        </EuiPage>
    );
};
