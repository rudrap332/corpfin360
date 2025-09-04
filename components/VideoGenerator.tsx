
import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { generateVideo } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A cinematic shot of a futuristic city skyline at dusk, with flying vehicles.');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleProgress = (message: string) => {
        setLoadingMessage(message);
    };

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a video.');
            return;
        }
        setLoading(true);
        setError(null);
        setVideoUrl(null);
        try {
            const resultUrl = await generateVideo(prompt, handleProgress);
            setVideoUrl(resultUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleReset = () => {
        setPrompt('');
        setVideoUrl(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold text-brand-dark mb-4">AI Video Generation</h2>
                <p className="text-slate-600 mb-6">Describe the video you want to create. Be descriptive for the best results. Note that video generation can take a few minutes.</p>
                
                {!loading && !videoUrl && (
                    <div className="space-y-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A neon hologram of a cat driving a sports car at top speed'"
                            className="block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            rows={4}
                            disabled={loading}
                        />
                        <Button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="w-full">
                            {loading ? <><LoadingSpinner className="mr-2" /> Generating...</> : 'Generate Video'}
                        </Button>
                    </div>
                )}
            </Card>

            {loading && (
                <Card>
                    <div className="flex flex-col items-center justify-center p-8">
                        <LoadingSpinner className="h-12 w-12" />
                        <h3 className="text-xl font-semibold text-brand-dark mt-4">Generating Your Video...</h3>
                        <p className="text-slate-500 mt-2 text-center">{loadingMessage}</p>
                    </div>
                </Card>
            )}

            {error && <Card><p className="text-red-600 text-center font-medium p-4">{error}</p></Card>}

            {videoUrl && (
                <Card>
                    <h2 className="text-2xl font-bold text-brand-dark mb-4">Your Video is Ready!</h2>
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border">
                        <video 
                          src={videoUrl} 
                          controls 
                          autoPlay 
                          muted
                          loop 
                          className="w-full h-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <a 
                            href={videoUrl} 
                            download="generated-video.mp4"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 focus:ring-brand-primary w-full text-center"
                        >
                            Download Video
                        </a>
                        <Button onClick={handleReset} variant="secondary" className="w-full">
                            Generate Another Video
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VideoGenerator;