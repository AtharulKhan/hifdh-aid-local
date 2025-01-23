import React from 'react';
import { Card } from '@/components/ui/card';

const Help = () => {
  return (
    <div className="container mx-auto p-6 animate-fadeIn">
      <Card className="w-full h-[calc(100vh-2rem)] overflow-hidden rounded-xl shadow-lg">
        <iframe 
          src="https://www.edgewoodhealthnetwork.com/admissions-information/"
          className="w-full h-full border-none"
          title="Edgewood Health Network Admissions Information"
        />
      </Card>
    </div>
  );
};

export default Help;