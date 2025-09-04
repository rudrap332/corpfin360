
import React, { useState, useCallback } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { getDocumentAnalysis } from '../services/geminiService';

const DocumentAnalysis: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [documentText, setDocumentText] = useState<string | null>(null);
    const [query, setQuery] = useState<string>('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type === 'text/plain') {
            setFile(selectedFile);
            setError(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentText(e.target?.result as string);
            };
            reader.onerror = () => {
                setError('Failed to read the file.');
                setDocumentText(null);
                setFile(null);
            };
            reader.readAsText(selectedFile);
        } else {
            setError('Please upload a valid .txt file.');
            setFile(null);
            setDocumentText(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleSubmit = async () => {
        if (!documentText || !query.trim()) {
            setError('Please upload a document and enter a query.');
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getDocumentAnalysis(documentText, query);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*)\*/g, '<em>$1</em>')
            .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/(\r\n|\n\r|\r|\n){2,}/g, '<br/><br/>');
        const listWrappedHtml = html.replace(/(<li.*<\/li>)+/gs, (match) => `<ul class="list-disc list-inside space-y-1">${match}</ul>`);
        return { __html: listWrappedHtml };
    };
    
    const resetState = () => {
        setFile(null);
        setDocumentText(null);
        setQuery('');
        setAnalysis(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Business Report Analysis</h2>
                <p className="text-slate-600 mb-6">Upload a business document (.txt) and ask our AI to analyze, summarize, or extract key insights.</p>
                
                {!documentText ? (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragOver ? 'border-brand-primary bg-brand-light' : 'border-slate-300 hover:border-brand-secondary'}`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".txt"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h5l4 4v8a4 4 0 01-4 4H7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="mt-2 text-sm text-slate-600">
                                <span className="font-semibold text-brand-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">TXT files only</p>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                       <div className="p-4 border rounded-md bg-slate-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span className="font-medium">{file?.name}</span>
                                    <span className="text-sm text-slate-500">({(file?.size || 0) / 1024 > 1024 ? `${((file?.size || 0) / (1024*1024)).toFixed(2)} MB` : `${((file?.size || 0) / 1024).toFixed(2)} KB`})</span>
                                </div>
                                <button onClick={resetState} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                            </div>
                       </div>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., 'Summarize the key findings in this report' or 'What are the main risks identified?'"
                            className="block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            rows={4}
                            disabled={loading}
                        />
                        <Button onClick={handleSubmit} disabled={loading || !query.trim()} className="w-full">
                            {loading ? <><LoadingSpinner className="mr-2" /> Analyzing...</> : 'Analyze Document'}
                        </Button>
                    </div>
                )}
            </Card>

            {error && <Card><p className="text-red-600 text-center">{error}</p></Card>}

            {analysis && (
                <Card>
                    <h2 className="text-2xl font-bold text-brand-dark mb-4">AI Analysis Result</h2>
                    <div className="prose max-w-none text-slate-700" dangerouslySetInnerHTML={renderMarkdown(analysis)} />
                </Card>
            )}
        </div>
    );
};

export default DocumentAnalysis;
