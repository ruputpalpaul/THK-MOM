import { WorkOrder } from '../../types/green-room';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, ClipboardList, Calendar, User, AlertTriangle, CheckCircle2, Clock, FileText, Paperclip, Link2, Download, Package, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface WorkOrderDetailsPageProps {
  workOrder: WorkOrder;
  onBack: () => void;
}

export function WorkOrderDetailsPage({ workOrder, onBack }: WorkOrderDetailsPageProps) {

  const getStatusColor = (_status: WorkOrder['status']) => 'bg-muted text-foreground border-border';

  const getPriorityColor = (priority: WorkOrder['priority']) =>
    priority === 'critical' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-muted text-foreground border-border';

  const getTypeColor = (_type: WorkOrder['type']) => 'bg-muted text-foreground border-border';

  const generatePDFReport = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4));
    };

    // Helper to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Order Report', margin, yPos);
    yPos += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Work Order Header
    doc.setFillColor(240, 240, 245);
    doc.rect(margin, yPos - 5, contentWidth, 40, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(workOrder.id, margin + 5, yPos + 3);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${workOrder.status.toUpperCase().replace('-', ' ')}`, margin + 5, yPos + 10);
    doc.text(`Priority: ${workOrder.priority.toUpperCase()}`, margin + 5, yPos + 16);
    doc.text(`Type: ${workOrder.type}`, margin + 5, yPos + 22);
    doc.text(`Machine: ${workOrder.machineName}`, margin + 5, yPos + 28);
    
    yPos += 50;

    // Description Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos = addText(workOrder.description, margin, yPos, contentWidth);
    yPos += 10;

    // Work Order Details
    checkNewPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Order Details', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      ['Work Order ID:', workOrder.id],
      ['Machine:', workOrder.machineName],
      ['Type:', workOrder.type],
      ['Priority:', workOrder.priority],
      ['Status:', workOrder.status.replace('-', ' ')],
      ['Due Date:', new Date(workOrder.dueDate).toLocaleDateString()],
      ['Requested By:', workOrder.requestedBy || 'N/A'],
      ['Assignee:', workOrder.assignee || 'Unassigned'],
    ];

    if (workOrder.completedDate) {
      details.push(['Completed Date:', new Date(workOrder.completedDate).toLocaleDateString()]);
    }
    if (workOrder.verifiedBy) {
      details.push(['Verified By:', workOrder.verifiedBy]);
    }
    if (workOrder.laborHours) {
      details.push(['Labor Hours:', `${workOrder.laborHours} hours`]);
    }

    details.forEach(([label, value]) => {
      checkNewPage(8);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Tasks Section
    if (workOrder.tasks && workOrder.tasks.length > 0) {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Checklist', margin, yPos);
      yPos += 7;

      const passCount = workOrder.tasks.filter(t => t.status === 'pass').length;
      const failCount = workOrder.tasks.filter(t => t.status === 'fail').length;
      const pendingCount = workOrder.tasks.filter(t => t.status === 'pending').length;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Tasks: ${workOrder.tasks.length} | Passed: ${passCount} | Failed: ${failCount} | Pending: ${pendingCount}`, margin, yPos);
      yPos += 10;

      workOrder.tasks.forEach((task, index) => {
        checkNewPage(20);
        
        // Task number and status indicator
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        // Status indicator
        if (task.status === 'pass') {
          doc.setFillColor(34, 197, 94);
          doc.circle(margin + 2, yPos - 1, 1.5, 'F');
        } else if (task.status === 'fail') {
          doc.setFillColor(239, 68, 68);
          doc.circle(margin + 2, yPos - 1, 1.5, 'F');
        } else {
          doc.setFillColor(234, 179, 8);
          doc.circle(margin + 2, yPos - 1, 1.5, 'F');
        }

        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}.`, margin + 6, yPos);
        
        doc.setFont('helvetica', 'normal');
        const taskText = task.description;
        const taskLines = doc.splitTextToSize(taskText, contentWidth - 15);
        doc.text(taskLines, margin + 12, yPos);
        yPos += taskLines.length * 4;

        if (task.notes) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Note: ' + task.notes, margin + 12, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 4;
        }

        doc.setFontSize(9);
        yPos += 3;
      });

      yPos += 5;
    }

    // Parts Used Section
    if (workOrder.partsUsed && workOrder.partsUsed.length > 0) {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Parts Used', margin, yPos);
      yPos += 10;

      // Table header
      doc.setFillColor(240, 240, 245);
      doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Part Number', margin + 2, yPos);
      doc.text('Qty', margin + 80, yPos);
      doc.text('Lot', margin + 110, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      workOrder.partsUsed.forEach((part) => {
        checkNewPage(8);
        doc.text(part.partNumber, margin + 2, yPos);
        doc.text(String(part.qty), margin + 80, yPos);
        doc.text(part.lot || 'N/A', margin + 110, yPos);
        yPos += 6;
      });

      yPos += 5;
    }

    // Evidence Section
    if (workOrder.evidence && workOrder.evidence.length > 0) {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Evidence & Attachments', margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      workOrder.evidence.forEach((item, index) => {
        checkNewPage(8);
        doc.text(`${index + 1}. ${item}`, margin + 2, yPos);
        yPos += 6;
      });

      yPos += 5;
    }

    // Linked Items Section
    if (workOrder.linkedEventId || workOrder.linkedComponentId || workOrder.rcaId) {
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Linked Items', margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      if (workOrder.linkedEventId) {
        doc.text(`Linked Event: ${workOrder.linkedEventId}`, margin + 2, yPos);
        yPos += 6;
      }
      if (workOrder.linkedComponentId) {
        doc.text(`Linked Component: ${workOrder.linkedComponentId}`, margin + 2, yPos);
        yPos += 6;
      }
      if (workOrder.rcaId) {
        doc.text(`Root Cause Analysis: ${workOrder.rcaId}`, margin + 2, yPos);
        yPos += 6;
      }
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'THK-MOM - Manufacturing Overview Model',
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.setTextColor(0, 0, 0);
    }

    // Save the PDF
    doc.save(`Work_Order_${workOrder.id}_Report.pdf`);
    toast.success('PDF report generated successfully');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background p-4">
        <div className="space-y-4">
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2 text-muted-foreground" />
              Back to Dashboard
            </Button>
          </div>

          {/* Work Order Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{workOrder.id}</h1>
              <Badge variant="outline" className={getStatusColor(workOrder.status)}>
                {workOrder.status === 'in-progress' ? 'IN PROGRESS' : 
                 workOrder.status === 'awaiting-parts' ? 'AWAITING PARTS' :
                 workOrder.status.toUpperCase().replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
                {workOrder.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={getTypeColor(workOrder.type)}>
                {workOrder.type}
              </Badge>
            </div>
            
            <h3>{workOrder.description}</h3>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Machine: <span className="text-foreground">{workOrder.machineName}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Assignee: <span className="text-foreground">{workOrder.assignee || 'Unassigned'}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Due: <span className="text-foreground">{new Date(workOrder.dueDate).toLocaleDateString()}</span></span>
              </div>
              {workOrder.requestedBy && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Requested by: <span className="text-foreground">{workOrder.requestedBy}</span></span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {workOrder.status === 'open' && (
              <Button size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Start Work
              </Button>
            )}
            {workOrder.status === 'in-progress' && (
              <>
                <Button size="sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Work Order
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Log Time
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={generatePDFReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Add Notes
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks
                {workOrder.tasks && workOrder.tasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {workOrder.tasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
                <TabsTrigger value="parts">
                  Parts Used
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {workOrder.partsUsed.length}
                  </Badge>
                </TabsTrigger>
              )}
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="related">Related Items</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4">Work Order Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p>{workOrder.description}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Work Order ID</p>
                    <p>{workOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p>{workOrder.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <p className="capitalize">{workOrder.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="capitalize">{workOrder.status.replace('-', ' ')}</p>
                  </div>
                </div>
                {workOrder.laborHours && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Labor Hours</p>
                      <p>{workOrder.laborHours} hours</p>
                    </div>
                  </>
                )}
                {workOrder.completedDate && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Completed Date</p>
                        <p>{new Date(workOrder.completedDate).toLocaleDateString()}</p>
                      </div>
                      {workOrder.verifiedBy && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Verified By</p>
                          <p>{workOrder.verifiedBy}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {workOrder.evidence && workOrder.evidence.length > 0 && (
              <Card className="p-6">
                <h3 className="mb-4">Evidence</h3>
                <div className="space-y-2">
                  {workOrder.evidence.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              {workOrder.tasks && workOrder.tasks.length > 0 ? (
                workOrder.tasks.map((task, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {task.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {task.status === 'fail' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                          {task.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                          <h4>{task.description}</h4>
                        </div>
                        {task.notes && (
                          <p className="text-muted-foreground mt-2">{task.notes}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        task.status === 'pass' ? 'bg-green-100 text-green-700 border-green-200' :
                        task.status === 'fail' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No Tasks</h3>
                  <p className="text-muted-foreground">No tasks have been added to this work order yet.</p>
                </Card>
              )}
            </TabsContent>

            {/* Parts Used Tab */}
            <TabsContent value="parts">
              {workOrder.partsUsed && workOrder.partsUsed.length > 0 ? (
                <div className="space-y-4">
                  {workOrder.partsUsed.map((part, index) => (
                    <Card key={index} className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Part Number</p>
                          <p>{part.partNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                          <p>{part.qty}</p>
                        </div>
                        {part.lot && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Lot</p>
                            <p>{part.lot}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Paperclip className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No Parts Used</h3>
                  <p className="text-muted-foreground">No parts have been recorded for this work order.</p>
                </Card>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="mb-1">Work order created</p>
                      <p className="text-xs text-muted-foreground">By {workOrder.requestedBy || 'Unknown'}</p>
                    </div>
                  </div>

                  {workOrder.assignee && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="mb-1">Assigned to {workOrder.assignee}</p>
                        <p className="text-xs text-muted-foreground">Status changed to {workOrder.status}</p>
                      </div>
                    </div>
                  )}

                  {workOrder.completedDate && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="mb-1">Work order completed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(workOrder.completedDate).toLocaleDateString()}
                          {workOrder.verifiedBy && ` • Verified by ${workOrder.verifiedBy}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Related Items Tab */}
            <TabsContent value="related" className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4">Linked Items</h3>
                <div className="space-y-4">
                  {workOrder.linkedEventId && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">Linked Event</p>
                        <p className="text-xs text-muted-foreground">{workOrder.linkedEventId}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {workOrder.linkedComponentId && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">Linked Component</p>
                        <p className="text-xs text-muted-foreground">{workOrder.linkedComponentId}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {workOrder.rcaId && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">Root Cause Analysis</p>
                        <p className="text-xs text-muted-foreground">{workOrder.rcaId}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {!workOrder.linkedEventId && !workOrder.linkedComponentId && !workOrder.rcaId && (
                    <div className="text-center py-8">
                      <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No linked items</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
