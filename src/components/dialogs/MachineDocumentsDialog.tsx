import { Machine, Document } from '../../types/green-room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { documents } from '../../data/mock-data';

interface MachineDocumentsDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MachineDocumentsDialog({ machine, open, onOpenChange }: MachineDocumentsDialogProps) {
  if (!machine) return null;

  const machineDocuments = documents.filter(doc => doc.machineId === machine.id);

  const getDocumentTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'Program Backup':
        return 'default';
      case 'Operator Manual':
        return 'secondary';
      case 'Drawings':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[90vw] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Documents - {machine.name}</DialogTitle>
          <DialogDescription>
            View and manage all documents for this machine including program backups, operator manuals, and drawings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 overflow-auto flex-1 min-h-0">
          {machineDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p>No documents found for this machine</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px]">Name</TableHead>
                  <TableHead className="min-w-[180px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Version</TableHead>
                  <TableHead className="min-w-[180px]">Upload Date</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="max-w-[400px]">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant={getDocumentTypeColor(doc.type)} className="whitespace-nowrap">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.version || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap">{doc.uploadDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
