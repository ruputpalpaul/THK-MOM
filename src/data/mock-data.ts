import { Machine, Event, WorkOrder, Document, ECO, Component, MachineSetting, ProductionData, ShippingOrder, Delivery, PartReadiness } from '../types/green-room';

export const machines: Machine[] = [
  // AXH Assembly Machines
  { id: 'AXH045', name: 'AXH045', type: 'Assembly Machine', category: 'AXH Assembly', status: 'active', oem: 'THK', controller: 'Siemens S7-1500', commissionedDate: '2018-03-15', criticality: 'high', lastBackup: '2024-09-15', mtbf: 320, mttr: 2.5, oee: 87.5, power: '480V 3Ph', air: '90 PSI', network: '192.168.10.45', x: 100, y: 100, todayTarget: 500, todayActual: 487, todayScrap: 8 },
  { id: 'AXH063', name: 'AXH063', type: 'Assembly Machine', category: 'AXH Assembly', status: 'active', oem: 'THK', controller: 'Siemens S7-1500', commissionedDate: '2019-06-20', criticality: 'high', lastBackup: '2024-09-20', x: 250, y: 100, todayTarget: 500, todayActual: 512, todayScrap: 5 },
  { id: 'AXH064', name: 'AXH064', type: 'Assembly Machine', category: 'AXH Assembly', status: 'maintenance', oem: 'THK', controller: 'Siemens S7-1500', commissionedDate: '2019-07-10', criticality: 'high', lastBackup: '2024-08-30', x: 400, y: 100, todayTarget: 500, todayActual: 0, todayScrap: 0 },
  { id: 'AXH062', name: 'AXH062', type: 'Assembly Machine', category: 'AXH Assembly', status: 'active', oem: 'THK', controller: 'Siemens S7-1500', commissionedDate: '2019-05-12', criticality: 'high', lastBackup: '2024-09-25', x: 550, y: 100, todayTarget: 500, todayActual: 468, todayScrap: 12 },
  { id: 'AXH057', name: 'AXH057', type: 'Assembly Machine', category: 'AXH Assembly', status: 'down', oem: 'THK', controller: 'Siemens S7-1500', commissionedDate: '2018-11-05', criticality: 'high', lastBackup: '2024-03-10', lastDowntime: '2024-10-01', x: 700, y: 100, todayTarget: 500, todayActual: 245, todayScrap: 3, downReason: 'Gripper pneumatic failure - loss of pressure in Zone A', diagnosed: false },

  // AXH Retainer Machines
  { id: 'AXH031', name: 'AXH031', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2017-02-14', criticality: 'medium', lastBackup: '2024-09-18', x: 100, y: 250, todayTarget: 800, todayActual: 795, todayScrap: 15 },
  { id: 'AXH032', name: 'AXH032', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2017-03-22', criticality: 'medium', lastBackup: '2024-09-22', x: 250, y: 250, todayTarget: 800, todayActual: 823, todayScrap: 11 },
  { id: 'AXH036', name: 'AXH036', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2017-08-30', criticality: 'medium', lastBackup: '2024-09-10', x: 400, y: 250, todayTarget: 800, todayActual: 756, todayScrap: 18 },
  { id: 'AXH052', name: 'AXH052', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2018-09-15', criticality: 'medium', lastBackup: '2024-09-28', x: 550, y: 250, todayTarget: 800, todayActual: 812, todayScrap: 9 },
  { id: 'AXH053', name: 'AXH053', type: 'Retainer Machine', category: 'AXH Retainer', status: 'maintenance', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2018-10-01', criticality: 'medium', lastBackup: '2024-09-05', x: 700, y: 250, todayTarget: 800, todayActual: 0, todayScrap: 0 },
  { id: 'AXH054', name: 'AXH054', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2018-10-15', criticality: 'medium', lastBackup: '2024-09-23', x: 850, y: 250, todayTarget: 800, todayActual: 789, todayScrap: 13 },
  { id: 'AXH058', name: 'AXH058', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2018-12-20', criticality: 'medium', lastBackup: '2024-09-27', x: 100, y: 350, todayTarget: 800, todayActual: 801, todayScrap: 7 },
  { id: 'AXH065', name: 'AXH065', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2019-08-12', criticality: 'medium', lastBackup: '2024-09-24', x: 250, y: 350, todayTarget: 800, todayActual: 834, todayScrap: 10 },
  { id: 'AXH066', name: 'AXH066', type: 'Retainer Machine', category: 'AXH Retainer', status: 'active', oem: 'THK', controller: 'Allen Bradley', commissionedDate: '2019-09-05', criticality: 'medium', lastBackup: '2024-09-26', x: 400, y: 350, todayTarget: 800, todayActual: 778, todayScrap: 14 },

  // Measurement Stations
  { id: 'HSR25', name: 'HSR25 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-05-10', criticality: 'high', lastBackup: '2024-09-29', x: 550, y: 350, todayTarget: 120, todayActual: 118, todayScrap: 2 },
  { id: 'HSR30', name: 'HSR30 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-06-15', criticality: 'high', lastBackup: '2024-09-28', x: 700, y: 350, todayTarget: 120, todayActual: 125, todayScrap: 1 },
  { id: 'HSR35', name: 'HSR35 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-07-20', criticality: 'high', lastBackup: '2024-09-27', x: 850, y: 350, todayTarget: 120, todayActual: 112, todayScrap: 3 },
  { id: 'SHS20', name: 'SHS20 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-08-25', criticality: 'high', lastBackup: '2024-09-26', x: 100, y: 500, todayTarget: 120, todayActual: 119, todayScrap: 1 },
  { id: 'SHS25', name: 'SHS25 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-09-30', criticality: 'high', lastBackup: '2024-09-25', x: 250, y: 500, todayTarget: 120, todayActual: 123, todayScrap: 0 },
  { id: 'SHS30', name: 'SHS30 Measurement', type: 'Measurement Station', category: 'Measurement', status: 'active', oem: 'Mitutoyo', controller: 'PC-DMIS', commissionedDate: '2016-10-12', criticality: 'high', lastBackup: '2024-09-24', x: 400, y: 500, todayTarget: 120, todayActual: 115, todayScrap: 2 },

  // Laser Marking
  { id: 'ZMH003', name: 'ZMH003', type: 'Laser Marker', category: 'Laser Marking', status: 'active', oem: 'Keyence', controller: 'Keyence MD-X', commissionedDate: '2020-01-10', criticality: 'medium', lastBackup: '2024-09-20', x: 550, y: 500, todayTarget: 1000, todayActual: 1045, todayScrap: 5 },
  { id: 'ZMH004', name: 'ZMH004', type: 'Laser Marker', category: 'Laser Marking', status: 'active', oem: 'Keyence', controller: 'Keyence MD-X', commissionedDate: '2020-02-15', criticality: 'medium', lastBackup: '2024-09-21', x: 700, y: 500, todayTarget: 1000, todayActual: 998, todayScrap: 8 },
  { id: 'ZMH005', name: 'ZMH005', type: 'Laser Marker', category: 'Laser Marking', status: 'active', oem: 'Keyence', controller: 'Keyence MD-X', commissionedDate: '2020-03-20', criticality: 'medium', lastBackup: '2024-09-22', x: 850, y: 500, todayTarget: 1000, todayActual: 1023, todayScrap: 4 },
  { id: 'ZMH006', name: 'ZMH006', type: 'Laser Marker', category: 'Laser Marking', status: 'active', oem: 'Keyence', controller: 'Keyence MD-X', commissionedDate: '2020-04-25', criticality: 'medium', lastBackup: '2024-09-23', x: 100, y: 650, todayTarget: 1000, todayActual: 967, todayScrap: 12 },
  { id: 'ZMH007', name: 'ZMH007', type: 'Laser Marker', category: 'Laser Marking', status: 'maintenance', oem: 'Keyence', controller: 'Keyence MD-X', commissionedDate: '2020-05-30', criticality: 'medium', lastBackup: '2024-09-19', x: 250, y: 650, todayTarget: 1000, todayActual: 0, todayScrap: 0 },

  // Assembly Tables - HSR
  { id: 'HSR25-T', name: 'HSR25 Assembly', type: 'Assembly Table', category: 'Assembly Tables - HSR', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 400, y: 650, todayTarget: 50, todayActual: 48, todayScrap: 1 },
  { id: 'HSR30-T', name: 'HSR30 Assembly', type: 'Assembly Table', category: 'Assembly Tables - HSR', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 550, y: 650, todayTarget: 50, todayActual: 52, todayScrap: 0 },
  { id: 'HSR35-T', name: 'HSR35 Assembly', type: 'Assembly Table', category: 'Assembly Tables - HSR', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 700, y: 650, todayTarget: 50, todayActual: 45, todayScrap: 2 },
  { id: 'HSR45-T', name: 'HSR45 Assembly', type: 'Assembly Table', category: 'Assembly Tables - HSR', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 850, y: 650, todayTarget: 50, todayActual: 51, todayScrap: 1 },

  // Assembly Tables - SHS
  { id: 'SHS20-T', name: 'SHS20 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 100, y: 800, todayTarget: 50, todayActual: 49, todayScrap: 0 },
  { id: 'SHS25-T', name: 'SHS25 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 250, y: 800, todayTarget: 50, todayActual: 53, todayScrap: 1 },
  { id: 'SHS30-T', name: 'SHS30 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 400, y: 800, todayTarget: 50, todayActual: 47, todayScrap: 2 },
  { id: 'SHS35-T', name: 'SHS35 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 550, y: 800, todayTarget: 50, todayActual: 50, todayScrap: 0 },
  { id: 'SHS45-T', name: 'SHS45 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 700, y: 800, todayTarget: 50, todayActual: 46, todayScrap: 3 },
  { id: 'SHS55-T', name: 'SHS55/65 Assembly', type: 'Assembly Table', category: 'Assembly Tables - SHS', status: 'active', criticality: 'low', lastBackup: 'N/A', x: 850, y: 800, todayTarget: 50, todayActual: 54, todayScrap: 1 },

  // --- Production Floor: Block Grinding ---
  { id: 'BG001', name: 'Block Grinder 1', type: 'Grinding Machine', category: 'Block Grinding', status: 'active', oem: 'Okamoto', controller: 'Fanuc', x: 120, y: 950, todayTarget: 400, todayActual: 390, todayScrap: 6 },
  { id: 'BG002', name: 'Block Grinder 2', type: 'Grinding Machine', category: 'Block Grinding', status: 'maintenance', oem: 'Okamoto', controller: 'Fanuc', x: 260, y: 950, todayTarget: 400, todayActual: 0, todayScrap: 0 },

  // --- Production Floor: Cutting ---
  { id: 'CUT001', name: 'Cutting Line A', type: 'Cutting Machine', category: 'Cutting', status: 'active', oem: 'Amada', controller: 'Siemens', x: 420, y: 950, todayTarget: 600, todayActual: 615, todayScrap: 4 },
  { id: 'CUT002', name: 'Cutting Line B', type: 'Cutting Machine', category: 'Cutting', status: 'active', oem: 'Amada', controller: 'Siemens', x: 560, y: 950, todayTarget: 600, todayActual: 582, todayScrap: 7 },

  // --- Production Floor: Drilling ---
  { id: 'DRL001', name: 'Drill Cell 1', type: 'Drilling Machine', category: 'Drilling', status: 'active', oem: 'Mazak', controller: 'Mazatrol', x: 720, y: 950, todayTarget: 500, todayActual: 497, todayScrap: 5 },
  { id: 'DRL002', name: 'Drill Cell 2', type: 'Drilling Machine', category: 'Drilling', status: 'down', oem: 'Mazak', controller: 'Mazatrol', x: 860, y: 950, todayTarget: 500, todayActual: 210, todayScrap: 9, downReason: 'Spindle overheat alarm', diagnosed: false },

  // --- Production Floor: Injection Molding ---
  { id: 'INJ001', name: 'Injection Molder 180T', type: 'Injection Molder', category: 'Injection Molding', status: 'active', oem: 'Arburg', controller: 'Selogica', x: 120, y: 1080, todayTarget: 1200, todayActual: 1188, todayScrap: 12 },
  { id: 'INJ002', name: 'Injection Molder 250T', type: 'Injection Molder', category: 'Injection Molding', status: 'active', oem: 'Arburg', controller: 'Selogica', x: 260, y: 1080, todayTarget: 1200, todayActual: 1196, todayScrap: 8 },

  // --- Production Floor: Straightening ---
  { id: 'STR001', name: 'Straightener A', type: 'Straightening Machine', category: 'Straightening', status: 'active', oem: 'THK', controller: 'Custom PLC', x: 420, y: 1080, todayTarget: 700, todayActual: 684, todayScrap: 3 },
  { id: 'STR002', name: 'Straightener B', type: 'Straightening Machine', category: 'Straightening', status: 'active', oem: 'THK', controller: 'Custom PLC', x: 560, y: 1080, todayTarget: 700, todayActual: 701, todayScrap: 2 },

  // --- Production Floor: Wash ---
  { id: 'WSH001', name: 'Parts Washer 1', type: 'Washer', category: 'Wash', status: 'active', oem: 'EcoClean', controller: 'Siemens', x: 720, y: 1080, todayTarget: 1500, todayActual: 1472, todayScrap: 0 },
  { id: 'WSH002', name: 'Parts Washer 2', type: 'Washer', category: 'Wash', status: 'maintenance', oem: 'EcoClean', controller: 'Siemens', x: 860, y: 1080, todayTarget: 1500, todayActual: 0, todayScrap: 0 },

  // --- Production Floor: CNC Cutting ---
  { id: 'CNC001', name: 'CNC Cutter 1', type: 'CNC Cutting', category: 'CNC Cutting', status: 'active', oem: 'DMG Mori', controller: 'Fanuc 31i', x: 120, y: 1210, todayTarget: 450, todayActual: 438, todayScrap: 6 },
  { id: 'CNC002', name: 'CNC Cutter 2', type: 'CNC Cutting', category: 'CNC Cutting', status: 'active', oem: 'DMG Mori', controller: 'Fanuc 31i', x: 260, y: 1210, todayTarget: 450, todayActual: 455, todayScrap: 4 },
  
  // --- Shipping: Wrap & Pack ---
  { id: 'WRP001', name: 'Stretch Wrapper 1', type: 'Wrapper', category: 'Shipping - Wrap', status: 'active', oem: 'Lantech', controller: 'Siemens', x: 420, y: 1210 },
  { id: 'WRP002', name: 'Stretch Wrapper 2', type: 'Wrapper', category: 'Shipping - Wrap', status: 'maintenance', oem: 'Lantech', controller: 'Siemens', x: 560, y: 1210 },
  { id: 'PKG001', name: 'Pack Line A', type: 'Packing Line', category: 'Shipping - Pack', status: 'active', oem: 'Custom', controller: 'Allen Bradley', x: 720, y: 1210 },
  { id: 'PKG002', name: 'Pack Line B', type: 'Packing Line', category: 'Shipping - Pack', status: 'active', oem: 'Custom', controller: 'Allen Bradley', x: 860, y: 1210 },
  // Forklifts
  { id: 'FL001', name: 'Forklift A', type: 'Forklift', category: 'Shipping - Forklift', status: 'active', oem: 'Toyota', controller: 'N/A', x: 120, y: 1340 },
  { id: 'FL002', name: 'Forklift B', type: 'Forklift', category: 'Shipping - Forklift', status: 'maintenance', oem: 'Toyota', controller: 'N/A', x: 260, y: 1340 },
];

export const events: Event[] = [
  // AXH045 Events
  { id: 'E045-001', machineId: 'AXH045', machineName: 'AXH045', type: 'backup', description: 'PLC program backup v2.3.1 completed', timestamp: '2024-09-15 08:30' },
  { id: 'E045-002', machineId: 'AXH045', machineName: 'AXH045', type: 'eco', description: 'ECO-2024-045 firmware upgrade implemented', timestamp: '2024-08-15 14:00' },
  { id: 'E045-003', machineId: 'AXH045', machineName: 'AXH045', type: 'maintenance', description: 'Quarterly PM completed - WO-AXH045-Q3', timestamp: '2024-07-22 16:45' },
  { id: 'E045-004', machineId: 'AXH045', machineName: 'AXH045', type: 'uptime', description: 'System back online after PM', timestamp: '2024-07-22 16:50' },
  { id: 'E045-005', machineId: 'AXH045', machineName: 'AXH045', type: 'downtime', description: 'Scheduled quarterly preventive maintenance', timestamp: '2024-07-22 08:00' },
  { id: 'E045-006', machineId: 'AXH045', machineName: 'AXH045', type: 'eco', description: 'ECO-2024-032 vision system calibration completed', timestamp: '2024-06-10 11:20' },
  { id: 'E045-007', machineId: 'AXH045', machineName: 'AXH045', type: 'backup', description: 'PLC program backup v2.2.8 completed', timestamp: '2024-06-15 09:15' },
  { id: 'E045-008', machineId: 'AXH045', machineName: 'AXH045', type: 'maintenance', description: 'Servo axis 8 ballscrew lubrication - WO-AXH045-CM12', timestamp: '2024-05-18 13:30' },
  { id: 'E045-009', machineId: 'AXH045', machineName: 'AXH045', type: 'fault', description: 'Clamp Unit A pressure drop detected', timestamp: '2024-04-25 10:45' },
  { id: 'E045-010', machineId: 'AXH045', machineName: 'AXH045', type: 'uptime', description: 'Clamp cylinder replacement completed', timestamp: '2024-04-25 14:20' },
  { id: 'E045-011', machineId: 'AXH045', machineName: 'AXH045', type: 'maintenance', description: 'Semi-annual calibration completed - WO-AXH045-Q2', timestamp: '2024-04-10 15:00' },
  { id: 'E045-012', machineId: 'AXH045', machineName: 'AXH045', type: 'eco', description: 'ECO-2024-018 torque limit adjustment implemented', timestamp: '2024-03-20 09:00' },
  { id: 'E045-013', machineId: 'AXH045', machineName: 'AXH045', type: 'backup', description: 'PLC program backup v2.2.5 completed', timestamp: '2024-03-15 08:00' },
  { id: 'E045-014', machineId: 'AXH045', machineName: 'AXH045', type: 'maintenance', description: 'Vision camera lens cleaning - WO-AXH045-CM08', timestamp: '2024-02-28 11:00' },
  { id: 'E045-015', machineId: 'AXH045', machineName: 'AXH045', type: 'maintenance', description: 'Q1 Preventive maintenance completed - WO-AXH045-Q1', timestamp: '2024-01-15 14:30' },
  
  // Other machines
  { id: 'E001', machineId: 'AXH057', machineName: 'AXH057', type: 'fault', description: 'Gripper pneumatic failure', timestamp: '2024-10-01 14:23' },
  { id: 'E002', machineId: 'AXH064', machineName: 'AXH064', type: 'downtime', description: 'Scheduled preventive maintenance', timestamp: '2024-09-30 08:00' },
  { id: 'E003', machineId: 'ZMH007', machineName: 'ZMH007', type: 'fault', description: 'Laser alignment drift', timestamp: '2024-09-29 16:45' },
  { id: 'E004', machineId: 'AXH053', machineName: 'AXH053', type: 'downtime', description: 'Retainer tooling replacement', timestamp: '2024-09-28 10:30' },
  { id: 'E006', machineId: 'HSR25', machineName: 'HSR25 Measurement', type: 'fault', description: 'Probe calibration error', timestamp: '2024-09-26 11:15' },
  { id: 'E007', machineId: 'AXH032', machineName: 'AXH032', type: 'downtime', description: 'Conveyor belt replacement', timestamp: '2024-09-25 09:20' },
  { id: 'E008', machineId: 'ZMH004', machineName: 'ZMH004', type: 'fault', description: 'Communication timeout to PLC', timestamp: '2024-09-24 13:50' },
  { id: 'E009', machineId: 'AXH063', machineName: 'AXH063', type: 'uptime', description: 'Resumed production after tooling change', timestamp: '2024-09-23 07:30' },
  { id: 'E010', machineId: 'SHS30', machineName: 'SHS30 Measurement', type: 'fault', description: 'CMM software crash', timestamp: '2024-09-22 14:10' },
  
  // --- Production Floor Events ---
  { id: 'E-BG001-001', machineId: 'BG001', machineName: 'Block Grinder 1', type: 'fault', description: 'Coolant flow low alarm', timestamp: '2024-10-01 09:30' },
  { id: 'E-BG002-001', machineId: 'BG002', machineName: 'Block Grinder 2', type: 'maintenance', description: 'Scheduled wheel dressing and alignment', timestamp: '2024-10-02 08:00' },
  { id: 'E-CUT001-001', machineId: 'CUT001', machineName: 'Cutting Line A', type: 'uptime', description: 'Back online after blade change', timestamp: '2024-10-02 10:45' },
  { id: 'E-DRL002-001', machineId: 'DRL002', machineName: 'Drill Cell 2', type: 'downtime', description: 'Spindle overheat alarm triggered', timestamp: '2024-10-02 11:15' },
  { id: 'E-INJ001-001', machineId: 'INJ001', machineName: 'Injection Molder 180T', type: 'maintenance', description: 'Barrel temperature calibration', timestamp: '2024-10-01 13:20' },
  { id: 'E-WSH002-001', machineId: 'WSH002', machineName: 'Parts Washer 2', type: 'downtime', description: 'Pump motor replacement', timestamp: '2024-10-02 12:05' },
  { id: 'E-CNC001-001', machineId: 'CNC001', machineName: 'CNC Cutter 1', type: 'backup', description: 'Fanuc 31i parameter backup v1.4 created', timestamp: '2024-10-02 07:55' },
  // Shipping events
  { id: 'E-WRP002-001', machineId: 'WRP002', machineName: 'Stretch Wrapper 2', type: 'downtime', description: 'Turntable motor fault', timestamp: '2024-10-03 10:15' },
  { id: 'E-PKG001-001', machineId: 'PKG001', machineName: 'Pack Line A', type: 'uptime', description: 'Back online after minor jam', timestamp: '2024-10-03 08:40' },
];

// Shipping Orders
export const shippingOrders: ShippingOrder[] = [
  {
    id: 'SO-1001',
    orderNumber: 'SO-1001',
    customer: 'THK North America',
    priority: 'high',
    status: 'picking',
    dueDate: '2025-10-10',
    createdAt: '2025-10-08T09:00:00Z',
    assignedTo: 'Team A',
    items: [
      { sku: 'HSR25-1000', description: 'HSR25 Rail 1000mm', qty: 20, readyQty: 12 },
      { sku: 'HSR25B', description: 'HSR25 Carriage', qty: 40, readyQty: 40 },
    ],
  },
  {
    id: 'SO-1002',
    orderNumber: 'SO-1002',
    customer: 'THK Europe',
    priority: 'medium',
    status: 'packed',
    dueDate: '2025-10-11',
    createdAt: '2025-10-08T10:30:00Z',
    assignedTo: 'Team B',
    items: [
      { sku: 'SHS30-800', description: 'SHS30 Rail 800mm', qty: 10, readyQty: 10 },
      { sku: 'SHS30C', description: 'SHS30 Carriage', qty: 20, readyQty: 20 },
    ],
  },
  {
    id: 'SO-1003',
    orderNumber: 'SO-1003',
    customer: 'THK Asia',
    priority: 'critical',
    status: 'on-hold',
    dueDate: '2025-10-09',
    createdAt: '2025-10-08T12:00:00Z',
    notes: 'Awaiting QA release of batch SHS25-LOT-221',
    items: [
      { sku: 'SHS25-900', description: 'SHS25 Rail 900mm', qty: 15, readyQty: 0 },
    ],
  },
];

// Delivery Schedule
export const deliveries: Delivery[] = [
  {
    id: 'DL-5001',
    carrier: 'FedEx Freight',
    reference: 'BOL-88921',
    scheduledDate: '2025-10-09',
    windowStart: '10:00',
    windowEnd: '12:00',
    dock: 'Dock 2',
    status: 'scheduled',
    orderIds: ['SO-1001'],
    notes: 'Requires forklift with 3k lb capacity',
  },
  {
    id: 'DL-5002',
    carrier: 'UPS',
    reference: '1Z12345',
    scheduledDate: '2025-10-09',
    windowStart: '14:00',
    windowEnd: '16:00',
    dock: 'Dock 1',
    status: 'scheduled',
    orderIds: ['SO-1002', 'SO-1003'],
  },
];

// Parts readiness for shipping
export const partsReadiness: PartReadiness[] = [
  { id: 'PR-001', partNumber: 'HSR25-1000', description: 'HSR25 Rail 1000mm', location: 'Aisle 3 / Bin 12', requiredForOrderId: 'SO-1001', requiredQty: 20, availableQty: 12, status: 'short' },
  { id: 'PR-002', partNumber: 'HSR25B', description: 'HSR25 Carriage', location: 'Aisle 3 / Bin 15', requiredForOrderId: 'SO-1001', requiredQty: 40, availableQty: 40, status: 'ready' },
  { id: 'PR-003', partNumber: 'SHS30-800', description: 'SHS30 Rail 800mm', location: 'Aisle 5 / Bin 7', requiredForOrderId: 'SO-1002', requiredQty: 10, availableQty: 10, status: 'ready' },
  { id: 'PR-004', partNumber: 'SHS25-900', description: 'SHS25 Rail 900mm', location: 'Aisle 5 / Bin 11', requiredForOrderId: 'SO-1003', requiredQty: 15, availableQty: 0, status: 'allocated' },
];

export const workOrders: WorkOrder[] = [
  // AXH045 Work Orders
  { 
    id: 'WO-AXH045-Q4', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'PM', 
    priority: 'medium', 
    status: 'open', 
    description: 'Q4 2024 Quarterly preventive maintenance', 
    requestedBy: 'Maintenance Schedule', 
    assignee: 'Tech Team A', 
    dueDate: '2024-10-15', 
    linkedEventId: 'E045-003',
    tasks: [
      { description: 'Safety lockout/tagout verification', status: 'pending' },
      { description: 'Visual inspection of all guards and safety devices', status: 'pending' },
      { description: 'Check emergency stop functionality', status: 'pending' },
      { description: 'Inspect pneumatic system for leaks', status: 'pending' },
      { description: 'Check air pressure regulators (90 PSI nominal)', status: 'pending' },
      { description: 'Lubricate all linear guides and ballscrews', status: 'pending' },
      { description: 'Inspect servo motor encoders for damage', status: 'pending' },
      { description: 'Verify vision system lighting and camera focus', status: 'pending' },
      { description: 'Clean and calibrate vision cameras', status: 'pending' },
      { description: 'Check clamp cylinder operation and force', status: 'pending' },
      { description: 'Inspect all wire harnesses for wear', status: 'pending' },
      { description: 'Tighten electrical connections in control cabinet', status: 'pending' },
      { description: 'Check PLC battery voltage (>3.0V required)', status: 'pending' },
      { description: 'Backup PLC program and verify against master', status: 'pending' },
      { description: 'Test all axis home positions and limits', status: 'pending' },
      { description: 'Run production test cycle and verify quality', status: 'pending' },
      { description: 'Update maintenance log and attach photos', status: 'pending' },
    ]
  },
  { 
    id: 'WO-AXH045-Q3', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'PM', 
    priority: 'medium', 
    status: 'completed', 
    description: 'Q3 2024 Quarterly preventive maintenance', 
    requestedBy: 'Maintenance Schedule', 
    assignee: 'Tech Team A', 
    dueDate: '2024-07-22', 
    completedDate: '2024-07-22', 
    verifiedBy: 'M. Johnson', 
    laborHours: 4.5,
    tasks: [
      { description: 'Safety lockout/tagout verification', status: 'pass', notes: 'All locks verified and logged' },
      { description: 'Visual inspection of all guards and safety devices', status: 'pass', notes: 'No damage found' },
      { description: 'Check emergency stop functionality', status: 'pass', notes: 'E-stop response time: 0.3s' },
      { description: 'Inspect pneumatic system for leaks', status: 'pass', notes: 'No leaks detected' },
      { description: 'Check air pressure regulators (90 PSI nominal)', status: 'pass', notes: 'Main: 89.5 PSI, Clamp: 90.2 PSI' },
      { description: 'Lubricate all linear guides and ballscrews', status: 'pass', notes: 'Used Mobilith SHC 220' },
      { description: 'Inspect servo motor encoders for damage', status: 'pass', notes: 'All 8 axes encoders OK' },
      { description: 'Verify vision system lighting and camera focus', status: 'pass', notes: 'Lighting intensity: 95%' },
      { description: 'Clean and calibrate vision cameras', status: 'pass', notes: 'Calibration within spec' },
      { description: 'Check clamp cylinder operation and force', status: 'pass', notes: 'Force measured: 485N (spec: 450-500N)' },
      { description: 'Inspect all wire harnesses for wear', status: 'pass', notes: 'Minor wear on Z-axis cable, monitored' },
      { description: 'Tighten electrical connections in control cabinet', status: 'pass', notes: 'Torque verified with wrench' },
      { description: 'Check PLC battery voltage (>3.0V required)', status: 'pass', notes: 'Voltage: 3.18V' },
      { description: 'Backup PLC program and verify against master', status: 'pass', notes: 'Backup created: v2.3.1' },
      { description: 'Test all axis home positions and limits', status: 'pass', notes: 'All axes within 0.01mm tolerance' },
      { description: 'Run production test cycle and verify quality', status: 'pass', notes: '10 test parts - all passed inspection' },
      { description: 'Update maintenance log and attach photos', status: 'pass', notes: 'Photos uploaded to shared drive' },
    ],
    evidence: [
      'PM_Checklist_WO-AXH045-Q3_Completed.pdf',
      'Inspection_Photos_2024-07-22.zip',
      'Torque_Measurements_Log.xlsx',
      'Test_Parts_Quality_Report.pdf'
    ]
  },
  { 
    id: 'WO-AXH045-CM12', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'CM', 
    priority: 'medium', 
    status: 'completed', 
    description: 'Servo axis 8 ballscrew lubrication and inspection', 
    requestedBy: 'Predictive Maintenance', 
    assignee: 'Tech Team B', 
    dueDate: '2024-05-18', 
    completedDate: '2024-05-18', 
    verifiedBy: 'K. Lee', 
    laborHours: 2.0, 
    linkedComponentId: 'C008',
    tasks: [
      { description: 'Lock out machine and verify zero energy state', status: 'pass', notes: 'LOTO tag #4521 applied' },
      { description: 'Remove ballscrew protective covers', status: 'pass' },
      { description: 'Inspect ballscrew for wear or damage', status: 'pass', notes: 'No visible wear, backlash within spec' },
      { description: 'Clean old grease from ballscrew and nut', status: 'pass', notes: 'Used isopropyl alcohol' },
      { description: 'Apply fresh lubrication (Mobilith SHC 220)', status: 'pass', notes: 'Applied 15g to nut' },
      { description: 'Manually operate axis through full travel', status: 'pass', notes: 'Smooth operation confirmed' },
      { description: 'Reinstall protective covers', status: 'pass', notes: 'All fasteners torqued to spec' },
      { description: 'Test axis at various speeds', status: 'pass', notes: 'No abnormal noise or vibration' },
      { description: 'Verify encoder position accuracy', status: 'pass', notes: 'Repeatability: +/- 0.005mm' },
      { description: 'Document findings and update CMMS', status: 'pass', notes: 'Next lubrication due: Nov 2024' },
    ],
    evidence: [
      'Ballscrew_Inspection_Photos.pdf',
      'Lubrication_Record_2024-05-18.pdf'
    ]
  },
  { 
    id: 'WO-AXH045-CM11', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'CM', 
    priority: 'high', 
    status: 'completed', 
    description: 'Clamp Unit A cylinder replacement - pressure drop issue', 
    requestedBy: 'Floor Supervisor', 
    assignee: 'Tech Team A', 
    dueDate: '2024-04-25', 
    completedDate: '2024-04-25', 
    verifiedBy: 'J. Smith', 
    laborHours: 3.5, 
    linkedComponentId: 'C002', 
    partsUsed: [
      { partNumber: 'CDQ2B50-25DCMZ', qty: 1, lot: 'LOT-2024-041' }
    ],
    tasks: [
      { description: 'Troubleshoot clamp pressure issue', status: 'pass', notes: 'Found internal seal failure in cylinder' },
      { description: 'Lock out machine and depressurize air system', status: 'pass', notes: 'System pressure verified 0 PSI' },
      { description: 'Remove failed cylinder CDQ2B50-25DCMZ', status: 'pass', notes: 'Seal damage confirmed on disassembly' },
      { description: 'Install new cylinder from stock', status: 'pass', notes: 'New cylinder S/N: CDQ-2024-0425' },
      { description: 'Connect pneumatic lines and verify routing', status: 'pass', notes: 'Lines secured with P-clips' },
      { description: 'Pressurize system and check for leaks', status: 'pass', notes: 'No leaks at 90 PSI' },
      { description: 'Adjust clamp force to specification', status: 'pass', notes: 'Set to 485N per work instruction' },
      { description: 'Test clamp operation 20 cycles', status: 'pass', notes: 'Consistent force, no drift detected' },
      { description: 'Run production test parts', status: 'pass', notes: '5 parts produced - all within spec' },
      { description: 'Update spare parts inventory', status: 'pass', notes: 'Reorder point triggered for CDQ2B50-25DCMZ' },
    ],
    evidence: [
      'Failed_Cylinder_Photos.pdf',
      'Clamp_Force_Calibration_2024-04-25.xlsx',
      'Test_Parts_Dimensional_Report.pdf'
    ]
  },
  { 
    id: 'WO-AXH045-Q2', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'Calibration', 
    priority: 'high', 
    status: 'completed', 
    description: 'Semi-annual calibration and alignment verification', 
    requestedBy: 'Quality Dept', 
    assignee: 'Calibration Team', 
    dueDate: '2024-04-10', 
    completedDate: '2024-04-10', 
    verifiedBy: 'Quality Manager', 
    laborHours: 6.0,
    tasks: [
      { description: 'Verify calibration equipment certificates', status: 'pass', notes: 'Laser interferometer cert valid until Dec 2024' },
      { description: 'Set up laser measurement system', status: 'pass', notes: 'Renishaw XL-80 system used' },
      { description: 'Measure X-axis positioning accuracy', status: 'pass', notes: 'Max error: 0.008mm, within +/-0.010mm spec' },
      { description: 'Measure Y-axis positioning accuracy', status: 'pass', notes: 'Max error: 0.006mm, within spec' },
      { description: 'Measure Z-axis positioning accuracy', status: 'pass', notes: 'Max error: 0.009mm, within spec' },
      { description: 'Check rotary axis positioning', status: 'pass', notes: 'Max error: 0.015°, within +/-0.020° spec' },
      { description: 'Verify vision system calibration', status: 'pass', notes: 'Pattern recognition: 98.5% accuracy' },
      { description: 'Check clamp force calibration', status: 'pass', notes: 'Force gauge: 487N (spec 450-500N)' },
      { description: 'Measure and record perpendicularity', status: 'pass', notes: 'X-Y: 0.004mm/300mm' },
      { description: 'Test repeatability with 10 cycles', status: 'pass', notes: 'Std dev: 0.003mm across all axes' },
      { description: 'Generate calibration certificates', status: 'pass', notes: 'Certificates uploaded to quality system' },
      { description: 'Update machine calibration due date', status: 'pass', notes: 'Next calibration due: Oct 2024' },
    ],
    evidence: [
      'Calibration_Certificate_X_Axis.pdf',
      'Calibration_Certificate_Y_Axis.pdf',
      'Calibration_Certificate_Z_Axis.pdf',
      'Vision_System_Validation_Report.pdf',
      'Laser_Measurement_Data_2024-04-10.xlsx'
    ]
  },
  { 
    id: 'WO-AXH045-CM08', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'CM', 
    priority: 'low', 
    status: 'completed', 
    description: 'Vision camera lens cleaning and inspection', 
    requestedBy: 'Quality Dept', 
    assignee: 'Tech Team C', 
    dueDate: '2024-02-28', 
    completedDate: '2024-02-28', 
    verifiedBy: 'Quality Tech', 
    laborHours: 1.0, 
    linkedComponentId: 'C006',
    tasks: [
      { description: 'Power down vision system safely', status: 'pass' },
      { description: 'Remove protective camera housing', status: 'pass' },
      { description: 'Inspect lens for scratches or damage', status: 'pass', notes: 'Minor dust accumulation only' },
      { description: 'Clean lens with approved optical cleaner', status: 'pass', notes: 'Used Zeiss lens cleaning solution' },
      { description: 'Check LED ring light for failures', status: 'pass', notes: 'All LEDs operational' },
      { description: 'Reinstall camera housing', status: 'pass' },
      { description: 'Power up and test image quality', status: 'pass', notes: 'Edge detection improved by 12%' },
      { description: 'Run vision calibration routine', status: 'pass', notes: 'Calibration successful on first attempt' },
    ],
    evidence: [
      'Vision_Camera_Before_After_Photos.pdf',
      'Image_Quality_Comparison.pdf'
    ]
  },
  { 
    id: 'WO-AXH045-Q1', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    type: 'PM', 
    priority: 'medium', 
    status: 'completed', 
    description: 'Q1 2024 Preventive maintenance', 
    requestedBy: 'Maintenance Schedule', 
    assignee: 'Tech Team A', 
    dueDate: '2024-01-15', 
    completedDate: '2024-01-15', 
    verifiedBy: 'M. Johnson', 
    laborHours: 5.0,
    tasks: [
      { description: 'Safety lockout/tagout verification', status: 'pass' },
      { description: 'Visual inspection of all guards and safety devices', status: 'pass' },
      { description: 'Check emergency stop functionality', status: 'pass' },
      { description: 'Inspect pneumatic system for leaks', status: 'pass' },
      { description: 'Check air pressure regulators (90 PSI nominal)', status: 'pass' },
      { description: 'Lubricate all linear guides and ballscrews', status: 'pass' },
      { description: 'Inspect servo motor encoders for damage', status: 'pass' },
      { description: 'Verify vision system lighting and camera focus', status: 'pass' },
      { description: 'Clean and calibrate vision cameras', status: 'pass' },
      { description: 'Check clamp cylinder operation and force', status: 'pass' },
      { description: 'Inspect all wire harnesses for wear', status: 'pass' },
      { description: 'Tighten electrical connections in control cabinet', status: 'pass' },
      { description: 'Check PLC battery voltage (>3.0V required)', status: 'pass', notes: 'Voltage: 3.22V' },
      { description: 'Backup PLC program and verify against master', status: 'pass' },
      { description: 'Test all axis home positions and limits', status: 'pass' },
      { description: 'Run production test cycle and verify quality', status: 'pass' },
      { description: 'Update maintenance log and attach photos', status: 'pass' },
    ]
  },
  
  // Other machines
  { 
    id: 'WO001', 
    machineId: 'AXH057', 
    machineName: 'AXH057', 
    type: 'Emergency', 
    priority: 'critical', 
    status: 'in-progress', 
    description: 'Replace pneumatic gripper assembly', 
    requestedBy: 'Floor Supervisor', 
    assignee: 'Tech Team A', 
    dueDate: '2024-10-03',
    tasks: [
      { description: 'Diagnose gripper failure mode', status: 'pass', notes: 'Solenoid valve failure confirmed' },
      { description: 'Order replacement gripper assembly', status: 'pass', notes: 'Part ordered, ETA 2 hours' },
      { description: 'Lock out machine and depressurize system', status: 'pass' },
      { description: 'Remove failed gripper assembly', status: 'pass' },
      { description: 'Install new gripper assembly', status: 'pending' },
      { description: 'Connect pneumatic and electrical connections', status: 'pending' },
      { description: 'Test gripper operation', status: 'pending' },
      { description: 'Run production test cycle', status: 'pending' },
    ]
  },
  { 
    id: 'WO002', 
    machineId: 'ZMH007', 
    machineName: 'ZMH007', 
    type: 'CM', 
    priority: 'high', 
    status: 'open', 
    description: 'Laser alignment and calibration', 
    requestedBy: 'Quality Dept', 
    assignee: 'Tech Team B', 
    dueDate: '2024-10-05',
    tasks: [
      { description: 'Verify laser safety procedures', status: 'pending' },
      { description: 'Set up alignment targets', status: 'pending' },
      { description: 'Check laser beam alignment', status: 'pending' },
      { description: 'Adjust mirrors if needed', status: 'pending' },
      { description: 'Verify focal distance', status: 'pending' },
      { description: 'Run mark quality test pattern', status: 'pending' },
      { description: 'Adjust power settings if needed', status: 'pending' },
      { description: 'Document final settings', status: 'pending' },
    ]
  },
  { 
    id: 'WO003', 
    machineId: 'AXH064', 
    machineName: 'AXH064', 
    type: 'PM', 
    priority: 'medium', 
    status: 'in-progress', 
    description: 'Quarterly preventive maintenance', 
    requestedBy: 'Maintenance Schedule', 
    assignee: 'Tech Team A', 
    dueDate: '2024-10-02',
    tasks: [
      { description: 'Safety lockout/tagout verification', status: 'pass' },
      { description: 'Visual inspection of all guards', status: 'pass' },
      { description: 'Check emergency stop functionality', status: 'pass' },
      { description: 'Inspect pneumatic system', status: 'pass' },
      { description: 'Lubricate linear guides', status: 'pass' },
      { description: 'Check servo motors', status: 'pass' },
      { description: 'Verify vision system', status: 'pending' },
      { description: 'Test all axes', status: 'pending' },
      { description: 'Run production test', status: 'pending' },
    ]
  },
  { 
    id: 'WO004', 
    machineId: 'AXH053', 
    machineName: 'AXH053', 
    type: 'PM', 
    priority: 'medium', 
    status: 'in-progress', 
    description: 'Tooling inspection and replacement', 
    requestedBy: 'Maintenance Schedule', 
    assignee: 'Tech Team C', 
    dueDate: '2024-10-04',
    tasks: [
      { description: 'Remove retainer tooling', status: 'pass' },
      { description: 'Inspect for wear and damage', status: 'pass', notes: 'Wear found on punch tips' },
      { description: 'Measure critical dimensions', status: 'pass' },
      { description: 'Order replacement tooling', status: 'pass' },
      { description: 'Install new tooling', status: 'pending' },
      { description: 'Verify alignment', status: 'pending' },
      { description: 'Run test parts', status: 'pending' },
    ]
  },
  { 
    id: 'WO005', 
    machineId: 'HSR25', 
    machineName: 'HSR25 Measurement', 
    type: 'Calibration', 
    priority: 'high', 
    status: 'open', 
    description: 'CMM probe recalibration', 
    requestedBy: 'Quality Dept', 
    assignee: 'Calibration Team', 
    dueDate: '2024-10-06',
    tasks: [
      { description: 'Verify calibration sphere certificate', status: 'pending' },
      { description: 'Clean CMM table and probe', status: 'pending' },
      { description: 'Mount calibration sphere', status: 'pending' },
      { description: 'Run probe calibration routine', status: 'pending' },
      { description: 'Verify repeatability', status: 'pending' },
      { description: 'Generate calibration certificate', status: 'pending' },
    ]
  },

  // --- Production Floor Work Orders ---
  {
    id: 'WO-BG002-PM1',
    machineId: 'BG002',
    machineName: 'Block Grinder 2',
    type: 'PM',
    priority: 'medium',
    status: 'open',
    description: 'Quarterly PM - spindle and wheel dressing',
    requestedBy: 'Maintenance Schedule',
    assignee: 'Grinding Team',
    dueDate: '2025-10-10',
    tasks: [
      { description: 'Inspect spindle bearings', status: 'pending' },
      { description: 'Dress grinding wheel', status: 'pending' },
      { description: 'Verify coolant flow rate', status: 'pending' },
    ]
  },
  {
    id: 'WO-DRL002-EM1',
    machineId: 'DRL002',
    machineName: 'Drill Cell 2',
    type: 'Emergency',
    priority: 'critical',
    status: 'in-progress',
    description: 'Resolve spindle overheat condition',
    requestedBy: 'Production Supervisor',
    assignee: 'Machining Team',
    dueDate: '2025-10-02',
    linkedEventId: 'E-DRL002-001',
    tasks: [
      { description: 'Check spindle cooling circuit', status: 'pass' },
      { description: 'Replace clogged coolant filter', status: 'pass' },
      { description: 'Thermal test at 6000 RPM', status: 'pending' },
    ]
  },
  {
    id: 'WO-WSH002-CM1',
    machineId: 'WSH002',
    machineName: 'Parts Washer 2',
    type: 'CM',
    priority: 'high',
    status: 'open',
    description: 'Replace main pump motor and verify flow',
    requestedBy: 'Maintenance',
    assignee: 'Utilities Team',
    dueDate: '2025-10-03',
    linkedEventId: 'E-WSH002-001',
    tasks: [
      { description: 'Lockout/tagout verification', status: 'pending' },
      { description: 'Remove failed motor', status: 'pending' },
      { description: 'Install replacement and align', status: 'pending' },
      { description: 'Test flow and leaks', status: 'pending' },
    ]
  },
  {
    id: 'WO-CUT001-CAL1',
    machineId: 'CUT001',
    machineName: 'Cutting Line A',
    type: 'Calibration',
    priority: 'medium',
    status: 'open',
    description: 'Blade height calibration and verification',
    requestedBy: 'Quality',
    assignee: 'Cutting Team',
    dueDate: '2025-10-07',
    tasks: [
      { description: 'Measure blade height across table', status: 'pending' },
      { description: 'Adjust to spec +/-0.2 mm', status: 'pending' },
      { description: 'Run sample cut and inspect', status: 'pending' },
    ]
  },

  // Additional Production Maintenance
  {
    id: 'WO-INJ001-PM1',
    machineId: 'INJ001',
    machineName: 'Injection Molder 180T',
    type: 'PM',
    priority: 'medium',
    status: 'open',
    description: 'Monthly PM - check heaters, thermocouples, and hydraulic lines',
    requestedBy: 'Maintenance Schedule',
    assignee: 'Plastics Team',
    dueDate: '2025-10-08',
    tasks: [
      { description: 'Inspect heater bands', status: 'pending' },
      { description: 'Verify barrel zone temps', status: 'pending' },
      { description: 'Check for hydraulic leaks', status: 'pending' },
    ]
  },
  {
    id: 'WO-STR002-CM1',
    machineId: 'STR002',
    machineName: 'Straightener B',
    type: 'CM',
    priority: 'high',
    status: 'in-progress',
    description: 'Replace worn guide rollers',
    requestedBy: 'Production',
    assignee: 'Forming Team',
    dueDate: '2025-10-04',
    tasks: [
      { description: 'Lockout/tagout', status: 'pass' },
      { description: 'Remove roller set', status: 'pass' },
      { description: 'Install new rollers and align', status: 'pending' },
    ]
  },
  {
    id: 'WO-CNC002-EM1',
    machineId: 'CNC002',
    machineName: 'CNC Cutter 2',
    type: 'Emergency',
    priority: 'critical',
    status: 'open',
    description: 'Axis Y drive alarm 414 - following error',
    requestedBy: 'Shift Lead',
    assignee: 'CNC Team',
    dueDate: '2025-10-02',
    tasks: [
      { description: 'Check servo drive error history', status: 'pending' },
      { description: 'Inspect ballscrew/end bearings', status: 'pending' },
      { description: 'Run backlash compensation test', status: 'pending' },
    ]
  },
  {
    id: 'WO-CUT002-PM1',
    machineId: 'CUT002',
    machineName: 'Cutting Line B',
    type: 'PM',
    priority: 'low',
    status: 'open',
    description: 'Weekly lubrication and belt inspection',
    requestedBy: 'Maintenance',
    assignee: 'Cutting Team',
    dueDate: '2025-10-06',
    tasks: [
      { description: 'Grease idler bearings', status: 'pending' },
      { description: 'Inspect drive belt wear', status: 'pending' },
      { description: 'Check guard interlocks', status: 'pending' },
    ]
  },
  {
    id: 'WO-BG001-CAL1',
    machineId: 'BG001',
    machineName: 'Block Grinder 1',
    type: 'Calibration',
    priority: 'medium',
    status: 'open',
    description: 'Calibrate infeed axis and verify position',
    requestedBy: 'Quality',
    assignee: 'Grinding Team',
    dueDate: '2025-10-09',
    tasks: [
      { description: 'Set up dial indicator', status: 'pending' },
      { description: 'Move axis to reference points', status: 'pending' },
      { description: 'Record and adjust parameters', status: 'pending' },
    ]
  },
  {
    id: 'WO-WSH001-CM1',
    machineId: 'WSH001',
    machineName: 'Parts Washer 1',
    type: 'CM',
    priority: 'medium',
    status: 'open',
    description: 'Replace spray nozzles and clean manifold',
    requestedBy: 'Utilities',
    assignee: 'Utilities Team',
    dueDate: '2025-10-05',
    tasks: [
      { description: 'Isolate water supply', status: 'pending' },
      { description: 'Remove old nozzles', status: 'pending' },
      { description: 'Install new nozzles and test', status: 'pending' },
    ]
  },
  {
    id: 'WO-DRL001-PM1',
    machineId: 'DRL001',
    machineName: 'Drill Cell 1',
    type: 'PM',
    priority: 'medium',
    status: 'open',
    description: 'Change coolant filter and verify pressure',
    requestedBy: 'Maintenance',
    assignee: 'Machining Team',
    dueDate: '2025-10-06',
    tasks: [
      { description: 'Replace filter cartridge', status: 'pending' },
      { description: 'Prime system and test', status: 'pending' },
      { description: 'Log pressure readings', status: 'pending' },
    ]
  },
  {
    id: 'WO-CNC001-PM2',
    machineId: 'CNC001',
    machineName: 'CNC Cutter 1',
    type: 'PM',
    priority: 'medium',
    status: 'completed',
    description: 'Grease linear guides and clean way covers',
    requestedBy: 'Maintenance',
    assignee: 'CNC Team',
    dueDate: '2025-09-30',
    completedDate: '2025-09-30',
    tasks: [
      { description: 'Grease X/Y/Z guides', status: 'pass' },
      { description: 'Clean way covers', status: 'pass' },
      { description: 'Run movement test', status: 'pass' },
    ]
  },
];

export const documents: Document[] = [
  // AXH045 Documents
  { id: 'D001', machineId: 'AXH045', machineName: 'AXH045', type: 'Program Backup', name: 'AXH045_PLC_Backup_20240915.zip', uploadDate: '2024-09-15', fileUrl: '#', version: 'v2.3.1', controller: 'GXWorks3', createdBy: 'J. Smith', releaseState: 'approved' },
  { id: 'D001b', machineId: 'AXH045', machineName: 'AXH045', type: 'Program Backup', name: 'AXH045_PLC_Backup_20240801.zip', uploadDate: '2024-08-01', fileUrl: '#', version: 'v2.3.0', controller: 'GXWorks3', createdBy: 'J. Smith', releaseState: 'approved' },
  { id: 'D001c', machineId: 'AXH045', machineName: 'AXH045', type: 'Program Backup', name: 'AXH045_PLC_Backup_20240615.zip', uploadDate: '2024-06-15', fileUrl: '#', version: 'v2.2.8', controller: 'GXWorks3', createdBy: 'K. Lee', releaseState: 'approved' },
  { id: 'D002', machineId: 'AXH045', machineName: 'AXH045', type: 'Drawings', name: 'AXH045_Electrical_Schematic.pdf', uploadDate: '2023-05-10', fileUrl: '#', revision: 'Rev C', approvedBy: 'Engineering' },
  { id: 'D002b', machineId: 'AXH045', machineName: 'AXH045', type: 'Drawings', name: 'AXH045_Mechanical_Layout.pdf', uploadDate: '2023-05-10', fileUrl: '#', revision: 'Rev B', approvedBy: 'Engineering' },
  { id: 'D002c', machineId: 'AXH045', machineName: 'AXH045', type: 'Drawings', name: 'AXH045_Pneumatic_Schematic.pdf', uploadDate: '2023-05-10', fileUrl: '#', revision: 'Rev C', approvedBy: 'Engineering' },
  { id: 'D003a', machineId: 'AXH045', machineName: 'AXH045', type: 'Operator Manual', name: 'AXH045_Operation_Manual_v3.2.pdf', uploadDate: '2024-03-20', fileUrl: '#', version: 'v3.2', approvedBy: 'Training Dept' },
  { id: 'D003b', machineId: 'AXH045', machineName: 'AXH045', type: 'Operator Manual', name: 'AXH045_Maintenance_Procedures.pdf', uploadDate: '2024-01-15', fileUrl: '#', version: 'v2.1', approvedBy: 'Maintenance Mgr' },
  { id: 'D003c', machineId: 'AXH045', machineName: 'AXH045', type: 'Operator Manual', name: 'AXH045_Troubleshooting_Guide.pdf', uploadDate: '2024-05-10', fileUrl: '#', version: 'v1.5', approvedBy: 'Engineering' },
  
  // Other machines
  { id: 'D003', machineId: 'AXH063', machineName: 'AXH063', type: 'Operator Manual', name: 'AXH063_Operation_Manual.pdf', uploadDate: '2023-06-20', fileUrl: '#' },
  { id: 'D004', machineId: 'AXH057', machineName: 'AXH057', type: 'Program Backup', name: 'AXH057_PLC_Backup_20240310.zip', uploadDate: '2024-03-10', fileUrl: '#' },
  { id: 'D005', machineId: 'ZMH003', machineName: 'ZMH003', type: 'Operator Manual', name: 'Laser_Marking_Operation_Guide.pdf', uploadDate: '2023-08-15', fileUrl: '#' },
  { id: 'D006', machineId: 'HSR25', machineName: 'HSR25 Measurement', type: 'Program Backup', name: 'HSR25_CMM_Program_Backup.zip', uploadDate: '2024-09-29', fileUrl: '#' },
  { id: 'D007', machineId: 'AXH032', machineName: 'AXH032', type: 'Drawings', name: 'AXH032_Mechanical_Drawing.pdf', uploadDate: '2024-07-12', fileUrl: '#' },
  { id: 'D008', machineId: 'AXH064', machineName: 'AXH064', type: 'Operator Manual', name: 'AXH064_Operator_Guide.pdf', uploadDate: '2024-08-20', fileUrl: '#' },
  { id: 'D009', machineId: 'ZMH004', machineName: 'ZMH004', type: 'Program Backup', name: 'ZMH004_Laser_Program_v2.3.zip', uploadDate: '2024-09-10', fileUrl: '#' },
  { id: 'D010', machineId: 'AXH031', machineName: 'AXH031', type: 'Drawings', name: 'AXH031_Pneumatic_Schematic.pdf', uploadDate: '2023-11-15', fileUrl: '#' },
  
  // --- Production Floor Documents ---
  { id: 'D-BG001-PRG', machineId: 'BG001', machineName: 'Block Grinder 1', type: 'Program Backup', name: 'BG001_Program_Backup_20241002.zip', uploadDate: '2024-10-02', fileUrl: '#', version: 'v1.4', controller: 'Fanuc 31i', createdBy: 'Tech A', releaseState: 'approved' },
  { id: 'D-CUT001-PRG', machineId: 'CUT001', machineName: 'Cutting Line A', type: 'Program Backup', name: 'CUT001_Cutting_Params_20241002.json', uploadDate: '2024-10-02', fileUrl: '#', version: 'v3.1', controller: 'Siemens S7', createdBy: 'Tech B', releaseState: 'approved' },
  { id: 'D-DRL002-DRW', machineId: 'DRL002', machineName: 'Drill Cell 2', type: 'Drawings', name: 'DRL002_Spindle_Cooling_Schematic.pdf', uploadDate: '2024-10-02', fileUrl: '#', revision: 'Rev A', approvedBy: 'Engineering' },
  { id: 'D-WSH002-MAN', machineId: 'WSH002', machineName: 'Parts Washer 2', type: 'Operator Manual', name: 'WSH002_Pump_Motor_Replacement_Guide.pdf', uploadDate: '2024-10-02', fileUrl: '#', version: 'v1.0', approvedBy: 'Maintenance Mgr' },
  { id: 'D-CNC001-PRG', machineId: 'CNC001', machineName: 'CNC Cutter 1', type: 'Program Backup', name: 'CNC001_Fanuc_Params_20241002.zip', uploadDate: '2024-10-02', fileUrl: '#', version: 'v1.4', controller: 'Fanuc 31i', createdBy: 'Tech C', releaseState: 'approved' },
];

export const ecos: ECO[] = [
  // AXH045 ECOs
  { 
    id: 'ECO001', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    number: 'ECO-2024-045', 
    title: 'S7-1500 Firmware Upgrade', 
    type: 'Software', 
    status: 'effective', 
    description: 'Upgrade PLC firmware to S7-1500 v2.9 to address safety circuit timing issues and improve communication reliability. This update includes improved diagnostics, enhanced safety monitoring, and faster cycle times.', 
    reason: 'safety', 
    requestedBy: 'J. Smith', 
    date: '2024-08-15',
    approvers: ['Safety Manager - T. Williams', 'Engineering Manager - R. Davis', 'Production Manager - S. Chen'],
    impactedDocuments: ['D001', 'D003a'],
    impactedSettings: ['SET001', 'SET002'],
    effectiveFrom: '2024-08-20',
    rollbackPlan: 'Restore from backup v2.2.8 if issues detected within 48 hours. Keep backup PLC on-site during implementation. Schedule rollback window for off-hours if needed.',
    attachments: ['ECO-2024-045_Firmware_Release_Notes.pdf', 'ECO-2024-045_Test_Results.xlsx', 'ECO-2024-045_Safety_Analysis.pdf']
  },
  { 
    id: 'ECO-2024-032', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    number: 'ECO-2024-032', 
    title: 'Vision System Calibration Enhancement', 
    type: 'Process', 
    status: 'effective', 
    description: 'Update vision camera calibration procedure to improve part detection accuracy by 15%. New calibration routine includes advanced lighting compensation and multi-point reference validation.', 
    reason: 'quality', 
    requestedBy: 'Quality Dept - L. Anderson', 
    date: '2024-06-10',
    approvers: ['Quality Manager - M. Thompson', 'Production Manager - S. Chen'],
    impactedComponents: ['C005', 'C006'],
    impactedDocuments: ['D003a', 'D003c'],
    effectiveFrom: '2024-06-15',
    rollbackPlan: 'Revert to previous calibration parameters stored in backup configuration file',
    attachments: ['ECO-2024-032_Calibration_Procedure.pdf', 'ECO-2024-032_Validation_Data.xlsx'],
    partsAssociated: [{ partNumber: 'CAL-KIT-001', qty: 1 }]
  },
  { 
    id: 'ECO-2024-018', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    number: 'ECO-2024-018', 
    title: 'Torque Limit Adjustment', 
    type: 'Process', 
    status: 'effective', 
    description: 'Adjust maximum torque limit from 45 Nm to 50 Nm for improved assembly quality on HSR35 blocks. This change addresses customer feedback regarding assembly tightness and reduces warranty claims.', 
    reason: 'quality', 
    requestedBy: 'Engineering - P. Martinez', 
    date: '2024-03-20',
    approvers: ['Engineering Manager - R. Davis', 'Production Manager - S. Chen', 'Quality Manager - M. Thompson'],
    impactedSettings: ['SET004'],
    impactedDocuments: ['D003a'],
    effectiveFrom: '2024-03-25',
    rollbackPlan: 'Reset torque parameter to 45 Nm if defect rate increases beyond 2%',
    attachments: ['ECO-2024-018_Torque_Study.pdf', 'ECO-2024-018_Customer_Feedback.pdf']
  },
  { 
    id: 'ECO-2023-087', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    number: 'ECO-2023-087', 
    title: 'Clamp Force Optimization', 
    type: 'Hardware', 
    status: 'closed', 
    description: 'Install upgraded clamp cylinders with adjustable force control for better part handling. New cylinders feature integrated pressure sensors and software-controlled force adjustment.', 
    reason: 'quality', 
    requestedBy: 'K. Lee', 
    date: '2023-11-05',
    approvers: ['Engineering Manager - R. Davis'],
    impactedComponents: ['C001', 'C002', 'C003'],
    impactedSettings: ['SET006'],
    partsAssociated: [
      { partNumber: 'SMC-MHZ2-16D', qty: 2 },
      { partNumber: 'CDQ2B50-25DCMZ', qty: 4 }
    ],
    effectiveFrom: '2023-11-10',
    rollbackPlan: 'Reinstall original cylinders if force control issues occur',
    attachments: ['ECO-2023-087_Installation_Guide.pdf', 'ECO-2023-087_BOM.xlsx']
  },
  { 
    id: 'ECO-2024-105', 
    machineId: 'AXH045', 
    machineName: 'AXH045', 
    number: 'ECO-2024-105', 
    title: 'OPC UA Integration', 
    type: 'Software', 
    status: 'review', 
    description: 'Implement OPC UA server for real-time production monitoring and MES integration. This will enable Industry 4.0 capabilities including real-time dashboards, predictive maintenance alerts, and automated data collection for SPC analysis.', 
    reason: 'capacity', 
    requestedBy: 'IT Department - A. Kumar', 
    date: '2024-09-25',
    approvers: ['IT Manager - D. Foster', 'Engineering Manager - R. Davis', 'Production Manager - S. Chen'],
    impactedSettings: ['SET009'],
    impactedDocuments: ['D001'],
    rollbackPlan: 'Disable OPC UA server and revert to current data collection methods. No impact on machine operation.',
    attachments: ['ECO-2024-105_Architecture_Diagram.pdf', 'ECO-2024-105_Data_Points.xlsx', 'ECO-2024-105_Security_Plan.pdf']
  },
  
  // Other machines
  { 
    id: 'ECO002', 
    machineId: 'ZMH003', 
    machineName: 'ZMH003', 
    number: 'ECO-2024-078', 
    title: 'Vision System Addition', 
    type: 'Hardware', 
    status: 'review', 
    description: 'Add vision system for automatic mark quality verification. System will detect incomplete marks, positional errors, and character legibility issues in real-time.', 
    reason: 'quality', 
    requestedBy: 'M. Johnson', 
    date: '2024-09-20',
    approvers: ['Quality Manager - M. Thompson', 'Engineering Manager - R. Davis'],
    impactedComponents: ['C011'],
    partsAssociated: [
      { partNumber: 'KEYENCE-CV-X150', qty: 1 },
      { partNumber: 'LENS-25MM-F2.8', qty: 1 },
      { partNumber: 'LED-RING-LIGHT', qty: 1 }
    ],
    rollbackPlan: 'Vision system can be bypassed through software flag if issues arise. Manual inspection will continue as backup.',
    attachments: ['ECO-2024-078_Vision_Specs.pdf', 'ECO-2024-078_ROI_Analysis.xlsx']
  },
  { 
    id: 'ECO003', 
    machineId: 'AXH057', 
    machineName: 'AXH057', 
    number: 'ECO-2024-092', 
    title: 'Gripper System Upgrade', 
    type: 'Hardware', 
    status: 'draft', 
    description: 'Replace pneumatic gripper system with servo-controlled electric grippers for improved precision, reduced air consumption, and better force feedback. Expected energy savings of 40% on pneumatic costs.', 
    reason: 'cost', 
    requestedBy: 'K. Lee', 
    date: '2024-09-25',
    approvers: ['Engineering Manager - R. Davis'],
    impactedComponents: ['C009'],
    partsAssociated: [
      { partNumber: 'SCHUNK-EGP-64', qty: 2 },
      { partNumber: 'SERVO-CTRL-001', qty: 2 }
    ],
    rollbackPlan: 'Keep existing pneumatic system intact until servo system is fully validated. Parallel installation for 2-week trial period.',
    attachments: ['ECO-2024-092_Cost_Analysis.xlsx', 'ECO-2024-092_Technical_Comparison.pdf']
  },

  // Production ECOs
  {
    id: 'ECO-PROD-BG001-001',
    machineId: 'BG001',
    machineName: 'Block Grinder 1',
    number: 'ECO-2025-001',
    title: 'Coolant System Upgrade',
    type: 'Hardware',
    status: 'review',
    description: 'Upgrade coolant pump and add flow sensor to prevent low-flow faults.',
    reason: 'quality',
    requestedBy: 'Grinding Team',
    date: '2025-10-02',
    approvers: ['Engineering Manager - R. Davis', 'Maintenance Manager - P. Nguyen'],
    impactedDocuments: ['D-BG001-PRG']
  },
  {
    id: 'ECO-PROD-CUT002-001',
    machineId: 'CUT002',
    machineName: 'Cutting Line B',
    number: 'ECO-2025-002',
    title: 'Blade Guard Redesign',
    type: 'Hardware',
    status: 'draft',
    description: 'Redesign blade guard to improve chip evacuation and reduce rework.',
    reason: 'quality',
    requestedBy: 'Safety',
    date: '2025-10-01',
    approvers: ['Safety Manager - T. Williams']
  },
  {
    id: 'ECO-PROD-DRL001-001',
    machineId: 'DRL001',
    machineName: 'Drill Cell 1',
    number: 'ECO-2025-003',
    title: 'Standardize Drill Program Naming',
    type: 'Documentation',
    status: 'approved',
    description: 'Introduce naming convention and versioning for drill programs.',
    reason: 'cost',
    requestedBy: 'Production',
    date: '2025-09-28',
    approvers: ['Production Manager - S. Chen', 'Engineering - L. Patel']
  },
  {
    id: 'ECO-PROD-INJ002-001',
    machineId: 'INJ002',
    machineName: 'Injection Molder 250T',
    number: 'ECO-2025-004',
    title: 'Cycle Time Optimization Parameters',
    type: 'Process',
    status: 'effective',
    description: 'Adjust injection speed and cooling time to reduce cycle time by 8%.',
    reason: 'capacity',
    requestedBy: 'Process Engineer - A. Kim',
    date: '2025-10-02',
    approvers: ['Quality - M. Thompson', 'Production - S. Chen']
  },
  {
    id: 'ECO-PROD-WSH002-001',
    machineId: 'WSH002',
    machineName: 'Parts Washer 2',
    number: 'ECO-2025-005',
    title: 'Pump Motor Specification Update',
    type: 'Hardware',
    status: 'review',
    description: 'Update pump motor to higher efficiency model and revise wiring diagram.',
    reason: 'cost',
    requestedBy: 'Utilities',
    date: '2025-10-02',
    approvers: ['Maintenance Manager - P. Nguyen', 'Engineering - R. Davis']
  },
  {
    id: 'ECO-PROD-CNC001-001',
    machineId: 'CNC001',
    machineName: 'CNC Cutter 1',
    number: 'ECO-2025-006',
    title: 'Add Soft Limit Warning',
    type: 'Software',
    status: 'review',
    description: 'Implement soft-limit pre-warning to reduce axis following errors.',
    reason: 'safety',
    requestedBy: 'CNC Team',
    date: '2025-10-02',
    approvers: ['IT - A. Kumar', 'Engineering - R. Davis']
  },
];

export const categories = [
  { name: 'AXH Assembly', count: machines.filter(m => m.category === 'AXH Assembly').length },
  { name: 'AXH Retainer', count: machines.filter(m => m.category === 'AXH Retainer').length },
  { name: 'Measurement', count: machines.filter(m => m.category === 'Measurement').length },
  { name: 'Laser Marking', count: machines.filter(m => m.category === 'Laser Marking').length },
  { name: 'Assembly Tables - HSR', count: machines.filter(m => m.category === 'Assembly Tables - HSR').length },
  { name: 'Assembly Tables - SHS', count: machines.filter(m => m.category === 'Assembly Tables - SHS').length },
  { name: 'Block Grinding', count: machines.filter(m => m.category === 'Block Grinding').length },
  { name: 'Cutting', count: machines.filter(m => m.category === 'Cutting').length },
  { name: 'Drilling', count: machines.filter(m => m.category === 'Drilling').length },
  { name: 'Injection Molding', count: machines.filter(m => m.category === 'Injection Molding').length },
  { name: 'Straightening', count: machines.filter(m => m.category === 'Straightening').length },
  { name: 'Wash', count: machines.filter(m => m.category === 'Wash').length },
  { name: 'CNC Cutting', count: machines.filter(m => m.category === 'CNC Cutting').length },
];

export const components: Component[] = [
  // AXH045 Components
  { id: 'C001', machineId: 'AXH045', name: 'Clamp Unit A', type: 'clamp', criticality: 4, vendor: 'SMC', model: 'MHZ2-16D', partNumber: 'SMC-MHZ2-16D', assetTag: 'CLU-A-001', serial: 'SMC12345', expectedLife: '5 years', spareQty: 2, spareLocation: 'Shelf A3' },
  { id: 'C002', machineId: 'AXH045', name: 'Cylinder CDQ2B50-25DCMZ', type: 'cylinder', parentComponentId: 'C001', criticality: 3, vendor: 'SMC', partNumber: 'CDQ2B50-25DCMZ', serial: 'CYL789', spareQty: 3, spareLocation: 'Shelf B1' },
  { id: 'C003', machineId: 'AXH045', name: 'Solenoid SMC SY5120', type: 'solenoid', parentComponentId: 'C001', criticality: 3, vendor: 'SMC', partNumber: 'SY5120-5LZD-01', serial: 'SOL456', spareQty: 5, spareLocation: 'Drawer D2' },
  { id: 'C004', machineId: 'AXH045', name: 'Prox Sensor Keyence', type: 'sensor', parentComponentId: 'C001', criticality: 2, vendor: 'Keyence', partNumber: 'EV-118M', assetTag: 'SENS-001', spareQty: 10, spareLocation: 'Drawer E3' },
  { id: 'C005', machineId: 'AXH045', name: 'Vision Camera', type: 'vision_cam', criticality: 5, vendor: 'Keyence', model: 'CV-X200', partNumber: 'CV-X200', assetTag: 'CAM-001', serial: 'KEY987', expectedLife: '7 years', spareQty: 1, spareLocation: 'Shelf C5' },
  { id: 'C006', machineId: 'AXH045', name: 'Lens 16mm F1.8', type: 'vision_cam', parentComponentId: 'C005', criticality: 3, vendor: 'Computar', partNumber: 'M1614-MP', spareQty: 2, spareLocation: 'Shelf C5' },
  { id: 'C007', machineId: 'AXH045', name: 'Servo Axis 8', type: 'servo_axis', criticality: 5, vendor: 'Mitsubishi', model: 'MR-J4-200A', partNumber: 'MR-J4-200A', assetTag: 'SRV-AX8', serial: 'MIT654', expectedLife: '10 years', spareQty: 1, spareLocation: 'Shelf F2' },
  { id: 'C008', machineId: 'AXH045', name: 'Ballscrew THK BNK2020', type: 'ballscrew', parentComponentId: 'C007', criticality: 4, vendor: 'THK', partNumber: 'BNK2020-3.6', serial: 'THK321', expectedLife: '8 years', spareQty: 1, spareLocation: 'Shelf F3' },

  // AXH057 Components (Machine with current issues)
  { id: 'C009', machineId: 'AXH057', name: 'Pneumatic Gripper Assembly', type: 'clamp', criticality: 5, vendor: 'Schunk', model: 'PGN-plus 64-1', partNumber: 'SCHUNK-PGN64', assetTag: 'GRIP-001', serial: 'SCH999', expectedLife: '5 years', spareQty: 0, spareLocation: 'On Order' },
  { id: 'C010', machineId: 'AXH057', name: 'Valve Bank Assembly', type: 'valve_bank', criticality: 4, vendor: 'Festo', model: 'VTUG-14', partNumber: 'FESTO-VTUG14', assetTag: 'VLV-001', spareQty: 1, spareLocation: 'Shelf A5' },
  
  // ZMH003 Laser Components
  { id: 'C011', machineId: 'ZMH003', name: 'Laser Head', type: 'laser_head', criticality: 5, vendor: 'Keyence', model: 'MD-X1500', partNumber: 'MDX-1500-HEAD', assetTag: 'LSR-HEAD-001', serial: 'KEY111', expectedLife: '15000 hours', spareQty: 0, spareLocation: 'Special Order' },
];

export const machineSettings: MachineSetting[] = [
  // AXH045 Settings - Safety
  { id: 'SET001', machineId: 'AXH045', category: 'Safety', subcategory: 'E-Stops', key: 'estop_zones', value: '4', effectiveFrom: '2024-01-15', changedBy: 'Safety Team' },
  { id: 'SET002', machineId: 'AXH045', category: 'Safety', subcategory: 'Light Curtains', key: 'curtain_height', value: '1800', unit: 'mm', effectiveFrom: '2024-01-15', changedBy: 'Safety Team' },
  { id: 'SET003', machineId: 'AXH045', category: 'Safety', subcategory: 'Interlocks', key: 'interlock_count', value: '6', effectiveFrom: '2024-01-15', changedBy: 'Safety Team' },
  
  // AXH045 Settings - Process
  { id: 'SET004', machineId: 'AXH045', category: 'Process', subcategory: 'Torque Limits', key: 'max_torque', value: '50', unit: 'Nm', effectiveFrom: '2024-03-20', changedBy: 'Engineering', linkedECO: 'ECO-2024-012' },
  { id: 'SET005', machineId: 'AXH045', category: 'Process', subcategory: 'Speed', key: 'axis8_max_speed', value: '2000', unit: 'mm/s', effectiveFrom: '2024-01-15', changedBy: 'Engineering' },
  { id: 'SET006', machineId: 'AXH045', category: 'Process', subcategory: 'Force Limits', key: 'clamp_force', value: '500', unit: 'N', effectiveFrom: '2024-01-15', changedBy: 'Engineering' },
  
  // AXH045 Settings - Communication
  { id: 'SET007', machineId: 'AXH045', category: 'Communication', key: 'plc_ip', value: '192.168.10.45', effectiveFrom: '2024-01-15', changedBy: 'IT' },
  { id: 'SET008', machineId: 'AXH045', category: 'Communication', key: 'hmi_ip', value: '192.168.10.46', effectiveFrom: '2024-01-15', changedBy: 'IT' },
  { id: 'SET009', machineId: 'AXH045', category: 'Communication', key: 'opc_ua_endpoint', value: 'opc.tcp://192.168.10.45:4840', effectiveFrom: '2024-02-10', changedBy: 'IT' },
];

export const productionData: ProductionData[] = [
  // AXH045 Production Data - Today (Oct 2, 2024)
  { id: 'PROD-AXH045-20241002', machineId: 'AXH045', date: '2024-10-02', target: 480, actual: 456, scrap: 8, downtime: 45, cycleTime: 42 },
  // AXH045 Production Data - Recent History
  { id: 'PROD-AXH045-20241001', machineId: 'AXH045', date: '2024-10-01', target: 480, actual: 472, scrap: 5, downtime: 20, cycleTime: 41 },
  { id: 'PROD-AXH045-20240930', machineId: 'AXH045', date: '2024-09-30', target: 480, actual: 465, scrap: 7, downtime: 35, cycleTime: 43 },
  { id: 'PROD-AXH045-20240929', machineId: 'AXH045', date: '2024-09-29', target: 480, actual: 480, scrap: 3, downtime: 0, cycleTime: 40 },
];
