
import React from 'react';
import { Button } from "@/components/ui/button";
import { PrintableMurajahTable } from './PrintableMurajahTable';
import { printComponent } from '@/utils/printUtils';
import ReactDOMServer from 'react-dom/server';

interface MurajahScheduleItem {
  date: string;
  rmvPages: string;
  omvJuz: string;
  listeningJuz: string;
  readingJuz: string;
  completed?: boolean;
}

interface MurajahPrintActionsProps {
  schedule: MurajahScheduleItem[];
  title?: string;
}

export const MurajahPrintActions: React.FC<MurajahPrintActionsProps> = ({ 
  schedule, 
  title = "Murajah Schedule" 
}) => {
  const handlePrint = () => {
    const printableComponent = <PrintableMurajahTable schedule={schedule} title={title} />;
    const componentHTML = ReactDOMServer.renderToStaticMarkup(printableComponent);
    printComponent(componentHTML, title);
  };

  const handleDownload = () => {
    const printableComponent = <PrintableMurajahTable schedule={schedule} title={title} />;
    const componentHTML = ReactDOMServer.renderToStaticMarkup(printableComponent);
    printComponent(componentHTML, title);
  };

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  );
};
