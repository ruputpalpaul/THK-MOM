import { Machine } from '@/types/green-room';

const MACHINE_CODE_DESCRIPTIONS: Record<string, string> = {
  AX: 'Dedicated assembly machine',
  MA: 'Machining center',
  BF: 'Barrel polishing machine',
  MC: 'Nalife rice board',
  BJ: 'Jig bore',
  ME: 'Milling machine',
  BR: 'Broaching machine',
  MG: 'Magnetic polishing machine',
  BU: 'Buffing machine',
  MH: 'Horizontal milling machine',
  DA: 'NC drilling machine',
  MJ: 'Jig milling machine',
  DB: 'Deburring machine',
  MK: 'Keyway milling machine',
  DC: 'Casting equipment',
  MP: 'Planer',
  DF: 'Casting furnace',
  MU: 'Universal milling machine',
  DR: 'Drilling machine',
  MV: 'Vertical milling machine',
  DT: 'Tapping board',
  MW: 'Double head milling machine',
  DW: 'Dedicated drilling machine',
  MX: 'Chamfer machine',
  DX: 'Dedicated tapping board',
  PA: 'Automatic press straightening machine',
  ED: 'Electric discharge machine',
  PR: 'Press machine',
  EG: 'Electrolytic polishing machine',
  PX: 'Press only machine',
  EW: 'Wire cutting machine',
  QA: 'Testing / inspection / measuring equipment',
  GB: 'Reference surface grinder',
  QG: 'Surface plate',
  GC: 'Cylindrical grinder',
  RP: 'Linear processor',
  GD: 'Centerless grinder',
  RS: 'Roll straightener',
  GF: 'Guide groove wrapping machine',
  RT: 'Rolling machine',
  GH: 'Crowning machine',
  RW: 'Twist correction machine',
  GI: 'Internal grinding machine',
  SA: 'Automatic press straightening machine',
  GJ: 'Jig grinder',
  SB: 'Shot blast machine',
  GL: 'Tool grinder',
  SF: 'Super finishing machine',
  GN: 'SP nut groove grinder',
  SG: 'Grindstone cutting machine',
  GP: 'Dedicated grinder',
  SH: 'Shaper',
  GR: 'External grinding machine',
  SL: 'Slotter',
  GQ: 'Spherical grinder',
  SN: 'Sandblasting machine',
  GS: 'Surface grinder',
  SS: 'Cutting machine',
  GT: 'Screw grinder',
  UC: 'Dust collector',
  GV: 'V groove grinder',
  UP: 'Positioning device',
  GX: 'Other grinders',
  WE: 'Weld machine',
  HE: 'Heat treatment furnace / related',
  WL: 'Laser welder',
  HG: 'Gear cutting machine',
  WP: 'Plastic welder',
  HO: 'Honing machine',
  WS: 'Ultrasonic welder',
  IG: 'Nut wrap machine',
  ZC: 'Compressor',
  IJ: 'Injection molding machine',
  ZD: 'Demagnetizer machine',
  IR: 'Robot',
  ZG: 'Belt sander',
  KK: 'Machine / device type',
  ZL: 'Loader',
  LA: 'NC lathe',
  ZM: 'Markers / stamper',
  LC: 'Narai lathe',
  ZP: 'Packing machine',
  LE: 'General purpose lathe',
  ZR: 'Chiller',
  LM: 'Turning center',
  ZS: 'Other cutting machines',
  LP: 'Flat lapping machine',
  ZT: 'Individual tank',
  LV: 'Turning lathe',
  ZW: 'Washing machine',
  LX: 'Only for lathes',
  ZZ: 'Machines not classified',
};

export function getMachineDescriptionFromId(machineId: string): string | undefined {
  if (!machineId) return undefined;
  const code = machineId.slice(0, 2).toUpperCase();
  return MACHINE_CODE_DESCRIPTIONS[code];
}

export function formatMachineDisplayName(machineId: string, fallbackName: string): string {
  const description = getMachineDescriptionFromId(machineId);
  if (!description) return fallbackName ?? machineId;
  return `${machineId} • ${description}`;
}

export function withFormattedMachineName(machine: Machine): Machine {
  const formattedName = formatMachineDisplayName(machine.id, machine.name || machine.id);
  if (formattedName === machine.name) {
    return machine;
  }
  return { ...machine, name: formattedName };
}

