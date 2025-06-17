import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/ShareModal.css';

const ShareModal = ({ isOpen, onClose, chatId, chatTitle }) => {
    const [shareData, setShareData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchShareInfo = useCallback(async () => {
        if (!chatId) {
            setError('Chat ID is missing');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            // Get token from user object in localStorage (matching the auth system)
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }

            console.log('Fetching share info for chat ID:', chatId);
            const response = await fetch(`http://localhost:9191/api/chat/${chatId}/share`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Share info response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Share info data:', data);
                setShareData(data);
            } else {
                const errorText = await response.text();
                console.error('Share info error response:', errorText);
                setError(errorText || `Failed to fetch share information (${response.status})`);
            }
        } catch (err) {
            console.error('Share info fetch error:', err);
            setError(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (isOpen && chatId) {
            fetchShareInfo();
        }
    }, [isOpen, chatId, fetchShareInfo]);

    const regenerateShareToken = async () => {
        if (!chatId) {
            setError('Chat ID is missing');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            // Get token from user object in localStorage (matching the auth system)
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }

            console.log('Regenerating share token for chat ID:', chatId);
            const response = await fetch(`http://localhost:9191/api/chat/${chatId}/regenerate-share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Regenerate response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Regenerate response data:', data);
                setShareData(data);
                setCopied(false); // Reset copy status
            } else {
                const errorText = await response.text();
                console.error('Regenerate error response:', errorText);
                setError(errorText || `Failed to regenerate share token (${response.status})`);
            }
        } catch (err) {
            console.error('Regenerate share token error:', err);
            setError(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (shareData?.shareUrl) {
            try {
                await navigator.clipboard.writeText(shareData.shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = shareData.shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="share-modal-overlay" onClick={handleOverlayClick}>
            <div className="share-modal">
                <div className="share-modal-header">
                    <h2>Share Chat</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="share-modal-content">
                    {loading ? (
                        <div className="loading-indicator">Loading...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : shareData ? (
                        <>
                            <div className="chat-info">
                                <h3>{chatTitle}</h3>
                                <p>Share this chat with others using the link below:</p>
                            </div>
                            
                            <div className="share-url-section">
                                <label htmlFor="shareUrl">Share URL:</label>
                                <div className="url-input-container">
                                    <input
                                        id="shareUrl"
                                        type="text"
                                        value={shareData.shareUrl}
                                        readOnly
                                        className="share-url-input"
                                    />
                                    <button 
                                        className={`copy-button ${copied ? 'copied' : ''}`}
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? '✓ Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="share-token-section">
                                <label>Share Token:</label>
                                <code className="share-token">{shareData.shareToken}</code>
                            </div>
                            
                            <div className="share-actions">
                                <button 
                                    className="regenerate-button"
                                    onClick={regenerateShareToken}
                                    disabled={loading}
                                >
                                    Regenerate Token
                                </button>
                                <p className="regenerate-note">
                                    Regenerating will invalidate the current share link.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div>No share data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal; 