import { ECO } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Calendar, User, AlertCircle } from 'lucide-react';

interface ECOsInReviewDialogProps {
  ecos: ECO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: (eco: ECO) => void;
}

export function ECOsInReviewDialog({ ecos, open, onOpenChange, onViewDetails }: ECOsInReviewDialogProps) {
  // Use neutral tokens for non-status types
  const getTypeColor = () => 'bg-muted text-foreground border-border';

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'safety': return 'destructive';
      case 'quality': return 'secondary';
      case 'cost': return 'outline';
      case 'capacity': return 'default';
      default: return 'outline';
    }
  };

  const getDaysInReview = (date: string) => {
    const ecoDate = new Date(date);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - ecoDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo;
  };

  const formatReviewDuration = (days: number) => {
    if (days === 0) return { text: 'Today', color: 'text-muted-foreground' };
    if (days === 1) return { text: '1 day ago', color: 'text-muted-foreground' };
    if (days <= 14) return { text: `${days} days ago`, color: 'text-muted-foreground' };
    if (days <= 30) return { text: `${days} days ago`, color: 'text-muted-foreground' };
    return { text: `${days} days ago`, color: 'text-red-600' };
  };

  // Sort by days in review (longest first)
  const sortedECOs = [...ecos].sort((a, b) => getDaysInReview(b.date) - getDaysInReview(a.date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Engineering Change Orders - In Review
          </DialogTitle>
          <DialogDescription>
            ECOs pending approval and implementation
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {sortedECOs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No ECOs in review.</p>
            </Card>
          ) : (
            sortedECOs.map((eco) => {
              const reviewDuration = formatReviewDuration(getDaysInReview(eco.date));
              const isStale = getDaysInReview(eco.date) > 14;
              
              return (
    <Card key={eco.id} className={`p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
      {isStale && <AlertCircle className="w-5 h-5 text-red-600" />}
                        <h4>{eco.number}</h4>
                        <Badge variant="secondary">{eco.machineName}</Badge>
      <Badge variant="secondary">
                          IN REVIEW
                        </Badge>
      <Badge className={getTypeColor()} variant="outline">
                          {eco.type}
                        </Badge>
                        {eco.reason && (
                          <Badge variant={getReasonColor(eco.reason)}>
                            {eco.reason.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-sm">{eco.title}</p>
                        {eco.description && (
                          <p className="text-sm text-muted-foreground mt-1">{eco.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Submitted:</span>
                          <span>{eco.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Requested by:</span>
                          <span>{eco.requestedBy}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">In review:</span>
                          <span className={reviewDuration.color}>{reviewDuration.text}</span>
                        </div>
                      </div>

                      {eco.approvers && eco.approvers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="text-muted-foreground">Pending approvers:</span>
                          {eco.approvers.map((approver, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {approver}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {(eco.impactedDocuments || eco.impactedComponents || eco.impactedSettings) && (
                        <div className="text-sm text-muted-foreground">
                          <span>Impacts: </span>
                          {eco.impactedDocuments && <span>{eco.impactedDocuments.length} document(s) • </span>}
                          {eco.impactedComponents && <span>{eco.impactedComponents.length} component(s) • </span>}
                          {eco.impactedSettings && <span>{eco.impactedSettings.length} setting(s)</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          onViewDetails?.(eco);
                          onOpenChange(false);
                        }}
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="default">
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {sortedECOs.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm">
                  {sortedECOs.filter(eco => eco.type === 'Software').length} Software • 
                  {sortedECOs.filter(eco => eco.type === 'Hardware').length} Hardware • 
                  {sortedECOs.filter(eco => eco.type === 'Process').length} Process
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-600">{sortedECOs.filter(eco => getDaysInReview(eco.date) > 30).length}</span> pending {'>'}30 days • 
                  <span className="text-red-600 ml-2">{sortedECOs.filter(eco => eco.reason === 'safety').length}</span> safety-related
                </p>
              </div>
              <Button>
                Export List
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
