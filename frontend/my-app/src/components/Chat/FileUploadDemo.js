import React, { useState } from 'react';
import { 
  analyzeFile, 
  uploadChatFile, 
  askQuestionAboutFile, 
  summarizeFile, 
  analyzeFileContent,
  getExtractedText 
} from '../../services';

const FileUploadDemo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setAnalysis(null);
    setUploadedFileId(null);
    setResponse('');
    setExtractedText('');
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const result = await analyzeFile(selectedFile);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('Error analyzing file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      // Upload to a demo chat (you can use any chat ID or create a new one)
      const result = await uploadChatFile(selectedFile, 1, null); // Using chat ID 1 for demo
      setUploadedFileId(result.fileId);
      alert('File uploaded successfully! File ID: ' + result.fileId);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!uploadedFileId || !question.trim()) return;
    
    setLoading(true);
    try {
      const result = await askQuestionAboutFile(uploadedFileId, question);
      setResponse(result.response);
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Error asking question: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!uploadedFileId) return;
    
    setLoading(true);
    try {
      const result = await summarizeFile(uploadedFileId);
      setResponse(result.summary);
    } catch (error) {
      console.error('Error summarizing file:', error);
      alert('Error summarizing file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!uploadedFileId) return;
    
    setLoading(true);
    try {
      const result = await analyzeFileContent(uploadedFileId);
      setResponse(result.analysis);
    } catch (error) {
      console.error('Error analyzing content:', error);
      alert('Error analyzing content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetExtractedText = async () => {
    if (!uploadedFileId) return;
    
    setLoading(true);
    try {
      const result = await getExtractedText(uploadedFileId);
      setExtractedText(result.extractedText);
    } catch (error) {
      console.error('Error getting extracted text:', error);
      alert('Error getting extracted text: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>File Upload & AI Processing Demo</h2>
      
      {/* File Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Select a File</h3>
        <input 
          type="file" 
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt,.pptx,.xlsx,.doc,.ppt,.xls,.md,.json,.xml,.csv"
        />
        {selectedFile && (
          <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
        )}
      </div>

      {/* File Analysis */}
      {selectedFile && (
        <div style={{ marginBottom: '20px' }}>
          <h3>2. Analyze File (Preview)</h3>
          <button onClick={handleAnalyzeFile} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze File'}
          </button>
          
          {analysis && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <p><strong>File Name:</strong> {analysis.fileName}</p>
              <p><strong>Size:</strong> {(analysis.fileSize / 1024).toFixed(1)} KB</p>
              <p><strong>Type:</strong> {analysis.contentType}</p>
              <p><strong>Text Extraction Supported:</strong> {analysis.textExtractionSupported ? 'Yes' : 'No'}</p>
              <p><strong>Extraction Successful:</strong> {analysis.extractionSuccessful ? 'Yes' : 'No'}</p>
              <p><strong>Word Count:</strong> {analysis.wordCount}</p>
              {analysis.textPreview && (
                <div>
                  <strong>Text Preview:</strong>
                  <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    {analysis.textPreview}
                  </div>
                </div>
              )}
              {analysis.errorMessage && (
                <p style={{ color: 'red' }}><strong>Error:</strong> {analysis.errorMessage}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      {selectedFile && analysis && analysis.textExtractionSupported && (
        <div style={{ marginBottom: '20px' }}>
          <h3>3. Upload File</h3>
          <button onClick={handleUploadFile} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
          {uploadedFileId && (
            <p style={{ color: 'green' }}>✓ File uploaded successfully! ID: {uploadedFileId}</p>
          )}
        </div>
      )}

      {/* AI Operations */}
      {uploadedFileId && (
        <div style={{ marginBottom: '20px' }}>
          <h3>4. AI Operations</h3>
          
          {/* Get Extracted Text */}
          <div style={{ marginBottom: '15px' }}>
            <button onClick={handleGetExtractedText} disabled={loading}>
              {loading ? 'Loading...' : 'Get Extracted Text'}
            </button>
          </div>

          {/* Ask Question */}
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the file..."
              style={{ width: '300px', marginRight: '10px', padding: '5px' }}
            />
            <button onClick={handleAskQuestion} disabled={loading || !question.trim()}>
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '15px' }}>
            <button onClick={handleSummarize} disabled={loading} style={{ marginRight: '10px' }}>
              {loading ? 'Processing...' : 'Summarize'}
            </button>
            <button onClick={handleAnalyzeContent} disabled={loading}>
              {loading ? 'Processing...' : 'Analyze Content'}
            </button>
          </div>
        </div>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Extracted Text</h3>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '300px', overflow: 'auto', backgroundColor: '#f9f9f9' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{extractedText}</pre>
          </div>
        </div>
      )}

      {/* AI Response Display */}
      {response && (
        <div style={{ marginBottom: '20px' }}>
          <h3>AI Response</h3>
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '400px', overflow: 'auto', backgroundColor: '#f0f8ff' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h4>How to use:</h4>
        <ol>
          <li>Select a file (PDF, DOCX, TXT, etc.)</li>
          <li>Click "Analyze File" to preview text extraction</li>
          <li>Click "Upload File" to save it to the server</li>
          <li>Use AI operations to interact with the file content</li>
        </ol>
        <p><strong>Supported formats:</strong> PDF, DOCX, PPTX, XLSX, TXT, MD, JSON, XML, CSV, and more</p>
      </div>
    </div>
  );
};

export default FileUploadDemo; 