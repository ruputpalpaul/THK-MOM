import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ModSheet } from '@/types/green-room';

export interface ModSheetFormProps {
  value: ModSheet;
  onChange: (next: ModSheet) => void;
}

const ensureSections = (modSheet: ModSheet): ModSheet => ({
  request: {
    receiptNumber: modSheet.request?.receiptNumber ?? '',
    date: modSheet.request?.date ?? '',
    machineName: modSheet.request?.machineName ?? '',
    machineNumber: modSheet.request?.machineNumber ?? '',
    parkLinkRailModification: modSheet.request?.parkLinkRailModification ?? false,
    controlPlanUpdate: modSheet.request?.controlPlanUpdate ?? false,
    pfmeaUpdate: modSheet.request?.pfmeaUpdate ?? false,
    requestedDueDate: modSheet.request?.requestedDueDate ?? '',
    requestedBy: modSheet.request?.requestedBy ?? '',
    confirmedBy: modSheet.request?.confirmedBy ?? '',
  },
  engineering: {
    mechanical: {
      description: modSheet.engineering?.mechanical?.description ?? '',
      printNumber: modSheet.engineering?.mechanical?.printNumber ?? '',
      designLocation: modSheet.engineering?.mechanical?.designLocation ?? '',
      installLocation: modSheet.engineering?.mechanical?.installLocation ?? '',
      testType: modSheet.engineering?.mechanical?.testType ?? '',
      consumablesOrSoftware: modSheet.engineering?.mechanical?.consumablesOrSoftware ?? '',
      componentCost: modSheet.engineering?.mechanical?.componentCost ?? '',
      additionalNotes: modSheet.engineering?.mechanical?.additionalNotes ?? '',
    },
    electrical: {
      description: modSheet.engineering?.electrical?.description ?? '',
      printNumber: modSheet.engineering?.electrical?.printNumber ?? '',
      designLocation: modSheet.engineering?.electrical?.designLocation ?? '',
      installLocation: modSheet.engineering?.electrical?.installLocation ?? '',
      testType: modSheet.engineering?.electrical?.testType ?? '',
      consumablesOrSoftware: modSheet.engineering?.electrical?.consumablesOrSoftware ?? '',
      componentCost: modSheet.engineering?.electrical?.componentCost ?? '',
      additionalNotes: modSheet.engineering?.electrical?.additionalNotes ?? '',
    },
    documentationNotes: modSheet.engineering?.documentationNotes ?? '',
    totalCost: modSheet.engineering?.totalCost ?? '',
    hours: modSheet.engineering?.hours ?? '',
  },
  approvals: {
    preparedBy: modSheet.approvals?.preparedBy ?? '',
    confirmedBy: modSheet.approvals?.confirmedBy ?? '',
    checkedBy: modSheet.approvals?.checkedBy ?? '',
    engineer: modSheet.approvals?.engineer ?? '',
    engineerDate: modSheet.approvals?.engineerDate ?? '',
  },
});

export function ModSheetForm({ value, onChange }: ModSheetFormProps) {
  useEffect(() => {
    onChange(ensureSections(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeValue = ensureSections(value);

  const update = (updater: (current: ModSheet) => ModSheet) => {
    onChange(updater(safeValue));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mechanical">Mechanical</TabsTrigger>
          <TabsTrigger value="electrical">Electrical</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Requestor Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="modsheet-receipt">Receipt No.</Label>
                <Input
                  id="modsheet-receipt"
                  value={safeValue.request.receiptNumber}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, receiptNumber: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-date">Date</Label>
                <Input
                  id="modsheet-date"
                  type="date"
                  value={safeValue.request.date}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, date: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-machine-name">Machine Name</Label>
                <Input
                  id="modsheet-machine-name"
                  value={safeValue.request.machineName}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, machineName: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-machine-number">Machine No.</Label>
                <Input
                  id="modsheet-machine-number"
                  value={safeValue.request.machineNumber}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, machineNumber: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label>Park Link Rail Modification</Label>
                <Select
                  value={safeValue.request.parkLinkRailModification ? 'yes' : 'no'}
                  onValueChange={value => update(prev => ({
                    ...prev,
                    request: { ...prev.request, parkLinkRailModification: value === 'yes' },
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Control Plan Update</Label>
                <Select
                  value={safeValue.request.controlPlanUpdate ? 'yes' : 'no'}
                  onValueChange={value => update(prev => ({
                    ...prev,
                    request: { ...prev.request, controlPlanUpdate: value === 'yes' },
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>PFMEA Update</Label>
                <Select
                  value={safeValue.request.pfmeaUpdate ? 'yes' : 'no'}
                  onValueChange={value => update(prev => ({
                    ...prev,
                    request: { ...prev.request, pfmeaUpdate: value === 'yes' },
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modsheet-requested-date">Requested Due Date</Label>
                <Input
                  id="modsheet-requested-date"
                  type="date"
                  value={safeValue.request.requestedDueDate}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, requestedDueDate: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-requested-by">Requested By</Label>
                <Input
                  id="modsheet-requested-by"
                  value={safeValue.request.requestedBy}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, requestedBy: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-confirmed-by">Confirmed By</Label>
                <Input
                  id="modsheet-confirmed-by"
                  value={safeValue.request.confirmedBy}
                  onChange={event => update(prev => ({
                    ...prev,
                    request: { ...prev.request, confirmedBy: event.target.value },
                  }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mechanical" className="mt-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Mechanical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="modsheet-mech-description">Mechanical Description</Label>
                <Textarea
                  id="modsheet-mech-description"
                  rows={4}
                  value={safeValue.engineering.mechanical.description}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, description: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-print">Print Number</Label>
                <Input
                  id="modsheet-mech-print"
                  value={safeValue.engineering.mechanical.printNumber}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, printNumber: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-design">Design Location</Label>
                <Input
                  id="modsheet-mech-design"
                  value={safeValue.engineering.mechanical.designLocation}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, designLocation: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-install">Install Location</Label>
                <Input
                  id="modsheet-mech-install"
                  value={safeValue.engineering.mechanical.installLocation}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, installLocation: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-test">Test Type</Label>
                <Input
                  id="modsheet-mech-test"
                  value={safeValue.engineering.mechanical.testType}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, testType: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-consumables">Consumables / Software</Label>
                <Input
                  id="modsheet-mech-consumables"
                  value={safeValue.engineering.mechanical.consumablesOrSoftware}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, consumablesOrSoftware: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-mech-cost">Component Cost</Label>
                <Input
                  id="modsheet-mech-cost"
                  value={safeValue.engineering.mechanical.componentCost}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, componentCost: event.target.value },
                    },
                  }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="modsheet-mech-notes">Additional Notes</Label>
                <Textarea
                  id="modsheet-mech-notes"
                  rows={3}
                  value={safeValue.engineering.mechanical.additionalNotes}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      mechanical: { ...prev.engineering.mechanical, additionalNotes: event.target.value },
                    },
                  }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="electrical" className="mt-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Electrical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="modsheet-elec-description">Electrical Description</Label>
                <Textarea
                  id="modsheet-elec-description"
                  rows={4}
                  value={safeValue.engineering.electrical.description}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, description: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-print">Print Number</Label>
                <Input
                  id="modsheet-elec-print"
                  value={safeValue.engineering.electrical.printNumber}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, printNumber: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-design">Design Location</Label>
                <Input
                  id="modsheet-elec-design"
                  value={safeValue.engineering.electrical.designLocation}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, designLocation: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-install">Install Location</Label>
                <Input
                  id="modsheet-elec-install"
                  value={safeValue.engineering.electrical.installLocation}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, installLocation: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-test">Test Type</Label>
                <Input
                  id="modsheet-elec-test"
                  value={safeValue.engineering.electrical.testType}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, testType: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-plc">PLC / Software Backup</Label>
                <Input
                  id="modsheet-elec-plc"
                  value={safeValue.engineering.electrical.consumablesOrSoftware}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, consumablesOrSoftware: event.target.value },
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-elec-cost">Component Cost</Label>
                <Input
                  id="modsheet-elec-cost"
                  value={safeValue.engineering.electrical.componentCost}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, componentCost: event.target.value },
                    },
                  }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="modsheet-elec-notes">Additional Notes</Label>
                <Textarea
                  id="modsheet-elec-notes"
                  rows={3}
                  value={safeValue.engineering.electrical.additionalNotes}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: {
                      ...prev.engineering,
                      electrical: { ...prev.engineering.electrical, additionalNotes: event.target.value },
                    },
                  }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Documentation & Totals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="modsheet-total-cost">Total Cost</Label>
                <Input
                  id="modsheet-total-cost"
                  value={safeValue.engineering.totalCost}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: { ...prev.engineering, totalCost: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-hours">Hours</Label>
                <Input
                  id="modsheet-hours"
                  value={safeValue.engineering.hours}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: { ...prev.engineering, hours: event.target.value },
                  }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="modsheet-docs">Related Documentation / Notes</Label>
                <Textarea
                  id="modsheet-docs"
                  rows={3}
                  value={safeValue.engineering.documentationNotes}
                  onChange={event => update(prev => ({
                    ...prev,
                    engineering: { ...prev.engineering, documentationNotes: event.target.value },
                  }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="modsheet-prepared-by">Prepared By</Label>
                <Input
                  id="modsheet-prepared-by"
                  value={safeValue.approvals?.preparedBy ?? ''}
                  onChange={event => update(prev => ({
                    ...prev,
                    approvals: { ...prev.approvals, preparedBy: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-confirmed-by-approver">Confirmed By</Label>
                <Input
                  id="modsheet-confirmed-by-approver"
                  value={safeValue.approvals?.confirmedBy ?? ''}
                  onChange={event => update(prev => ({
                    ...prev,
                    approvals: { ...prev.approvals, confirmedBy: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-checked-by">Checked By</Label>
                <Input
                  id="modsheet-checked-by"
                  value={safeValue.approvals?.checkedBy ?? ''}
                  onChange={event => update(prev => ({
                    ...prev,
                    approvals: { ...prev.approvals, checkedBy: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-engineer">Engineer</Label>
                <Input
                  id="modsheet-engineer"
                  value={safeValue.approvals?.engineer ?? ''}
                  onChange={event => update(prev => ({
                    ...prev,
                    approvals: { ...prev.approvals, engineer: event.target.value },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="modsheet-engineer-date">Engineer Date</Label>
                <Input
                  id="modsheet-engineer-date"
                  type="date"
                  value={safeValue.approvals?.engineerDate ?? ''}
                  onChange={event => update(prev => ({
                    ...prev,
                    approvals: { ...prev.approvals, engineerDate: event.target.value },
                  }))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
