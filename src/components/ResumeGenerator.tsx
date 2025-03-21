
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import PrimaryButton from './PrimaryButton';
import ResumePreview from './ResumePreview';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchRandomUserData, generatePdf, ResumeData } from '@/utils/resumeGenerator';

interface ResumeGeneratorProps {
  initialBulkCount?: number;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ initialBulkCount = 1 }) => {
  const { toast } = useToast();
  const [resumeList, setResumeList] = useState<ResumeData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [bulkCount, setBulkCount] = useState(initialBulkCount);

  // Update bulk count when initialBulkCount prop changes
  useEffect(() => {
    setBulkCount(initialBulkCount);
  }, [initialBulkCount]);

  const generateResumes = async () => {
    try {
      setIsLoading(true);
      setResumeList([]);
      setCurrentIndex(0);
      
      const count = Math.min(15, Math.max(1, bulkCount));
      const newResumes: ResumeData[] = [];
      
      // Generate resumes sequentially
      for (let i = 0; i < count; i++) {
        const data = await fetchRandomUserData();
        newResumes.push(data);
        
        // Update the list as each resume is generated
        setResumeList(prev => [...prev, data]);
      }
      
    } catch (error) {
      console.error('Error generating resumes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate resumes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCurrentPdf = async () => {
    if (resumeList.length === 0) return;
    
    try {
      setIsPdfGenerating(true);
      await generatePdf('resume-preview', `${resumeList[currentIndex].name.replace(/\s+/g, '_')}_Resume`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const downloadAllPdfs = async () => {
    if (resumeList.length === 0) return;
    
    try {
      setIsPdfGenerating(true);
      toast({
        title: 'Bulk Download',
        description: 'Preparing to download all resumes as PDFs...',
      });
      
      // Download each resume sequentially
      for (let i = 0; i < resumeList.length; i++) {
        setCurrentIndex(i);
        // Small delay to ensure the component renders before capture
        await new Promise(resolve => setTimeout(resolve, 500));
        await generatePdf('resume-preview', `${resumeList[i].name.replace(/\s+/g, '_')}_Resume`);
      }
      
      toast({
        title: 'Success',
        description: `All ${resumeList.length} PDFs have been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading PDFs:', error);
      toast({
        title: 'Error',
        description: 'Failed to download all PDFs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const navigateResume = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else {
      setCurrentIndex(prev => (prev < resumeList.length - 1 ? prev + 1 : prev));
    }
  };

  const currentResumeData = resumeList[currentIndex];

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="font-bold tracking-tight animate-slide-down">
          Resume Generator
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto animate-slide-down">
          Generate {bulkCount > 1 ? `up to ${bulkCount}` : 'a'} professional, beautifully designed 
          {bulkCount > 1 ? ' resumes' : ' resume'} with random data in seconds. 
          Perfect for testing resume templates or seeing different layout options.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
        <PrimaryButton 
          onClick={generateResumes} 
          loading={isLoading}
          disabled={isLoading || isPdfGenerating}
          className="w-full sm:w-auto"
        >
          {resumeList.length > 0 ? 'Generate New Resumes' : `Generate ${bulkCount > 1 ? bulkCount : ''} Random Resume${bulkCount > 1 ? 's' : ''}`}
        </PrimaryButton>
        
        {resumeList.length > 0 && (
          <>
            <PrimaryButton 
              onClick={downloadCurrentPdf} 
              loading={isPdfGenerating}
              disabled={isPdfGenerating}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Download Current PDF
            </PrimaryButton>
            
            {resumeList.length > 1 && (
              <PrimaryButton 
                onClick={downloadAllPdfs} 
                loading={isPdfGenerating}
                disabled={isPdfGenerating}
                variant="subtle"
                className="w-full sm:w-auto"
              >
                Download All PDFs
              </PrimaryButton>
            )}
          </>
        )}
      </div>
      
      {resumeList.length > 0 ? (
        <div className="animate-fade-in mt-10">
          {resumeList.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PrimaryButton
                  onClick={() => navigateResume('prev')}
                  disabled={currentIndex === 0 || isPdfGenerating}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </PrimaryButton>
                
                <PrimaryButton
                  onClick={() => navigateResume('next')}
                  disabled={currentIndex === resumeList.length - 1 || isPdfGenerating}
                  size="sm"
                  variant="outline"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Resume {currentIndex + 1} of {resumeList.length}
              </div>
            </div>
          )}
          
          <ResumePreview data={currentResumeData} />
        </div>
      ) : (
        <div className="text-center p-12 bg-secondary/50 rounded-lg border border-border/50 backdrop-blur-sm animate-pulse-soft">
          <div className="max-w-sm mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground/50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-foreground">No {bulkCount > 1 ? 'resumes' : 'resume'} generated yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click the "Generate {bulkCount > 1 ? `${bulkCount} Resumes` : 'Random Resume'}" button above to create 
              {bulkCount > 1 ? ' beautiful resumes' : ' a beautiful resume'} with randomly generated data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGenerator;
