
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ResumeGenerator from '@/components/ResumeGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [bulkCount, setBulkCount] = useState(1);

  // Show dialog on initial load
  useEffect(() => {
    setShowDialog(true);
  }, []);

  // Handle dialog submission
  const handleSubmit = () => {
    setShowDialog(false);
  };

  return (
    <Layout>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Generation Options</DialogTitle>
            <DialogDescription>
              Choose how many random resumes you'd like to generate (max 15).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resume-count" className="text-right">
                Number
              </Label>
              <Input
                id="resume-count"
                type="number"
                min={1}
                max={15}
                value={bulkCount}
                onChange={(e) => setBulkCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              Generate {bulkCount > 1 ? `${bulkCount} Resumes` : 'Resume'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ResumeGenerator initialBulkCount={bulkCount} />
    </Layout>
  );
};

export default Index;
