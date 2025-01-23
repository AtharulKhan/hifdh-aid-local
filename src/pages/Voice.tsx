import React, { useEffect } from 'react';

const Voice = () => {
  useEffect(() => {
    // Add the ElevenLabs script
    const script = document.createElement('script');
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Voice Chat</h1>
      <div className="w-full max-w-3xl mx-auto">
        <elevenlabs-convai agent-id="C1Rj6IQH111hf0JfEe24"></elevenlabs-convai>
      </div>
    </div>
  );
};

export default Voice;