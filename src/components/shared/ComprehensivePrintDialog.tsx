
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer } from 'lucide-react';
import { printComponent } from '@/utils/printUtils';
import ReactDOMServer from 'react-dom/server';

interface ComprehensivePrintDialogProps {
  memorization?: {
    schedule: any[];
    component: React.ComponentType<{ schedule: any[]; title: string }>;
  };
  murajah?: {
    schedule: any[];
    component: React.ComponentType<{ schedule: any[]; title: string }>;
  };
  todaysMurajah?: {
    data: any;
    component: React.ComponentType<{ data: any; title: string }>;
  };
}

export const ComprehensivePrintDialog: React.FC<ComprehensivePrintDialogProps> = ({
  memorization,
  murajah,
  todaysMurajah
}) => {
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printTimeframe, setPrintTimeframe] = useState('7');
  const [includeMemorization, setIncludeMemorization] = useState(!!memorization);
  const [includeMurajah, setIncludeMurajah] = useState(!!murajah);
  const [includeTodaysMurajah, setIncludeTodaysMurajah] = useState(!!todaysMurajah);

  const getFilteredSchedule = (schedule: any[], days: number) => {
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
    const timeframeText = days === 7 ? 'Next 7 Days' : 
                         days === 30 ? 'Next 30 Days' : 
                         days === 180 ? 'Next 6 Months' : `Next ${days} Days`;
    
    let combinedHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
            Comprehensive Islamic Schedule - ${timeframeText}
          </h1>
          <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    if (includeMemorization && memorization) {
      const filteredSchedule = getFilteredSchedule(memorization.schedule, days);
      const MemorizationComponent = memorization.component;
      const componentHTML = ReactDOMServer.renderToStaticMarkup(
        <MemorizationComponent schedule={filteredSchedule} title={`Memorization Schedule - ${timeframeText}`} />
      );
      combinedHTML += `<div style="margin-bottom: 40px;">${componentHTML}</div>`;
    }

    if (includeMurajah && murajah) {
      const filteredSchedule = getFilteredSchedule(murajah.schedule, days);
      const MurajahComponent = murajah.component;
      const componentHTML = ReactDOMServer.renderToStaticMarkup(
        <MurajahComponent schedule={filteredSchedule} title={`Murajah Schedule - ${timeframeText}`} />
      );
      combinedHTML += `<div style="margin-bottom: 40px;">${componentHTML}</div>`;
    }

    if (includeTodaysMurajah && todaysMurajah) {
      const TodayComponent = todaysMurajah.component;
      const componentHTML = ReactDOMServer.renderToStaticMarkup(
        <TodayComponent data={todaysMurajah.data} title="Today's Murajah Tasks" />
      );
      combinedHTML += `<div style="margin-bottom: 40px;">${componentHTML}</div>`;
    }

    combinedHTML += '</div>';

    printComponent(combinedHTML, `Islamic Schedule - ${timeframeText}`);
    setPrintDialogOpen(false);
  };

  return (
    <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Print Islamic Schedule</DialogTitle>
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
          
          <div className="space-y-3">
            <Label>Include in print:</Label>
            {memorization && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={includeMemorization} 
                  onCheckedChange={(checked) => setIncludeMemorization(checked === true)}
                  id="memorization"
                />
                <Label htmlFor="memorization">Memorization Schedule</Label>
              </div>
            )}
            {murajah && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={includeMurajah} 
                  onCheckedChange={(checked) => setIncludeMurajah(checked === true)}
                  id="murajah"
                />
                <Label htmlFor="murajah">Murajah Review Schedule</Label>
              </div>
            )}
            {todaysMurajah && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={includeTodaysMurajah} 
                  onCheckedChange={(checked) => setIncludeTodaysMurajah(checked === true)}
                  id="todays-murajah"
                />
                <Label htmlFor="todays-murajah">Today's Murajah Tasks</Label>
              </div>
            )}
          </div>

          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Print Selected Schedules
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
