
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrintableMurajahTable } from './PrintableMurajahTable';
import { printComponent } from '@/utils/printUtils';
import ReactDOMServer from 'react-dom/server';
import { Printer } from 'lucide-react';

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
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printTimeframe, setPrintTimeframe] = useState('7');
  const [includeMurajah, setIncludeMurajah] = useState(true);

  const getFilteredSchedule = (days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return schedule.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= today && itemDate <= futureDate;
    });
  };

  const handlePrint = () => {
    const days = parseInt(printTimeframe);
    const filteredSchedule = getFilteredSchedule(days);
    const timeframeText = days === 7 ? 'Next 7 Days' : 
                         days === 30 ? 'Next 30 Days' : 
                         days === 180 ? 'Next 6 Months' : `Next ${days} Days`;
    
    const printableComponent = <PrintableMurajahTable 
      schedule={filteredSchedule} 
      title={`${title} - ${timeframeText}`} 
    />;
    const componentHTML = ReactDOMServer.renderToStaticMarkup(printableComponent);
    printComponent(componentHTML, `${title} - ${timeframeText}`);
    setPrintDialogOpen(false);
  };

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Murajah Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select timeframe to print:</Label>
              <Select value={printTimeframe} onValueChange={setPrintTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 Days</SelectItem>
                  <SelectItem value="30">Next 30 Days</SelectItem>
                  <SelectItem value="180">Next 6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePrint} className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Print Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
