import { useEffect, useMemo, useState } from 'react';
import * as api from '@/utils/api';
import { ECO, Event, Machine, ProductionData, WorkOrder } from '@/types/green-room';
import { Card } from '@/components/ui/card';
import { StatusTile } from './StatusTile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart3, Factory, FileText, Server, Wrench, Activity, TrendingUp, Package, Layers } from 'lucide-react';

type PlantAreaKey = 'home' | 'production' | 'green-room' | 'fabrication' | 'shipping';

export function HomeDashboard({ onSelectArea }: { onSelectArea?: (area: PlantAreaKey) => void } = {}) {
	const [machines, setMachines] = useState<Machine[]>([]);
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [ecos, setECOs] = useState<ECO[]>([]);
	const [production, setProduction] = useState<ProductionData[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
						const [m, w, e, p, ev] = await Promise.all([
					api.getMachines(),
					api.getWorkOrders(),
					api.getECOs(),
					api.getProductionData(),
							api.getEvents(),
				]);
				if (!mounted) return;
				setMachines(m);
				setWorkOrders(w);
				setECOs(e);
				setProduction(p);
						setEvents(ev);
			} catch (err) {
				console.error('Failed to load home data', err);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const stats = useMemo(() => {
		const total = machines.length;
		const active = machines.filter(m => m.status === 'active').length;
		const down = machines.filter(m => m.status === 'down').length;
		const maintenance = machines.filter(m => m.status === 'maintenance').length;
		const pendingWOs = workOrders.filter(wo => wo.status !== 'completed').length;
		const ecosInReview = ecos.filter(eco => eco.status === 'review').length;

		const sum = <K extends keyof Machine>(key: K) =>
			machines.reduce((acc, m) => acc + (typeof m[key] === 'number' ? (m[key] as unknown as number) : 0), 0);

		const todayTarget = sum('todayTarget');
		const todayActual = sum('todayActual');
		const todayScrap = sum('todayScrap');

		const oees = machines.map(m => m.oee).filter((v): v is number => typeof v === 'number');
		const avgOEE = oees.length ? Math.round((oees.reduce((a, b) => a + b, 0) / oees.length) * 10) / 10 : undefined;

		// Best-effort: latest production per machine for downtime minutes
		const latestByMachine = new Map<string, ProductionData>();
		for (const rec of production) {
			const prev = latestByMachine.get(rec.machineId);
			if (!prev || new Date(rec.date) > new Date(prev.date)) latestByMachine.set(rec.machineId, rec);
		}
		const totalDowntime = Array.from(latestByMachine.values()).reduce((a, r) => a + (r.downtime || 0), 0);

		return {
			total,
			active,
			down,
			maintenance,
			pendingWOs,
			ecosInReview,
			todayTarget,
			todayActual,
			todayScrap,
			avgOEE,
			totalDowntime,
				planAttainment: todayTarget ? Math.round((todayActual / todayTarget) * 100) : 0,
				uptimeRatio: total ? Math.round((active / total) * 100) : 0,
		};
	}, [machines, workOrders, ecos, production]);

		// Classify machines into high-level plant areas (heuristics; refine when explicit area tags are available)
		const classifyArea = (m: Machine): PlantAreaKey | 'wrap-pack' | 'other' => {
			const cat = (m.category || '').toLowerCase();
			const typ = (m.type || '').toLowerCase();
			if (cat.includes('assembly') || typ.includes('assembly') || cat.includes('retainer')) return 'green-room';
			if (cat.includes('wrap') || cat.includes('pack') || typ.includes('forklift')) return 'shipping';
			// Remaining equipment is treated as fabrication assets
			if (cat || typ) return 'fabrication';
			return 'other';
		};

		const byArea = useMemo(() => {
			const map: Record<PlantAreaKey, Machine[]> = {
				'home': [],
				'production': [],
				'green-room': [],
				'fabrication': [],
				'shipping': [],
			};
			for (const m of machines) {
				const a = classifyArea(m);
				if (a === 'other') continue;
				if (a !== 'home') map[a as PlantAreaKey].push(m);
			}
			map['production'] = [...map['fabrication'], ...map['green-room'], ...map['shipping']];
			return map;
		}, [machines]);

		const makeAreaStats = (list: Machine[]) => {
			const total = list.length;
			const active = list.filter(m => m.status === 'active').length;
			const down = list.filter(m => m.status === 'down').length;
			const maintenance = list.filter(m => m.status === 'maintenance').length;
			const todayTarget = list.reduce((a, m) => a + (m.todayTarget || 0), 0);
			const todayActual = list.reduce((a, m) => a + (m.todayActual || 0), 0);
			const todayScrap = list.reduce((a, m) => a + (m.todayScrap || 0), 0);
			const attainment = todayTarget ? Math.round((todayActual / todayTarget) * 100) : 0;
			return { total, active, down, maintenance, todayTarget, todayActual, todayScrap, attainment };
		};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full bg-gradient-to-br from-gray-50 to-white overflow-auto">
			<div className="p-4 sm:p-6 space-y-8">
					{/* Global KPIs */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
						<StatusTile title="Total Machines" value={stats.total} icon={Server} variant="default" />
						<StatusTile title="Uptime" value={`${stats.uptimeRatio}%`} icon={Activity} variant={stats.uptimeRatio >= 90 ? 'success' : stats.uptimeRatio >= 75 ? 'warning' : 'danger'} subtitle={`${stats.active} active`} />
						<StatusTile title="Plan Attainment" value={`${stats.planAttainment}%`} icon={TrendingUp} variant={stats.planAttainment >= 95 ? 'success' : stats.planAttainment >= 85 ? 'warning' : 'danger'} subtitle={`${stats.todayActual}/${stats.todayTarget}`} />
						<StatusTile title="Scrap Today" value={stats.todayScrap} icon={AlertTriangle} variant={stats.todayScrap > 0 ? 'warning' : 'success'} />
						<StatusTile title="Pending WOs" value={stats.pendingWOs} icon={Wrench} variant={stats.pendingWOs > 3 ? 'warning' : 'default'} />
						<StatusTile title="ECOs in Review" value={stats.ecosInReview} icon={FileText} variant="default" />
					</div>

				{/* Area overview */}
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
					<Card className="p-6 border-2 bg-white">
						<div className="flex items-center gap-3 mb-4">
							<Layers className="w-5 h-5 text-primary" />
							<h3 className="text-lg font-semibold">Production Overview</h3>
							<div className="ml-auto"><Button variant="outline" size="sm" onClick={() => onSelectArea?.('production')}>Open</Button></div>
						</div>
						<AreaStats {...makeAreaStats(byArea['production'])} />
					</Card>
					<Card className="p-6 border-2 bg-white">
						<div className="flex items-center gap-3 mb-4">
							<Factory className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold">Fabrication</h3>
							<div className="ml-auto"><Button variant="outline" size="sm" onClick={() => onSelectArea?.('fabrication')}>View</Button></div>
						</div>
						<AreaStats {...makeAreaStats(byArea['fabrication'])} />
					</Card>
					<Card className="p-6 border-2 bg-white">
						<div className="flex items-center gap-3 mb-4">
							<Factory className="w-5 h-5 text-emerald-600" />
							<h3 className="text-lg font-semibold">Green Room</h3>
							<div className="ml-auto"><Button variant="outline" size="sm" onClick={() => onSelectArea?.('green-room')}>View</Button></div>
						</div>
						<AreaStats {...makeAreaStats(byArea['green-room'])} />
					</Card>
					<Card className="p-6 border-2 bg-white">
						<div className="flex items-center gap-3 mb-4">
							<Package className="w-5 h-5 text-orange-600" />
							<h3 className="text-lg font-semibold">Shipping</h3>
							<div className="ml-auto"><Button variant="outline" size="sm" onClick={() => onSelectArea?.('shipping')}>View</Button></div>
						</div>
						<AreaStats {...makeAreaStats(byArea['shipping'])} />
					</Card>
				</div>

					{/* Today’s production snapshot */}
					<Card className="p-6 border-2 bg-white">
						<div className="flex items-center gap-3 mb-4">
							<BarChart3 className="w-5 h-5 text-blue-600" />
							<h3 className="text-lg font-semibold">Today's Production</h3>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<SummaryStat label="Target" value={stats.todayTarget} />
							<SummaryStat label="Actual" value={stats.todayActual} />
							<SummaryStat label="Plan Attainment" value={`${stats.planAttainment}%`} />
							<SummaryStat label="Avg OEE" value={stats.avgOEE !== undefined ? `${stats.avgOEE}%` : '—'} />
						</div>
					</Card>

					{/* Live issues & maintenance */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="p-6 border-2 bg-white">
							<div className="flex items-center gap-3 mb-4">
								<AlertTriangle className="w-5 h-5 text-rose-600" />
								<h3 className="text-lg font-semibold">Recent Events</h3>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Time</TableHead>
										<TableHead>Machine</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Description</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{events.slice(0, 6).map((ev) => (
										<TableRow key={ev.id}>
											<TableCell className="text-muted-foreground">{ev.timestamp}</TableCell>
											<TableCell>{ev.machineName}</TableCell>
											<TableCell className="capitalize">{ev.type}</TableCell>
											<TableCell className="max-w-[28rem] truncate">{ev.description}</TableCell>
										</TableRow>
									))}
									{events.length === 0 && (
										<TableRow>
											<TableCell colSpan={4} className="text-sm text-muted-foreground">No recent events</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</Card>

						<Card className="p-6 border-2 bg-white">
							<div className="flex items-center gap-3 mb-4">
								<Wrench className="w-5 h-5 text-purple-600" />
								<h3 className="text-lg font-semibold">Open Work Orders</h3>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Machine</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{workOrders.filter(w => w.status !== 'completed').slice(0, 6).map((wo) => (
										<TableRow key={wo.id}>
											<TableCell>{wo.id}</TableCell>
											<TableCell>{wo.machineName}</TableCell>
											<TableCell>{wo.type}</TableCell>
											<TableCell className="capitalize">{wo.status}</TableCell>
										</TableRow>
									))}
									{workOrders.filter(w => w.status !== 'completed').length === 0 && (
										<TableRow>
											<TableCell colSpan={4} className="text-sm text-muted-foreground">No open work orders</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</Card>
					</div>
			</div>
		</div>
	);
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-lg border bg-muted p-4">
			<div className="text-sm text-muted-foreground">{label}</div>
			<div className="text-2xl font-bold text-foreground mt-1">{value}</div>
		</div>
	);
}

function AreaStats({ total, active, down, maintenance, todayTarget, todayActual, todayScrap, attainment }: { total: number; active: number; down: number; maintenance: number; todayTarget: number; todayActual: number; todayScrap: number; attainment: number; }) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<Mini label="Assets" value={total} />
			<Mini label="Uptime" value={total ? `${Math.round((active / total) * 100)}%` : '—'} />
			<Mini label="Target" value={todayTarget} />
			<Mini label="Actual" value={todayActual} />
			<Mini label="Scrap" value={todayScrap} />
			<Mini label="Attainment" value={`${attainment}%`} />
			{(down > 0 || maintenance > 0) && (
				<div className="col-span-2 text-sm text-muted-foreground">{down} down • {maintenance} maintenance</div>
			)}
		</div>
	);
}

function Mini({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-md border bg-muted px-3 py-2">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="text-lg font-semibold mt-0.5">{value}</div>
		</div>
	);
}
