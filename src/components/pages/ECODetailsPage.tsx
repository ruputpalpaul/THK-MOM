import { useMemo } from 'react';
import { ECO, WorkOrder } from '../../types/green-room';
import { documents, components, machineSettings } from '../../data/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, 
  FileText, 
  Package,
  Settings,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { useAlerts } from '@/providers/AlertProvider';
import { AlertCard } from '../alerts/AlertCard';

interface ECODetailsPageProps {
  eco: ECO;
  workOrders: WorkOrder[];
  onBack: () => void;
  onCreateWorkOrder?: (eco: ECO) => void;
}

export function ECODetailsPage({ eco, workOrders, onBack, onCreateWorkOrder }: ECODetailsPageProps) {
  // Get related data
  const impactedDocs = eco.impactedDocuments 
    ? documents.filter(d => eco.impactedDocuments?.includes(d.id))
    : [];
  
  const impactedComps = eco.impactedComponents
    ? components.filter(c => eco.impactedComponents?.includes(c.id))
    : [];
  
  const impactedSettingsData = eco.impactedSettings
    ? machineSettings.filter(s => eco.impactedSettings?.includes(s.id))
    : [];

  const relatedWOs = workOrders.filter(wo => 
    wo.linkedEventId === eco.id || wo.description.includes(eco.number)
  );

  const modSheet = eco.modSheet;
  const { alerts } = useAlerts();
  const ecoAlerts = useMemo(
    () => alerts.filter(alert => alert.relatedEcos?.includes(eco.id)),
    [alerts, eco.id],
  );

  const boolToLabel = (value?: boolean) => (value ? 'Yes' : 'No');

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-medium text-foreground whitespace-pre-wrap">{value && value.length > 0 ? value : '—'}</span>
    </div>
  );

  const handleGenerateReport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (y + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, contentWidth - indent);
      lines.forEach((line: string) => {
        checkPageBreak(fontSize * 0.5);
        pdf.text(line, margin + indent, y);
        y += fontSize * 0.5;
      });
    };

    // Header
    pdf.setFillColor(3, 2, 19);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ENGINEERING CHANGE ORDER', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Change Report', pageWidth / 2, 25, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('THK-MOM Manufacturing Overview Model', pageWidth / 2, 33, { align: 'center' });

    y = 50;
    pdf.setTextColor(0, 0, 0);

    // ECO Information Box
    pdf.setFillColor(240, 240, 245);
    pdf.rect(margin, y, contentWidth, 65, 'F');
    y += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ECO Information', margin + 5, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const infoItems = [
      ['ECO Number:', eco.number],
      ['Title:', eco.title],
      ['Machine:', eco.machineName],
      ['Type:', eco.type],
      ['Status:', eco.status.toUpperCase()],
      ['Reason:', eco.reason.toUpperCase()],
      ['Submitted:', eco.date],
      ...(eco.effectiveFrom ? [['Effective From:', eco.effectiveFrom]] : []),
      ['Requested By:', eco.requestedBy || 'N/A']
    ];

    infoItems.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, margin + 5, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, margin + 50, y);
      y += 6;
    });

    y += 5;

    // Description Section
    checkPageBreak(20);
    pdf.setFillColor(3, 2, 19);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIPTION', margin + 3, y + 6);
    y += 12;
    pdf.setTextColor(0, 0, 0);

    addText(eco.description, 10, false);
    y += 5;

    // Approvers Section
    if (eco.approvers && eco.approvers.length > 0) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('APPROVAL FLOW', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      eco.approvers.forEach((approver, idx) => {
        checkPageBreak(10);
        addText(`${idx + 1}. ${approver}`, 10, false, 3);
      });
      y += 5;
    }

    // Impacted Items Section
    const totalImpacted = impactedDocs.length + impactedComps.length + impactedSettingsData.length;
    if (totalImpacted > 0) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPACTED ITEMS', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      if (impactedDocs.length > 0) {
        addText(`Documents (${impactedDocs.length}):`, 10, true);
        impactedDocs.forEach((doc, idx) => {
          checkPageBreak(15);
          addText(`${idx + 1}. ${doc.name}`, 10, false, 5);
          addText(`Type: ${doc.type}, Version: ${doc.version || 'N/A'}`, 9, false, 10);
        });
        y += 3;
      }

      if (impactedComps.length > 0) {
        addText(`Components (${impactedComps.length}):`, 10, true);
        impactedComps.forEach((comp, idx) => {
          checkPageBreak(20);
          addText(`${idx + 1}. ${comp.name}`, 10, false, 5);
          addText(`Type: ${comp.type}, Criticality: ${comp.criticality}`, 9, false, 10);
          if (comp.vendor) addText(`Vendor: ${comp.vendor}`, 9, false, 10);
          if (comp.partNumber) addText(`Part #: ${comp.partNumber}`, 9, false, 10);
        });
        y += 3;
      }

      if (impactedSettingsData.length > 0) {
        addText(`Settings (${impactedSettingsData.length}):`, 10, true);
        impactedSettingsData.forEach((setting, idx) => {
          checkPageBreak(15);
          addText(`${idx + 1}. ${setting.key}: ${setting.value} ${setting.unit || ''}`, 10, false, 5);
          addText(`Category: ${setting.category}`, 9, false, 10);
        });
        y += 3;
      }
      y += 2;
    }

    // Associated Parts Section
    if (eco.partsAssociated && eco.partsAssociated.length > 0) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ASSOCIATED PARTS', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      eco.partsAssociated.forEach((part, idx) => {
        checkPageBreak(10);
        addText(`${idx + 1}. ${part.partNumber} - Qty: ${part.qty}`, 10, false, 3);
      });
      y += 5;
    }

    // Related Work Orders Section
    if (relatedWOs.length > 0) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATED WORK ORDERS', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      relatedWOs.forEach((wo, idx) => {
        checkPageBreak(20);
        addText(`${idx + 1}. ${wo.id} - ${wo.description}`, 10, false, 3);
        addText(`Status: ${wo.status}, Priority: ${wo.priority}`, 9, false, 8);
        addText(`Assignee: ${wo.assignee}, Due: ${wo.dueDate}`, 9, false, 8);
      });
      y += 5;
    }

    // Rollback Plan Section
    if (eco.rollbackPlan) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ROLLBACK PLAN', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      addText(eco.rollbackPlan, 10, false);
      y += 5;
    }

    // Attachments Section
    if (eco.attachments && eco.attachments.length > 0) {
      checkPageBreak(20);
      pdf.setFillColor(3, 2, 19);
      pdf.rect(margin, y, contentWidth, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ATTACHMENTS', margin + 3, y + 6);
      y += 12;
      pdf.setTextColor(0, 0, 0);

      eco.attachments.forEach((attachment, idx) => {
        checkPageBreak(10);
        addText(`${idx + 1}. ${attachment}`, 10, false, 3);
      });
      y += 5;
    }

    // Footer on each page
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated: ${new Date().toLocaleString()} | THK-MOM System | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    pdf.save(`${eco.number}_Change_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    toast.success('PDF report generated successfully', {
      description: `${eco.number} report has been downloaded`
    });
  };

  const getStatusBadge = (status: ECO['status']) => {
    const variants: Record<ECO['status'], string> = {
      draft: 'outline',
  review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
      effective: 'default',
      closed: 'secondary'
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: ECO['type']) => {
    const variants: Record<ECO['type'], string> = {
  Software: 'bg-blue-100 text-blue-800 border-blue-200',
  Hardware: 'bg-purple-100 text-purple-800 border-purple-200',
  Process: 'bg-green-100 text-green-800 border-green-200',
  Documentation: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return <Badge className={variants[type]}>{type}</Badge>;
  };

  const getReasonBadge = (reason: ECO['reason']) => {
    type BadgeVariant = import('class-variance-authority').VariantProps<typeof import('../ui/badge-variants').badgeVariants>['variant'];
    const variants: Record<ECO['reason'], BadgeVariant> = {
      safety: 'destructive',
      quality: 'secondary',
      cost: 'outline',
      capacity: 'default'
    };
    return <Badge variant={variants[reason]}>{reason.toUpperCase()}</Badge>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background p-4">
        <div className="space-y-4">
          {/* Back button and title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* ECO Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{eco.number}</h1>
              {getStatusBadge(eco.status)}
              {getTypeBadge(eco.type)}
              {getReasonBadge(eco.reason)}
            </div>
            
            <h3>{eco.title}</h3>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Machine: <span className="text-foreground">{eco.machineName}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Requested by: <span className="text-foreground">{eco.requestedBy || 'N/A'}</span></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Submitted: <span className="text-foreground">{eco.date}</span></span>
              </div>
            </div>
          </div>

          {ecoAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
              <div className="space-y-2">
                {ecoAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            {eco.status === 'review' && (
              <>
                <Button size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve ECO
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject ECO
                </Button>
              </>
            )}
            {eco.status === 'approved' && (
              <Button size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Effective
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Change Report
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
              <TabsTrigger value="impacted">
                Impacted Items
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(impactedDocs.length + impactedComps.length + impactedSettingsData.length)}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approval">Approval Flow</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="attachments">
                Attachments
                <Badge variant="secondary" className="ml-2 text-xs">
                  {eco.attachments?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="modsheet">Mod Sheet</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4">Description</h3>
                <p className="text-muted-foreground">{eco.description}</p>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="mb-4">ECO Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">ECO Number:</span>
                      <span>{eco.number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">Type:</span>
                      {getTypeBadge(eco.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">Status:</span>
                      {getStatusBadge(eco.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">Reason:</span>
                      {getReasonBadge(eco.reason)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">Submitted:</span>
                      <span>{eco.date}</span>
                    </div>
                    {eco.effectiveFrom && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-32">Effective From:</span>
                        <span>{eco.effectiveFrom}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-32">Requested by:</span>
                      <span>{eco.requestedBy || 'N/A'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4">Impact Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Impacted Documents</span>
                      </div>
                      <Badge variant="secondary">{impactedDocs.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Impacted Components</span>
                      </div>
                      <Badge variant="secondary">{impactedComps.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Impacted Settings</span>
                      </div>
                      <Badge variant="secondary">{impactedSettingsData.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Related Work Orders</span>
                      </div>
                      <Badge variant="secondary">{relatedWOs.length}</Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {eco.rollbackPlan && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3>Rollback Plan</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{eco.rollbackPlan}</p>
                </Card>
              )}

              {eco.partsAssociated && eco.partsAssociated.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4">Associated Parts</h3>
                  <div className="space-y-2">
                    {eco.partsAssociated.map((part, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                        <span>{part.partNumber}</span>
                        <Badge variant="outline">Qty: {part.qty}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="modsheet" className="space-y-6">
              {modSheet ? (
                <>
                  <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Requestor Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Receipt No." value={modSheet.request.receiptNumber} />
                      <InfoRow label="Date" value={modSheet.request.date} />
                      <InfoRow label="Machine Name" value={modSheet.request.machineName} />
                      <InfoRow label="Machine No." value={modSheet.request.machineNumber} />
                      <InfoRow label="Park Link Rail Modification" value={boolToLabel(modSheet.request.parkLinkRailModification)} />
                      <InfoRow label="Control Plan Update" value={boolToLabel(modSheet.request.controlPlanUpdate)} />
                      <InfoRow label="PFMEA Update" value={boolToLabel(modSheet.request.pfmeaUpdate)} />
                      <InfoRow label="Requested Due Date" value={modSheet.request.requestedDueDate} />
                      <InfoRow label="Requested By" value={modSheet.request.requestedBy} />
                      <InfoRow label="Confirmed By" value={modSheet.request.confirmedBy} />
                    </div>
                  </Card>

                  <Card className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Mechanical</h3>
                        <InfoRow label="Description" value={modSheet.engineering.mechanical.description} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoRow label="Print Number" value={modSheet.engineering.mechanical.printNumber} />
                          <InfoRow label="Design Location" value={modSheet.engineering.mechanical.designLocation} />
                          <InfoRow label="Install Location" value={modSheet.engineering.mechanical.installLocation} />
                          <InfoRow label="Test Type" value={modSheet.engineering.mechanical.testType} />
                          <InfoRow label="Consumables / Software" value={modSheet.engineering.mechanical.consumablesOrSoftware} />
                          <InfoRow label="Component Cost" value={modSheet.engineering.mechanical.componentCost} />
                          <InfoRow label="Notes" value={modSheet.engineering.mechanical.additionalNotes} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Electrical</h3>
                        <InfoRow label="Description" value={modSheet.engineering.electrical.description} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InfoRow label="Print Number" value={modSheet.engineering.electrical.printNumber} />
                          <InfoRow label="Design Location" value={modSheet.engineering.electrical.designLocation} />
                          <InfoRow label="Install Location" value={modSheet.engineering.electrical.installLocation} />
                          <InfoRow label="Test Type" value={modSheet.engineering.electrical.testType} />
                          <InfoRow label="PLC / Backup" value={modSheet.engineering.electrical.consumablesOrSoftware} />
                          <InfoRow label="Component Cost" value={modSheet.engineering.electrical.componentCost} />
                          <InfoRow label="Notes" value={modSheet.engineering.electrical.additionalNotes} />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <InfoRow label="Documentation / Notes" value={modSheet.engineering.documentationNotes} />
                      <InfoRow label="Total Cost" value={modSheet.engineering.totalCost} />
                      <InfoRow label="Hours" value={modSheet.engineering.hours} />
                    </div>
                  </Card>

                  <Card className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold">Approvals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoRow label="Prepared By" value={modSheet.approvals?.preparedBy} />
                      <InfoRow label="Confirmed By" value={modSheet.approvals?.confirmedBy} />
                      <InfoRow label="Checked By" value={modSheet.approvals?.checkedBy} />
                      <InfoRow label="Engineer" value={modSheet.approvals?.engineer} />
                      <InfoRow label="Engineer Date" value={modSheet.approvals?.engineerDate} />
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No mod sheet details captured for this ECO.</p>
                </Card>
              )}
            </TabsContent>

            {/* Impacted Items Tab */}
            <TabsContent value="impacted" className="space-y-6">
              {impactedDocs.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Impacted Documents ({impactedDocs.length})
                  </h3>
                  <div className="space-y-2">
                    {impactedDocs.map((doc) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{doc.name}</h4>
                              <Badge variant="outline">{doc.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Version: {doc.version || 'N/A'}</span>
                              <span>Uploaded: {doc.uploadDate}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {impactedComps.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Impacted Components ({impactedComps.length})
                  </h3>
                  <div className="space-y-2">
                    {impactedComps.map((comp) => (
                      <Card key={comp.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{comp.name}</h4>
                              <Badge variant="outline">{comp.type}</Badge>
                              <Badge variant={comp.criticality >= 4 ? 'destructive' : 'secondary'}>
                                Criticality {comp.criticality}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {comp.vendor && <span>Vendor: {comp.vendor}</span>}
                              {comp.partNumber && <span>P/N: {comp.partNumber}</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {impactedSettingsData.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Impacted Settings ({impactedSettingsData.length})
                  </h3>
                  <div className="space-y-2">
                    {impactedSettingsData.map((setting) => (
                      <Card key={setting.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{setting.key}</h4>
                              <Badge variant="outline">{setting.category}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Value:</span>
                              <span>{setting.value} {setting.unit}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {impactedDocs.length === 0 && impactedComps.length === 0 && impactedSettingsData.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No impacted items specified for this ECO.</p>
                </Card>
              )}
            </TabsContent>

            {/* Approval Flow Tab */}
            <TabsContent value="approval" className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4">Approval Status</h3>
                {eco.approvers && eco.approvers.length > 0 ? (
                  <div className="space-y-3">
                    {eco.approvers.map((approver, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p>{approver}</p>
                            <p className="text-sm text-muted-foreground">Pending Review</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No approvers assigned yet.</p>
                )}
              </Card>
            </TabsContent>

            {/* Implementation Tab */}
            <TabsContent value="implementation" className="space-y-6">
              {relatedWOs.length > 0 ? (
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Related Work Orders ({relatedWOs.length})
                  </h3>
                  <div className="space-y-2">
                    {relatedWOs.map((wo) => (
                      <Card key={wo.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4>{wo.id}</h4>
                              <Badge variant="outline">{wo.type}</Badge>
                              <Badge variant={wo.priority === 'critical' || wo.priority === 'high' ? 'destructive' : 'secondary'}>
                                {wo.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{wo.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Assignee: {wo.assignee}</span>
                              <span>Due: {wo.dueDate}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No work orders created for this ECO yet.</p>
                  <Button onClick={() => onCreateWorkOrder?.(eco)}>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Create Implementation Work Order
                  </Button>
                </Card>
              )}
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-6">
              {eco.attachments && eco.attachments.length > 0 ? (
                <Card className="p-6">
                  <div className="space-y-2">
                    {eco.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span>{attachment}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No attachments uploaded for this ECO.</p>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Attachment
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
