"use client";

import { useState, useEffect, useMemo } from 'react';
import { Users, Siren, Video, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type Alert = {
  id: string;
  type: string;
  severity: 'Critical' | 'Warning';
  location: string;
  message: string;
  timestamp: Date;
};

const predefinedAlerts = [
  { type: 'PPE Violation', severity: 'Critical' as const, location: 'CAM-02', message: 'No Helmet Detected' },
  { type: 'Proximity Alert', severity: 'Warning' as const, location: 'CAM-04', message: 'Worker too close to forklift' },
  { type: 'Ergonomic Risk', severity: 'Warning' as const, location: 'CAM-01', message: 'Improper lifting detected' },
  { type: 'Access Control', severity: 'Critical' as const, location: 'CAM-03', message: 'Unauthorized area entry' },
  { type: 'Spill Detected', severity: 'Warning' as const, location: 'CAM-02', message: 'Liquid spill on floor' },
];

const cameraFeeds = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'];

export default function Dashboard() {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [highlightedCamera, setHighlightedCamera] = useState<string | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomAlertTemplate = predefinedAlerts[Math.floor(Math.random() * predefinedAlerts.length)];
      const newAlert: Alert = {
        ...randomAlertTemplate,
        id: `alert-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 50)); 
      setActiveAlertsCount(prev => prev + 1);

      if (newAlert.severity === 'Critical') {
        setHighlightedCamera(newAlert.location);
        const timer = setTimeout(() => {
          setHighlightedCamera(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => [
    { title: "Workers on Site", value: "78", description: "All workers accounted for", Icon: Users },
    { title: "Active Alerts", value: activeAlertsCount, description: "Real-time incidents", Icon: Siren },
  ], [activeAlertsCount]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <h1 className="text-2xl font-semibold text-foreground">SafeX AI Dashboard</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {stats.map(({ title, value, description, Icon }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Camera Feeds</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {cameraFeeds.map(camId => (
                <Card key={camId} id={camId} className={cn(
                  'transition-all duration-300 overflow-hidden',
                  highlightedCamera === camId && 'border-destructive ring-2 ring-destructive ring-offset-2 ring-offset-background animate-pulse'
                )}>
                  <CardContent className="p-0 aspect-video flex items-center justify-center bg-card-foreground/5 relative">
                    <Video className="h-12 w-12 text-muted-foreground/50" />
                    <span className="absolute bottom-2 left-2 text-sm font-medium bg-background/50 text-foreground px-2 py-1 rounded-md">{camId}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Live Alerts</h2>
              <Card id="alert-feed">
                <ScrollArea className="h-[400px]">
                  <CardContent className="p-4">
                    {alerts.length === 0 && isClient ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground py-16">
                        <p>No active alerts. Monitoring...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isClient && alerts.map(alert => (
                          <div key={alert.id} className={cn(
                            'p-3 rounded-lg border-l-4',
                            alert.severity === 'Critical' ? 'border-destructive bg-destructive/10' : 'border-yellow-400 bg-yellow-400/10',
                          )}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className={cn(
                                  'font-semibold',
                                  alert.severity === 'Critical' ? 'text-destructive' : 'text-yellow-400'
                                )}>{alert.type}</p>
                                <p className="text-sm text-foreground">{alert.message}</p>
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Location: {alert.location}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Predictive Insights</h2>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                   <Activity className="h-5 w-5 text-primary" />
                   <CardTitle className="text-base font-medium">Highest Risk Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our analysis indicates a higher probability of <span className="font-semibold text-accent-foreground">Proximity Alerts</span> in <span className="font-semibold text-accent-foreground">Sector C</span> between <span className="font-semibold text-accent-foreground">3-5 PM</span> today based on historical data and current worker density.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
