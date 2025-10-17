import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Wrench, AlertTriangle, Server, ChevronRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Machine, WorkOrder, ECO } from '@/types/green-room';
import type { Document as MomDocument, Event as MomEvent } from '@/types/green-room';
import * as api from '@/utils/api';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'machine' | 'document' | 'workorder' | 'event' | 'eco';
  data: Machine | MomDocument | WorkOrder | MomEvent | ECO;
  matchedFields: string[];
}

interface GlobalSearchProps {
  onMachineSelect?: (machine: Machine) => void;
  onECOSelect?: (eco: ECO) => void;
  onWorkOrderSelect?: (workOrder: WorkOrder) => void;
}

export function GlobalSearch({ onMachineSelect, onECOSelect, onWorkOrderSelect }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  const performSearch = React.useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const [machines, documents, workOrders, events, ecos] = await Promise.all([
        api.getMachines(),
        api.getDocuments(),
        api.getWorkOrders(),
        api.getEvents(),
        api.getECOs()
      ]);

      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();
      const searchTerms = queryLower.split(' ').filter(term => term.length > 0); // Support multiple search terms

      // Search machines - comprehensive field matching
      machines.forEach((machine: Machine) => {
        const matchedFields: string[] = [];
        // Primary identifiers
        if (matchesSearchTerms(machine.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(machine.name, searchTerms)) matchedFields.push('name');
  if (matchesSearchTerms((machine as Partial<Machine> & { model?: string }).model, searchTerms)) matchedFields.push('model');
  if (matchesSearchTerms((machine as Partial<Machine> & { serialNumber?: string }).serialNumber, searchTerms)) matchedFields.push('serial');
        if (matchesSearchTerms(machine.type, searchTerms)) matchedFields.push('type');
        // Categories and location
        if (matchesSearchTerms(machine.category, searchTerms)) matchedFields.push('category');
  if (matchesSearchTerms((machine as { location?: string }).location, searchTerms)) matchedFields.push('location');
        if (matchesSearchTerms(machine.status, searchTerms)) matchedFields.push('status');
        // Technical details
        if (matchesSearchTerms(machine.oem, searchTerms)) matchedFields.push('oem');
        if (matchesSearchTerms(machine.controller, searchTerms)) matchedFields.push('controller');
  if (matchesSearchTerms((machine as { criticality?: string }).criticality, searchTerms)) matchedFields.push('criticality');
        // Production info
        if (matchesSearchTerms(machine.commissionedDate, searchTerms)) matchedFields.push('commissioned');
        if (matchesSearchTerms(machine.lastBackup, searchTerms)) matchedFields.push('backup');
        // Reason for downtime
        if (matchesSearchTerms(machine.downReason, searchTerms)) matchedFields.push('downtime');

        if (matchedFields.length > 0) {
          results.push({
            id: `machine-${machine.id}`,
            title: machine.name || machine.id || 'Unknown Machine',
            subtitle: `${machine.type || machine.category || 'N/A'} • ${machine.status || 'N/A'} • ID: ${machine.id}`,
            type: 'machine',
            data: machine,
            matchedFields
          });
        }
      });

      // Search documents - comprehensive field matching
      documents.forEach((doc: MomDocument) => {
        const matchedFields: string[] = [];
        if (matchesSearchTerms(doc.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(doc.name, searchTerms)) matchedFields.push('name');
        if (matchesSearchTerms(doc.type, searchTerms)) matchedFields.push('type');
        if (matchesSearchTerms(doc.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(doc.machineName, searchTerms)) matchedFields.push('machine');
        if (matchesSearchTerms(doc.version, searchTerms)) matchedFields.push('version');
        if (matchesSearchTerms(doc.uploadDate, searchTerms)) matchedFields.push('date');
        if (matchesSearchTerms(doc.notes, searchTerms)) matchedFields.push('notes');
        if (matchesSearchTerms(doc.fileUrl, searchTerms)) matchedFields.push('file');
        if (matchesSearchTerms(doc.linkedECO, searchTerms)) matchedFields.push('eco');

        if (matchedFields.length > 0) {
          results.push({
            id: `document-${doc.id}`,
            title: doc.name || 'Unknown Document',
            subtitle: `${doc.type || 'Document'} • ${doc.machineName || 'N/A'} • ${doc.uploadDate || 'N/A'}`,
            type: 'document',
            data: doc,
            matchedFields
          });
        }
      });

      // Search work orders - comprehensive field matching
      workOrders.forEach((wo: WorkOrder) => {
        const matchedFields: string[] = [];
        if (matchesSearchTerms(wo.id, searchTerms)) matchedFields.push('id');
  if (matchesSearchTerms((wo as Partial<WorkOrder> & { workOrderNumber?: string }).workOrderNumber, searchTerms)) matchedFields.push('number');
        if (matchesSearchTerms(wo.description, searchTerms)) matchedFields.push('description');
        if (matchesSearchTerms(wo.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(wo.machineName, searchTerms)) matchedFields.push('machine');
  if (matchesSearchTerms((wo as { assignedTo?: string }).assignedTo, searchTerms)) matchedFields.push('assigned');
  if (matchesSearchTerms((wo as { createdBy?: string }).createdBy, searchTerms)) matchedFields.push('creator');
        if (matchesSearchTerms(wo.dueDate, searchTerms)) matchedFields.push('due-date');
  if (matchesSearchTerms((wo as { createdAt?: string }).createdAt, searchTerms)) matchedFields.push('created');
  if (matchesSearchTerms((wo as { completedAt?: string }).completedAt, searchTerms)) matchedFields.push('completed');
        if (matchesSearchTerms(wo.linkedComponentId, searchTerms)) matchedFields.push('component');
        if (matchesSearchTerms(wo.linkedEventId, searchTerms)) matchedFields.push('event');
        if (matchesSearchTerms(wo.priority, searchTerms)) matchedFields.push('priority');
        if (matchesSearchTerms(wo.status, searchTerms)) matchedFields.push('status');
        if (matchedFields.length > 0) {
          results.push({
            id: `workorder-${wo.id}`,
            title: `WO ${wo.id || 'N/A'}: ${wo.description || (wo as unknown as { title?: string }).title || 'No description'}`,
            subtitle: `${wo.type || 'Maintenance'} • ${wo.machineName || 'N/A'} • ${wo.status || 'N/A'} • Due: ${wo.dueDate || 'N/A'}`,
            type: 'workorder',
            data: wo,
            matchedFields
          });
        }
      });

      // Search events - comprehensive field matching
      events.forEach((event: MomEvent) => {
        const matchedFields: string[] = [];
        if (matchesSearchTerms(event.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(event.description, searchTerms)) matchedFields.push('description');
  if (matchesSearchTerms((event as { rootCause?: string }).rootCause, searchTerms)) matchedFields.push('root-cause');
        if (matchesSearchTerms(event.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(event.machineName, searchTerms)) matchedFields.push('machine');
  if (matchesSearchTerms((event as { classification?: string }).classification, searchTerms)) matchedFields.push('classification');
  if (matchesSearchTerms((event as { severity?: string }).severity, searchTerms)) matchedFields.push('severity');
  if (matchesSearchTerms((event as { impactOnProduction?: string }).impactOnProduction, searchTerms)) matchedFields.push('impact');
  if (matchesSearchTerms((event as { downtime?: number }).downtime?.toString(), searchTerms)) matchedFields.push('downtime');
  if (matchesSearchTerms((event as { reportedBy?: string }).reportedBy, searchTerms)) matchedFields.push('reporter');
  if (matchesSearchTerms((event as { resolvedBy?: string }).resolvedBy, searchTerms)) matchedFields.push('resolver');
  if (matchesSearchTerms((event as { eventDate?: string }).eventDate, searchTerms)) matchedFields.push('date');
  if (matchesSearchTerms((event as { resolvedDate?: string }).resolvedDate, searchTerms)) matchedFields.push('resolved');
        if (matchesSearchTerms(event.timestamp, searchTerms)) matchedFields.push('timestamp');
        if (matchesSearchTerms((event as unknown as { resolution?: string }).resolution, searchTerms)) matchedFields.push('resolution');
  if ((event as { linkedWorkOrders?: string[] }).linkedWorkOrders?.some((wo: string) => matchesSearchTerms(wo, searchTerms))) matchedFields.push('work-orders');
  if ((event as { linkedComponents?: string[] }).linkedComponents?.some((comp: string) => matchesSearchTerms(comp, searchTerms))) matchedFields.push('components');

        if (matchedFields.length > 0) {
          results.push({
            id: `event-${event.id}`,
            title: event.description || (event as unknown as { rootCause?: string }).rootCause || 'Event',
            subtitle: `${(event as unknown as { eventType?: string }).eventType || event.type || 'Event'} • ${event.machineName || 'N/A'} • ${(event as unknown as { severity?: string }).severity || 'N/A'} • ${event.timestamp || 'N/A'}`,
            type: 'event',
            data: event,
            matchedFields
          });
        }
      });

      // Search ECOs
      ecos.forEach((eco: ECO) => {
        const matchedFields: string[] = [];
        if (matchesSearchTerms(eco.id, searchTerms)) matchedFields.push('id');
  if (matchesSearchTerms((eco as { ecoNumber?: string }).ecoNumber, searchTerms)) matchedFields.push('number');
        if (matchesSearchTerms(eco.description, searchTerms)) matchedFields.push('description');
        if (matchesSearchTerms(eco.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(eco.machineName, searchTerms)) matchedFields.push('machine');
        if (matchesSearchTerms(eco.status, searchTerms)) matchedFields.push('status');
  if (matchesSearchTerms((eco as { createdBy?: string }).createdBy, searchTerms)) matchedFields.push('creator');
  if (matchesSearchTerms((eco as { approvedBy?: string }).approvedBy, searchTerms)) matchedFields.push('approver');
  if (matchesSearchTerms((eco as { implementedBy?: string }).implementedBy, searchTerms)) matchedFields.push('implementer');
  if (matchesSearchTerms((eco as { dateCreated?: string }).dateCreated, searchTerms)) matchedFields.push('created');
  if (matchesSearchTerms((eco as { dateApproved?: string }).dateApproved, searchTerms)) matchedFields.push('approved');
  if (matchesSearchTerms((eco as { dateImplemented?: string }).dateImplemented, searchTerms)) matchedFields.push('implemented');
  if (matchesSearchTerms((eco as { technicalDetails?: string }).technicalDetails, searchTerms)) matchedFields.push('technical');
  if (matchesSearchTerms((eco as { implementationNotes?: string }).implementationNotes, searchTerms)) matchedFields.push('implementation');

        if (matchedFields.length > 0) {
          results.push({
            id: `eco-${eco.id}`,
            title: `ECO ${eco.number || eco.id || 'N/A'}: ${eco.description || eco.title || 'No description'}`,
            subtitle: `${eco.machineName || 'N/A'} • ${eco.status || 'N/A'} • ${(eco as unknown as { priority?: string }).priority || 'N/A'} • ${eco.date || 'N/A'}`,
            type: 'eco',
            data: eco,
            matchedFields
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => {
        const aHasExactMatch = a.matchedFields.some(field =>
          ['id', 'name', 'wo-number', 'eco-number', 'machine-id', 'event-id'].includes(field)
        );
        const bHasExactMatch = b.matchedFields.some(field =>
          ['id', 'name', 'wo-number', 'eco-number', 'machine-id', 'event-id'].includes(field)
        );
        if (aHasExactMatch && !bHasExactMatch) return -1;
        if (!aHasExactMatch && bHasExactMatch) return 1;
        if (b.matchedFields.length !== a.matchedFields.length) {
          return b.matchedFields.length - a.matchedFields.length;
        }
        const typePriority = { machine: 5, workorder: 4, event: 3, eco: 2, document: 1 } as const;
        return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
      });

      setAllResults(results);
      setSuggestions(results.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm.trim());
      } else {
        setSuggestions([]);
        setAllResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to check if text matches search query (supports multiple terms)
  const matchesSearchTerms = (text: string | undefined, searchTerms: string[]): boolean => {
    if (!text) return false;
    const textLower = text.toLowerCase();
    return searchTerms.some(term => textLower.includes(term));
  };

  // Old performSearch removed; using the memoized version above
  /* const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const [machines, documents, workOrders, events, ecos] = await Promise.all([
        api.getMachines(),
        api.getDocuments(),
        api.getWorkOrders(),
        api.getEvents(),
        api.getECOs()
      ]);

      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();
      const searchTerms = queryLower.split(' ').filter(term => term.length > 0); // Support multiple search terms

      // Search machines - comprehensive field matching
      machines.forEach((machine: any) => {
        const matchedFields: string[] = [];
        
        // Primary identifiers
        if (matchesSearchTerms(machine.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(machine.name, searchTerms)) matchedFields.push('name');
        if (matchesSearchTerms(machine.model, searchTerms)) matchedFields.push('model');
        if (matchesSearchTerms(machine.serialNumber, searchTerms)) matchedFields.push('serial');
        if (matchesSearchTerms(machine.type, searchTerms)) matchedFields.push('type');
        
        // Categories and location
        if (matchesSearchTerms(machine.category, searchTerms)) matchedFields.push('category');
        if (matchesSearchTerms(machine.location, searchTerms)) matchedFields.push('location');
        if (matchesSearchTerms(machine.status, searchTerms)) matchedFields.push('status');
        
        // Technical details
        if (matchesSearchTerms(machine.oem, searchTerms)) matchedFields.push('oem');
        if (matchesSearchTerms(machine.controller, searchTerms)) matchedFields.push('controller');
        if (matchesSearchTerms(machine.criticality, searchTerms)) matchedFields.push('criticality');
        
        // Production info
        if (matchesSearchTerms(machine.commissionedDate, searchTerms)) matchedFields.push('commissioned');
        if (matchesSearchTerms(machine.lastBackup, searchTerms)) matchedFields.push('backup');
        
        // Reason for downtime
        if (matchesSearchTerms(machine.downReason, searchTerms)) matchedFields.push('downtime');

        if (matchedFields.length > 0) {
          results.push({
            id: `machine-${machine.id}`,
            title: machine.name || machine.id || 'Unknown Machine',
            subtitle: `${machine.type || machine.category || 'N/A'} • ${machine.status || 'N/A'} • ID: ${machine.id}`,
            type: 'machine',
            data: machine,
            matchedFields
          });
        }
      });

      // Search documents - comprehensive field matching
      documents.forEach((doc: any) => {
        const matchedFields: string[] = [];
        
        // Document identifiers
        if (matchesSearchTerms(doc.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(doc.name, searchTerms)) matchedFields.push('name');
        if (matchesSearchTerms(doc.type, searchTerms)) matchedFields.push('type');
        
        // Machine associations
        if (matchesSearchTerms(doc.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(doc.machineName, searchTerms)) matchedFields.push('machine');
        
        // Document metadata
        if (matchesSearchTerms(doc.version, searchTerms)) matchedFields.push('version');
        if (matchesSearchTerms(doc.uploadDate, searchTerms)) matchedFields.push('date');
        if (matchesSearchTerms(doc.notes, searchTerms)) matchedFields.push('notes');
        if (matchesSearchTerms(doc.fileUrl, searchTerms)) matchedFields.push('file');
        
        // ECO associations
        if (matchesSearchTerms(doc.linkedECO, searchTerms)) matchedFields.push('eco');

        if (matchedFields.length > 0) {
          results.push({
            id: `document-${doc.id}`,
            title: doc.name || 'Unknown Document',
            subtitle: `${doc.type || 'Document'} • ${doc.machineName || 'N/A'} • ${doc.uploadDate || 'N/A'}`,
            type: 'document',
            data: doc,
            matchedFields
          });
        }
      });

      // Search work orders - comprehensive field matching
      workOrders.forEach((wo: any) => {
        const matchedFields: string[] = [];
        
        // Work order identifiers
        if (matchesSearchTerms(wo.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(wo.workOrderNumber, searchTerms)) matchedFields.push('number');
        if (matchesSearchTerms(wo.description, searchTerms)) matchedFields.push('description');
        
        // Machine associations
        if (matchesSearchTerms(wo.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(wo.machineName, searchTerms)) matchedFields.push('machine');
        
        // Personnel and scheduling
        if (matchesSearchTerms(wo.assignedTo, searchTerms)) matchedFields.push('assigned');
        if (matchesSearchTerms(wo.createdBy, searchTerms)) matchedFields.push('creator');
        if (matchesSearchTerms(wo.dueDate, searchTerms)) matchedFields.push('due-date');
        if (matchesSearchTerms(wo.createdAt, searchTerms)) matchedFields.push('created');
        if (matchesSearchTerms(wo.completedAt, searchTerms)) matchedFields.push('completed');
        
        // Linked items and metadata
        if (matchesSearchTerms(wo.linkedComponentId, searchTerms)) matchedFields.push('component');
        if (matchesSearchTerms(wo.linkedEventId, searchTerms)) matchedFields.push('event');
        if (matchesSearchTerms(wo.priority, searchTerms)) matchedFields.push('priority');
        if (matchesSearchTerms(wo.status, searchTerms)) matchedFields.push('status');        if (matchedFields.length > 0) {
          results.push({
            id: `workorder-${wo.id}`,
            title: `WO ${wo.id || 'N/A'}: ${wo.description || wo.title || 'No description'}`,
            subtitle: `${wo.type || 'Maintenance'} • ${wo.machineName || 'N/A'} • ${wo.status || 'N/A'} • Due: ${wo.dueDate || 'N/A'}`,
            type: 'workorder',
            data: wo,
            matchedFields
          });
        }
      });

      // Search events - comprehensive field matching
      events.forEach((event: any) => {
        const matchedFields: string[] = [];
        
                // Event identifiers
        if (matchesSearchTerms(event.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(event.description, searchTerms)) matchedFields.push('description');
        if (matchesSearchTerms(event.rootCause, searchTerms)) matchedFields.push('root-cause');
        
        // Machine associations
        if (matchesSearchTerms(event.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(event.machineName, searchTerms)) matchedFields.push('machine');
        
        // Classification and impact
        if (matchesSearchTerms(event.classification, searchTerms)) matchedFields.push('classification');
        if (matchesSearchTerms(event.severity, searchTerms)) matchedFields.push('severity');
        if (matchesSearchTerms(event.impactOnProduction, searchTerms)) matchedFields.push('impact');
        if (matchesSearchTerms(event.downtime?.toString(), searchTerms)) matchedFields.push('downtime');
        
        // Personnel and dates
        if (matchesSearchTerms(event.reportedBy, searchTerms)) matchedFields.push('reporter');
        if (matchesSearchTerms(event.resolvedBy, searchTerms)) matchedFields.push('resolver');
        if (matchesSearchTerms(event.eventDate, searchTerms)) matchedFields.push('date');
        if (matchesSearchTerms(event.resolvedDate, searchTerms)) matchedFields.push('resolved');
        if (matchesSearchTerms(event.timestamp, searchTerms)) matchedFields.push('timestamp');
        
        // Resolution and linked items
        if (matchesSearchTerms(event.resolution, searchTerms)) matchedFields.push('resolution');
        if (event.linkedWorkOrders?.some((wo: string) => matchesSearchTerms(wo, searchTerms))) matchedFields.push('work-orders');
        if (event.linkedComponents?.some((comp: string) => matchesSearchTerms(comp, searchTerms))) matchedFields.push('components');

        if (matchedFields.length > 0) {
          results.push({
            id: `event-${event.id}`,
            title: event.description || event.rootCause || 'Event',
            subtitle: `${event.eventType || event.type || 'Event'} • ${event.machineName || 'N/A'} • ${event.severity || 'N/A'} • ${event.timestamp || 'N/A'}`,
            type: 'event',
            data: event,
            matchedFields
          });
        }
      });

      // Search ECOs (Engineering Change Orders) - comprehensive field matching
      ecos.forEach((eco: any) => {
        const matchedFields: string[] = [];
        
                // ECO identifiers
        if (matchesSearchTerms(eco.id, searchTerms)) matchedFields.push('id');
        if (matchesSearchTerms(eco.ecoNumber, searchTerms)) matchedFields.push('number');
        if (matchesSearchTerms(eco.description, searchTerms)) matchedFields.push('description');
        
        // Machine associations
        if (matchesSearchTerms(eco.machineId, searchTerms)) matchedFields.push('machine-id');
        if (matchesSearchTerms(eco.machineName, searchTerms)) matchedFields.push('machine');
        
        // Status and personnel
        if (matchesSearchTerms(eco.status, searchTerms)) matchedFields.push('status');
        if (matchesSearchTerms(eco.createdBy, searchTerms)) matchedFields.push('creator');
        if (matchesSearchTerms(eco.approvedBy, searchTerms)) matchedFields.push('approver');
        if (matchesSearchTerms(eco.implementedBy, searchTerms)) matchedFields.push('implementer');
        
        // Dates
        if (matchesSearchTerms(eco.dateCreated, searchTerms)) matchedFields.push('created');
        if (matchesSearchTerms(eco.dateApproved, searchTerms)) matchedFields.push('approved');
        if (matchesSearchTerms(eco.dateImplemented, searchTerms)) matchedFields.push('implemented');
        
        // Technical details
        if (matchesSearchTerms(eco.technicalDetails, searchTerms)) matchedFields.push('technical');
        if (matchesSearchTerms(eco.implementationNotes, searchTerms)) matchedFields.push('implementation');

        if (matchedFields.length > 0) {
          results.push({
            id: `eco-${eco.id}`,
            title: `ECO ${eco.number || eco.id || 'N/A'}: ${eco.description || eco.title || 'No description'}`,
            subtitle: `${eco.machineName || 'N/A'} • ${eco.status || 'N/A'} • ${eco.priority || 'N/A'} • ${eco.date || 'N/A'}`,
            type: 'eco',
            data: eco,
            matchedFields
          });
        }
      });

      // Sort by relevance with improved ranking
      results.sort((a, b) => {
        // Primary sort: exact matches in important fields (id, name, number) get highest priority
        const aHasExactMatch = a.matchedFields.some(field => 
          ['id', 'name', 'wo-number', 'eco-number', 'machine-id', 'event-id'].includes(field)
        );
        const bHasExactMatch = b.matchedFields.some(field => 
          ['id', 'name', 'wo-number', 'eco-number', 'machine-id', 'event-id'].includes(field)
        );
        
        if (aHasExactMatch && !bHasExactMatch) return -1;
        if (!aHasExactMatch && bHasExactMatch) return 1;
        
        // Secondary sort: more matched fields = higher priority
        if (b.matchedFields.length !== a.matchedFields.length) {
          return b.matchedFields.length - a.matchedFields.length;
        }
        
        // Tertiary sort: type priority (machines first, then work orders, then others)
        const typePriority = { machine: 5, workorder: 4, event: 3, eco: 2, document: 1 };
        return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
      });

      setAllResults(results);
      setSuggestions(results.slice(0, 10)); // Top 10 for dropdown (increased from 8)
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }; */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setIsExpanded(true);
      setSuggestions([]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setIsExpanded(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'machine':
        onMachineSelect?.(result.data as Machine);
        break;
      case 'eco':
        onECOSelect?.(result.data as ECO);
        break;
      case 'workorder':
        onWorkOrderSelect?.(result.data as WorkOrder);
        break;
    }
    setSuggestions([]);
    setIsExpanded(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'machine': return <Server className="w-4 h-4 text-blue-600" />;
      case 'document': return <FileText className="w-4 h-4 text-green-600" />;
      case 'workorder': return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'event': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'eco': return <FileText className="w-4 h-4 text-pink-600" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'machine': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'document': return 'bg-green-100 text-green-800 border-green-200';
      case 'workorder': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'eco': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setAllResults([]);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by machine ID, WO number, ECO, event, document name, date, status..."
              className="pl-9 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchTerm.trim() && allResults.length > 0) {
                  setSuggestions(allResults.slice(0, 8));
                }
              }}
            />
            {searchTerm && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={clearSearch}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Loading Spinner - positioned to the side */}
          {isLoading && searchTerm && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="hidden sm:inline">Searching...</span>
            </div>
          )}
        </div>

        {/* Dropdown Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && !isExpanded && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
            >
              {suggestions.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                    <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getResultBadgeColor(result.type)}`}>
                    {result.type}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
              
              {allResults.length > 8 && (
                <div 
                  className="p-3 text-center text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100"
                  onClick={() => {
                    setIsExpanded(true);
                    setSuggestions([]);
                  }}
                >
                  View all {allResults.length} results
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Search Results */}
      <AnimatePresence>
        {isExpanded && allResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 rounded-lg bg-white"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Search Results</h3>
                <p className="text-sm text-gray-600">Found {allResults.length} results for "{searchTerm}"</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {['machine', 'workorder', 'document', 'event', 'eco'].map(type => {
                const typeResults = allResults.filter(r => r.type === type);
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <h4 className="font-medium text-sm text-gray-700 capitalize flex items-center gap-2">
                        {getResultIcon(type)}
                        {type}s ({typeResults.length})
                      </h4>
                    </div>
                    <div className="space-y-0">
                      {typeResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                          onClick={() => handleResultClick(result)}
                        >
                          {getResultIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{result.title}</p>
                            <p className="text-xs text-gray-500">{result.subtitle}</p>
                            {result.matchedFields.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {result.matchedFields.map(field => (
                                  <span key={field} className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
