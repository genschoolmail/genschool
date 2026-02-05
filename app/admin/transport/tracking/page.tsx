import LiveMap from "./LiveMap";

export default function TrackingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Tracking</h1>
                <p className="text-muted-foreground">Real-time location of school transport fleet</p>
            </div>
            <LiveMap />
        </div>
    );
}
