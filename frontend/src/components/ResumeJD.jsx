import React, { useState, useRef } from 'react';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import '../style/ResumeJD.css';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ResumeJD = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matches, setMatches] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.substring(0, 2000);
  };

  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.substring(0, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDocx(file);
      } else {
        setError('Unsupported file type. Upload PDF or DOCX.');
        return;
      }
      setResumeText(text);
    } catch (err) {
      setError('Could not extract text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText || !jobDescription) {
      setError('Both resume and JD are required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/v1/resume', {
        resumeText: resumeText.substring(0, 2000),
        jobDescription: jobDescription.substring(0, 1000)
      });
      setMatches(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resumejd-container">
      <h2>Resume ↔ Job Description Matcher</h2>
      <div className="matcher-form">
        <div className="upload-section">
          <label className="upload-label">Upload Resume (PDF/DOCX)</label>
          <div
            className="upload-box"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx"
              style={{ display: 'none' }}
            />
            {fileName ? (
              <div className="file-info">
                <span>{fileName}</span>
                <button onClick={(e) => {
                  e.stopPropagation();
                  setFileName('');
                  setResumeText('');
                }}>×</button>
              </div>
            ) : (
              <span>Click to select file</span>
            )}
          </div>

          {resumeText && (
            <div className="text-preview">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Edit extracted resume text..."
                maxLength={2000}
              />
              <div className="char-counter">{resumeText.length}/2000</div>
            </div>
          )}
        </div>

        <div className="jd-section">
          <label>Job Description (Max 1000 chars)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            maxLength={1000}
          />
          <div className="char-counter">{jobDescription.length}/1000</div>
        </div>

        <button
          className="analyze-btn"
          onClick={handleSubmit}
          disabled={isLoading || !resumeText || !jobDescription}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Match'}
        </button>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {matches && (
  <div className="result-card">
    <div className="result-header">
      <h3>Analysis Report</h3>
      <div className="report-meta">
        <span className="report-date">{new Date().toLocaleDateString()}</span>
        <span className="report-time">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>

    <div className="match-summary">
      <div className="score-card">
        <div className="score-value">{matches.matchScore}%</div>
        <div className="score-label">Overall Match</div>
        <div className="score-description">
          {matches.matchScore >= 80 ? (
            <span className="positive">Excellent match! Strong alignment with job requirements.</span>
          ) : matches.matchScore >= 60 ? (
            <span className="moderate">Good potential match. Some areas for improvement.</span>
          ) : (
            <span className="negative">Limited match. Significant improvements needed.</span>
          )}
        </div>
      </div>

      <div className="score-breakdown">
        <div className="breakdown-item">
          <div className="breakdown-label">Keyword Alignment</div>
          <div className="breakdown-bar">
            <div 
              className="breakdown-fill"
              style={{ width: `${matches.keywordAlignment || 70}%` }}
            ></div>
          </div>
          <div className="breakdown-value">{matches.keywordAlignment || 70}%</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-label">Skills Match</div>
          <div className="breakdown-bar">
            <div 
              className="breakdown-fill"
              style={{ width: `${matches.skillsMatch || 65}%` }}
            ></div>
          </div>
          <div className="breakdown-value">{matches.skillsMatch || 65}%</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-label">Experience Relevance</div>
          <div className="breakdown-bar">
            <div 
              className="breakdown-fill"
              style={{ width: `${matches.experienceRelevance || 75}%` }}
            ></div>
          </div>
          <div className="breakdown-value">{matches.experienceRelevance || 75}%</div>
        </div>
      </div>
    </div>

    <div className="analysis-section">
      <div className="analysis-column">
        <h4>Top Matching Keywords</h4>
        <div className="keywords-container">
          {matches.keywords.map((keyword, index) => (
            <div key={index} className={`keyword-tag ${keyword.matchType}`}>
              <span className="keyword-text">{keyword.word}</span>
              <span className="keyword-count">{keyword.count}x</span>
              <span className="keyword-type-badge">{keyword.matchType}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-column">
        <h4>Missing Important Keywords</h4>
        <div className="missing-keywords">
          {matches.missingKeywords?.length > 0 ? (
            matches.missingKeywords.map((keyword, index) => (
              <div key={index} className="missing-keyword">
                <span className="missing-keyword-text">{keyword}</span>
                <span className="missing-keyword-priority">High Priority</span>
              </div>
            ))
          ) : (
            <div className="no-missing-keywords">
              No critical keywords missing
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="improvement-section">
      <h4>Optimization Recommendations</h4>
      <div className="recommendations-list">
        {matches.suggestions.map((suggestion, index) => (
          <div key={index} className="recommendation-item">
            <div className="recommendation-number">{index + 1}</div>
            <div className="recommendation-content">
              <h5>{suggestion.title || "Improvement Suggestion"}</h5>
              <p>{suggestion.description || suggestion}</p>
              {suggestion.examples && (
                <div className="recommendation-examples">
                  <span>Examples:</span>
                  <ul>
                    {suggestion.examples.map((example, exIndex) => (
                      <li key={exIndex}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="action-buttons">
      <button className="download-report-btn">
        <i className="icon-download"></i> Download Full Report
      </button>
      <button className="save-analysis-btn">
        <i className="icon-save"></i> Save Analysis
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default ResumeJD;
