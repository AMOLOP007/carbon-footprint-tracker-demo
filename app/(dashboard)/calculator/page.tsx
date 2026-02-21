"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Zap, Car, Truck, Factory, Save, ArrowRight, Loader2, Info, RefreshCcw, Bike, Download, FileText } from "lucide-react";
import { generateReportPDF } from "@/lib/utils/pdf-generator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CalculatorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State for each module
    const [electricity, setElectricity] = useState({ kwh: "", source: "grid" });
    // Advanced Vehicle State
    const [vehicle, setVehicle] = useState({
        class: "car",
        fuel: "petrol",
        efficiency: "8.5", // L/100km default
        distance: ""
    });
    const [shipping, setShipping] = useState({ distance: "", weight: "", mode: "road", frequency: "1" });
    const [supply, setSupply] = useState({ spend: "", category: "manufacturing" });

    // Live Results
    const [results, setResults] = useState({
        electricity: 0,
        vehicle: 0,
        shipping: 0,
        supply: 0
    });

    // Emission Factors (kg CO2e per unit)
    const FACTORS = {
        electricity: { grid: 0.475, solar: 0.041, wind: 0.011, hybrid: 0.243 }, // kg/kWh
        // Fuel Factors (kg CO2e per Liter or kWh) - "God Level" accuracy based on chemistry
        fuel: {
            petrol: 2.31,   // kg CO2/L
            diesel: 2.68,   // kg CO2/L
            hybrid: 1.5,    // Approx composite
            lpg: 1.51,      // kg CO2/L
            cng: 2.75,      // kg CO2/kg
            electric: 0.475 // kg CO2/kWh (using grid factor as proxy for charging)
        },
        shipping: { road: 0.062, rail: 0.022, sea: 0.008, air: 0.602 }, // per ton-km
        supply: { manufacturing: 0.45, services: 0.08, materials: 0.95 }, // per $ spend
    };

    // Default Efficiencies (L/100km or kWh/100km)
    const DEFAULTS = {
        bike: { petrol: 3.5, diesel: 3.0, hybrid: 2.5, electric: 4.0, lpg: 4.0, cng: 3.5 },
        car: { petrol: 8.5, diesel: 7.0, hybrid: 5.0, electric: 18.0, lpg: 10.0, cng: 9.0 },
        suv: { petrol: 11.0, diesel: 9.5, hybrid: 7.5, electric: 22.0, lpg: 13.0, cng: 11.5 },
        van: { petrol: 12.0, diesel: 10.0, hybrid: 8.5, electric: 26.0, lpg: 14.0, cng: 12.5 },
        truck: { petrol: 25.0, diesel: 22.0, hybrid: 20.0, electric: 90.0, lpg: 28.0, cng: 24.0 }
    };

    // Auto-update efficiency when class/fuel changes
    useEffect(() => {
        const defaultEff = DEFAULTS[vehicle.class as keyof typeof DEFAULTS][vehicle.fuel as keyof typeof DEFAULTS['car']];
        if (defaultEff) {
            setVehicle(prev => ({ ...prev, efficiency: defaultEff.toString() }));
        }
    }, [vehicle.class, vehicle.fuel]);

    // Real-time calculation effects
    useEffect(() => {
        const kwh = parseFloat(electricity.kwh) || 0;
        const factor = FACTORS.electricity[electricity.source as keyof typeof FACTORS.electricity];
        setResults(prev => ({ ...prev, electricity: (kwh * factor) / 1000 }));
    }, [electricity]);

    useEffect(() => {
        const dist = parseFloat(vehicle.distance) || 0;
        const eff = parseFloat(vehicle.efficiency) || 0;
        const fuelFactor = FACTORS.fuel[vehicle.fuel as keyof typeof FACTORS.fuel];

        // Formula: (Distance / 100) * Efficiency * FuelFactor
        // Result is in kg, convert to tons (/1000)
        let emissions = 0;

        if (vehicle.fuel === 'electric') {
            // EV: Efficiency in kWh/100km * Dist/100 * GridFactor
            emissions = ((dist / 100) * eff * FACTORS.electricity.grid) / 1000;
        } else {
            // ICE: Efficiency in L/100km * Dist/100 * FuelFactor
            emissions = ((dist / 100) * eff * fuelFactor) / 1000;
        }

        setResults(prev => ({ ...prev, vehicle: emissions }));
    }, [vehicle]);

    useEffect(() => {
        const dist = parseFloat(shipping.distance) || 0;
        const weight = parseFloat(shipping.weight) || 0;
        const freq = parseFloat(shipping.frequency) || 1;
        const factor = FACTORS.shipping[shipping.mode as keyof typeof FACTORS.shipping];
        setResults(prev => ({ ...prev, shipping: (dist * weight * factor * freq) / 1000 }));
    }, [shipping]);

    useEffect(() => {
        const spend = parseFloat(supply.spend) || 0;
        const factor = FACTORS.supply[supply.category as keyof typeof FACTORS.supply];
        setResults(prev => ({ ...prev, supply: (spend * factor) / 1000 }));
    }, [supply]);


    const handleDownload = async (type: "electricity" | "vehicle" | "shipping" | "supply") => {
        const emissions = results[type];
        if (emissions === 0) {
            toast.error("Calculate emissions before downloading.");
            return;
        }

        toast.loading("Gathering insights...");

        let aiAnalysis = null;
        try {
            const res = await fetch("/api/insights/generate");
            const data = await res.json();
            if (data.success) {
                aiAnalysis = data.analysis;
            }
        } catch (e) {
            console.error("Failed to fetch AI analysis for report", e);
        }

        const reportData = {
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Emissions Report`,
            summary: `Instant report for ${type} emissions calculation.`,
            dataSnapshot: {
                totalEmissions: emissions,
                byType: { [type]: emissions },
                recentCalcs: [{
                    createdAt: new Date(),
                    type: type,
                    emissions: emissions
                }]
            },
            aiAnalysis
        };

        toast.dismiss();
        // Generate PDF locally
        generateReportPDF(reportData);
        toast.success("Download started.");

        // Save to Reports & Analytics
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customReportData: reportData }),
            });

            if (res.ok) {
                toast.success("Report saved to Reports & Analytics");
            } else {
                console.error("Failed to save report to dashboard");
            }
        } catch (error) {
            console.error("Error saving report:", error);
        }
    };

    const handleSave = async (type: "electricity" | "vehicle" | "shipping" | "supply", shouldRedirect = false) => {
        setLoading(true);
        const emissions = results[type];

        let inputs = {};
        if (type === "electricity") inputs = electricity;
        else if (type === "vehicle") inputs = vehicle;
        else if (type === "shipping") inputs = shipping;
        else if (type === "supply") inputs = supply;

        try {
            console.log('[SAVE] Starting save for type:', type, 'emissions:', emissions);
            const res = await fetch("/api/calculator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, inputs, emissions }),
            });

            console.log('[SAVE] Response status:', res.status, res.statusText);
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                toast.success("Calculation saved!");

                // Also trigger report generation if redirecting
                if (shouldRedirect) {
                    try {
                        const reportData = {
                            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Emissions Report`,
                            summary: `Generated from your recent ${type} calculation.`,
                            dataSnapshot: {
                                totalEmissions: emissions,
                                byType: { [type]: emissions },
                                recentCalcs: [{
                                    createdAt: new Date(),
                                    type: type,
                                    emissions: emissions
                                }]
                            }
                        };

                        console.log("Sending report generation request to /api/reports...");
                        const reportRes = await fetch("/api/reports", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ customReportData: reportData }),
                        });
                        console.log("Report response status:", reportRes.status);

                        if (!reportRes.ok) {
                            const errData = await reportRes.json().catch(() => ({}));
                            console.error("Report generation failed:", errData);
                            throw new Error(errData.error || "Failed to generate report");
                        }

                        toast.success("Redirecting to reports...");
                        router.push("/reports");
                    } catch (err: any) {
                        console.error("Redirect Error:", err);
                        toast.error(`Saved, but report generation failed: ${err.message}`);
                    }
                }
            } else {
                console.error('[SAVE] ERROR:', data.error || data.message || 'Unknown error');
                toast.error(data.error || data.message || "Failed to save calculation.");
            }
        } catch (error) {
            console.error('[SAVE] EXCEPTION:', error);
            toast.error("Network error. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl font-bold font-heading mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Carbon Calculator</h1>
                <p className="text-muted-foreground text-lg">Real-time precision estimation across all scopes.</p>
            </motion.div>

            <div className="w-full">
                <Tabs defaultValue="shipping" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6 bg-black/40 p-1 rounded-xl">
                        <TabsTrigger value="electricity" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Zap className="h-4 w-4" /> Power</TabsTrigger>
                        <TabsTrigger value="vehicle" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Car className="h-4 w-4" /> Fleet</TabsTrigger>
                        <TabsTrigger value="shipping" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Truck className="h-4 w-4" /> Logistics</TabsTrigger>
                        <TabsTrigger value="supply" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Factory className="h-4 w-4" /> Supply</TabsTrigger>
                    </TabsList>

                    <TabsContent value="electricity">
                        <CalculatorCard
                            title="Electricity Consumption"
                            description="Scope 2: Indirect emissions from purchased energy."
                            result={results.electricity}
                            onSave={() => handleSave("electricity", false)}
                            onSaveAndView={() => handleSave("electricity", true)}
                            onDownload={() => handleDownload("electricity")}
                            loading={loading}
                            valid={!!electricity.kwh}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Monthly Consumption (kWh)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5000"
                                        value={electricity.kwh}
                                        onChange={(e) => setElectricity({ ...electricity, kwh: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Energy Source</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-white/20 bg-black text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 hover:bg-green-700 transition-colors cursor-pointer"
                                        value={electricity.source}
                                        onChange={(e) => setElectricity({ ...electricity, source: e.target.value })}
                                    >
                                        <option className="bg-black text-white" value="grid">Grid Mix (Standard)</option>
                                        <option className="bg-black text-white" value="solar">Solar (100% Renewable)</option>
                                        <option className="bg-black text-white" value="wind">Wind (100% Renewable)</option>
                                        <option className="bg-black text-white" value="hybrid">Hybrid (50/50 Mix)</option>
                                    </select>
                                </div>
                            </div>
                        </CalculatorCard>
                    </TabsContent>

                    <TabsContent value="vehicle">
                        <CalculatorCard
                            title="Vehicle Fleet & Travel"
                            description="Scope 1: Direct emissions calculated via efficiency and fuel chemistry."
                            result={results.vehicle}
                            onSave={() => handleSave("vehicle", false)}
                            onSaveAndView={() => handleSave("vehicle", true)}
                            onDownload={() => handleDownload("vehicle")}
                            loading={loading}
                            valid={!!vehicle.distance}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Col 1: Vehicle Specs */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Vehicle Class</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {['bike', 'car', 'suv', 'van', 'truck'].map(type => (
                                                <Button
                                                    key={type}
                                                    type="button"
                                                    variant={vehicle.class === type ? "default" : "outline"}
                                                    onClick={() => setVehicle({ ...vehicle, class: type })}
                                                    className="capitalize h-16 sm:h-20 flex flex-col gap-1 text-[10px] sm:text-xs px-1"
                                                >
                                                    {type === 'bike' && <Bike className="h-5 w-5" />}
                                                    {type === 'car' && <Car className="h-5 w-5" />}
                                                    {type === 'suv' && <Car className="h-6 w-6 scale-110" />}
                                                    {type === 'van' && <Truck className="h-5 w-5" />}
                                                    {type === 'truck' && <Truck className="h-6 w-6 scale-110" />}
                                                    {type === 'bike' ? '2-Wheel' : type}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fuel System</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-white/20 bg-black text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 hover:bg-green-700 transition-colors cursor-pointer"
                                            value={vehicle.fuel}
                                            onChange={(e) => setVehicle({ ...vehicle, fuel: e.target.value })}
                                        >
                                            <option className="bg-black text-white" value="petrol">Petrol (Gasoline)</option>
                                            <option className="bg-black text-white" value="diesel">Diesel</option>
                                            <option className="bg-black text-white" value="hybrid">Hybrid</option>
                                            <option className="bg-black text-white" value="electric">Electric (EV)</option>
                                            <option className="bg-black text-white" value="lpg">LPG (Autogas)</option>
                                            <option className="bg-black text-white" value="cng">CNG (Natural Gas)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Col 2: Usage Specs */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex justify-between">
                                            <span>Efficiency ({vehicle.fuel === 'electric' ? 'kWh/100km' : 'L/100km'})</span>
                                            <span className="text-xs text-muted-foreground font-normal">Auto-filled (modifiable)</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={vehicle.efficiency}
                                            onChange={(e) => setVehicle({ ...vehicle, efficiency: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            *Lower is better. Default values based on 2024 averages for {vehicle.class}.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Distance Traveled (km)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 15000"
                                            value={vehicle.distance}
                                            onChange={(e) => setVehicle({ ...vehicle, distance: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CalculatorCard>
                    </TabsContent>

                    <TabsContent value="shipping">
                        <CalculatorCard
                            title="Logistics & Shipping"
                            description="Scope 3: Upstream/Downstream transportation."
                            result={results.shipping}
                            onSave={() => handleSave("shipping", false)}
                            onSaveAndView={() => handleSave("shipping", true)}
                            onDownload={() => handleDownload("shipping")}
                            loading={loading}
                            valid={!!shipping.distance && !!shipping.weight}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Data Input</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Distance (km)</Label>
                                            <Input
                                                type="number"
                                                placeholder="500"
                                                value={shipping.distance}
                                                onChange={(e) => setShipping({ ...shipping, distance: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Weight (tons)</Label>
                                            <Input
                                                type="number"
                                                placeholder="2.5"
                                                value={shipping.weight}
                                                onChange={(e) => setShipping({ ...shipping, weight: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Transport Details</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Mode</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-white/20 bg-black text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 hover:bg-green-700 transition-colors cursor-pointer"
                                                value={shipping.mode}
                                                onChange={(e) => setShipping({ ...shipping, mode: e.target.value })}
                                            >
                                                <option className="bg-black text-white" value="road">Road (Diesel Truck)</option>
                                                <option className="bg-black text-white" value="rail">Rail (Electric Freight)</option>
                                                <option className="bg-black text-white" value="sea">Sea (Container Ship)</option>
                                                <option className="bg-black text-white" value="air">Air (Cargo Jet)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Frequency/Month</Label>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                value={shipping.frequency}
                                                onChange={(e) => setShipping({ ...shipping, frequency: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CalculatorCard>
                    </TabsContent>

                    <TabsContent value="supply">
                        <CalculatorCard
                            title="Supply Chain Spend"
                            description="Scope 3: Purchased goods and services (Spend-based method)."
                            result={results.supply}
                            onSave={() => handleSave("supply", false)}
                            onSaveAndView={() => handleSave("supply", true)}
                            onDownload={() => handleDownload("supply")}
                            loading={loading}
                            valid={!!supply.spend}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Expenditure ($ USD)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 10000"
                                        value={supply.spend}
                                        onChange={(e) => setSupply({ ...supply, spend: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-white/20 bg-black text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 hover:bg-green-700 transition-colors cursor-pointer"
                                        value={supply.category}
                                        onChange={(e) => setSupply({ ...supply, category: e.target.value })}
                                    >
                                        <option className="bg-black text-white" value="manufacturing">Heavy Manufacturing</option>
                                        <option className="bg-black text-white" value="services">Professional Services</option>
                                        <option className="bg-black text-white" value="materials">Raw Materials Extraction</option>
                                    </select>
                                </div>
                            </div>
                        </CalculatorCard>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function CalculatorCard({ title, description, children, result, onSave, onSaveAndView, onDownload, loading, valid }: any) {
    return (
        <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden h-full">
            <CardHeader className="bg-muted/10 pb-8">
                <CardTitle className="flex items-center gap-2">
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {children}

                <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimated Emissions</p>
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                key={result}
                                initial={{ opacity: 0.5, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold font-heading text-primary"
                            >
                                {result.toFixed(3)}
                            </motion.span>
                            <span className="text-sm font-medium text-muted-foreground">tCO2e</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Button onClick={onDownload} variant="outline" disabled={!valid} className="shadow-sm">
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button onClick={onSave} disabled={loading || !valid} variant="secondary" className="shadow-sm">
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                        <Button onClick={onSaveAndView} disabled={loading || !valid} className="shadow-md hover:shadow-lg transition-all">
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                            Save & View Report
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
