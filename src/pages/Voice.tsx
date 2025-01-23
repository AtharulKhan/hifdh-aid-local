import React, { useEffect, useRef } from 'react';

const Voice = () => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Create script element if it doesn't exist
    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.type = "text/javascript";
      
      // Add error handling
      script.onerror = (error) => {
        console.error('Error loading ElevenLabs script:', error);
      };
      
      // Add load handling
      script.onload = () => {
        console.log('ElevenLabs script loaded successfully');
      };

      scriptRef.current = script;
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Voice Chat</h1>
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <elevenlabs-convai 
          agent-id="C1Rj6IQH111hf0JfEe24"
          className="w-full h-[600px]"
        />
      </div>
    </div>
  );
};

export default Voice;