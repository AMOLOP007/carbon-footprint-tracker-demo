import { AIAnalysisResult } from "./openaiService";

// Helper to create consistent structure
const createAnalysis = (summary: string, recs: any[], risks: any[], idea: any): AIAnalysisResult => ({
    summary,
    recommendations: recs,
    riskFlags: risks,
    innovativeIdea: idea
});

export const FALLBACK_POOLS = {
    electricity: [
        createAnalysis(
            "Your energy profile indicates a heavy reliance on grid data. Immediate decarbonization is possible through renewable procurement.",
            [
                { title: "Switch to Green Tariffs", description: "Negotiate a 100% renewable energy purchasing agreement (PPA) with your utility provider.", impact: "high", category: "energy" },
                { title: "Install Smart Meters", description: "Deploy IoT-enabled sub-meters to identify peak load times and phantom power usage.", impact: "medium", category: "optimization" },
                { title: "LED Retrofit Program", description: "Replace all legacy lighting with motion-sensor LEDs to cut lighting load by 40%.", impact: "low", category: "energy" }
            ],
            [{ title: "Regulatory Exposure", description: "Rising carbon taxes on grid electricity may increase opex by 5% next year.", severity: "warning" }],
            { title: "Virtual Power Plant", description: "Participate in a VPP network to monetize your battery storage or load shedding capabilities during grid peaks.", potentialImpact: "High - Revenue Generating" }
        ),
        createAnalysis(
            "Analysis detects seasonal spikes in cooling/heating loads contributing to 40% of emissions.",
            [
                { title: "HVAC Optimization AI", description: "Implement AI-driven climate control that predicts weather and occupancy patterns.", impact: "high", category: "energy" },
                { title: "Thermal Insulation Upgrade", description: "Improve building envelope integrity to reduce thermal leakage.", impact: "medium", category: "energy" },
                { title: "Passive Cooling", description: "Install reflective window films to reduce solar heat gain.", impact: "low", category: "energy" }
            ],
            [{ title: "Equipment Aging", description: "Older HVAC units show declining efficiency curves (SEER < 13).", severity: "info" }],
            { title: "Geothermal Heat Exchange", description: "Utilize ground-source heat pumps for highly efficient base-load temperature regulation.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Base load power consumption is unusually high during non-operational hours.",
            [
                { title: "Auto-Shutdown Protocols", description: "Software-enforced sleep modes for all IT and machinery after hours.", impact: "high", category: "optimization" },
                { title: "Server Room Cooling", description: "Implement hot/cold aisle containment in server rooms.", impact: "medium", category: "energy" },
                { title: "Energy Audit", description: "Conduct a Level 2 ASHRAE audit to pinpoint leakage.", impact: "low", category: "general" }
            ],
            [{ title: "Phantom Load", description: "20% of energy bill is likely from standby power.", severity: "warning" }],
            { title: "Piezoelectric Flooring", description: "Harvest energy from foot traffic in high-volume corridors to power local lighting.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Renewable integration is currently at 0%. Transitioning is the single highest impact action available.",
            [
                { title: "Rooftop Solar Array", description: "Utilize available roof space for a 50kW photovoltaic system.", impact: "high", category: "energy" },
                { title: "Battery Storage", description: "Install Li-ion storage to arbitrage peak demand charges.", impact: "medium", category: "energy" },
                { title: "Demand Response", description: "Enroll in utility demand response programs.", impact: "low", category: "optimization" }
            ],
            [{ title: "Grid Instability", description: "Reliance on grid leaves operations vulnerable to brownouts.", severity: "info" }],
            { title: "Solar Windows", description: "Replace facade glass with transparent solar concentrators to generate power without obscuring views.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Power factor correction is needed based on the efficiency profile of inductive loads.",
            [
                { title: "Capacitor Bank Installation", description: "Install capacitor banks to improve power factor to >0.95 and avoid utility penalties.", impact: "medium", category: "energy" },
                { title: "VFD for Motors", description: "Install Variable Frequency Drives on all major pumps and fans.", impact: "high", category: "energy" },
                { title: "Voltage Optimization", description: "Optimize supply voltage to match equipment nameplate ratings.", impact: "low", category: "optimization" }
            ],
            [{ title: "Inefficient Motors", description: "Fixed signal motors are wasting 30% energy during low-demand cycles.", severity: "warning" }],
            { title: "Regenerative Elevators", description: "Capture gravity potential energy from descending elevators to power building lighting.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Lighting and office equipment account for the majority of Scope 2 emissions.",
            [
                { title: "Daylight Harvesting", description: "Automated dimming sensors that adjust artificial light based on natural sunlight availability.", impact: "medium", category: "energy" },
                { title: "Cloud Migration", description: "Move on-premise servers to a carbon-neutral cloud provider.", impact: "high", category: "technology" },
                { title: "Energy Star Policy", description: "Mandate Energy Star certification for all new IT procurement.", impact: "low", category: "general" }
            ],
            [{ title: "Scope 2 Intensity", description: "Grid intensity in your region is higher than national average.", severity: "critical" }],
            { title: "DC Microgrid", description: "Convert office lighting and IT to Direct Current (DC) to eliminate AC-DC conversion losses.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Manufacturing equipment idle time is a significant energy drain.",
            [
                { title: "Predictive Maintenance", description: "Use vibration sensors to predict motor failure and maintain peak efficiency.", impact: "high", category: "optimization" },
                { title: "Soft Starters", description: "Reduce inrush current on heavy machinery startup.", impact: "medium", category: "energy" },
                { title: "Compressed Air Fixes", description: "Identify and fix leaks in compressed air lines (often 30% of compressor cost).", impact: "medium", category: "energy" }
            ],
            [{ title: "Peak Demand Charges", description: "Simultaneous equipment startup is causing massive demand spikes.", severity: "warning" }],
            { title: "Waste Heat to Power", description: "Install ORC (Organic Rankine Cycle) generators to convert exhaust heat into electricity.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Data center cooling is the primary efficiency bottleneck.",
            [
                { title: "Free Cooling", description: "Utilize outside air for cooling when ambient temperature is low.", impact: "high", category: "energy" },
                { title: "Liquid Immersion", description: "Explore dielectric fluid immersion cooling for high-density racks.", impact: "high", category: "technology" },
                { title: "Airflow Management", description: "Install blanking panels in empty rack U-spaces.", impact: "low", category: "optimization" }
            ],
            [{ title: "PUE Rating", description: "Current Power Usage Effectiveness (PUE) is likely > 1.8.", severity: "warning" }],
            { title: "Underwater Datacenter", description: "Deploy sealed server capsules in local water bodies for natural, zero-energy cooling.", potentialImpact: "High - Experiemental" }
        ),
        createAnalysis(
            "Energy usage is decoupled from production volume, indicating base-load inefficiencies.",
            [
                { title: "Energy Management System (ISO 50001)", description: "Implement a formal EMS to track energy KPIs per production unit.", impact: "high", category: "general" },
                { title: "Insulate Steam Pipes", description: "Thermal survey to identify uninsulated valves and flanges.", impact: "medium", category: "energy" },
                { title: "Steam Trap Maintenance", description: "Replace failed steam traps blowing live steam.", impact: "medium", category: "energy" }
            ],
            [{ title: "Boiler Efficiency", description: "Combustion efficiency checks recommended.", severity: "info" }],
            { title: "Hydrogen Boiler Retrofit", description: "Retrofit boilers to fire a Natural Gas/Hydrogen blend to reduce carbon intensity.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Grid electricity source is heavily coal-dominant.",
            [
                { title: "On-site Wind/Solar", description: "Feasibility study for on-site generation to offset dirty grid mix.", impact: "high", category: "energy" },
                { title: "RECs Purchase", description: "Purchase high-quality Renewable Energy Certificates for immediate Scope 2 reduction.", impact: "medium", category: "general" },
                { title: "Load Shifting", description: "Shift energy-intensive processes to times when grid is cleaner (if real-time data available).", impact: "low", category: "optimization" }
            ],
            [{ title: "Carbon Tax Risk", description: "High exposure to future carbon pricing mechanisms.", severity: "critical" }],
            { title: "Micro-Nuclear", description: "Investigate future compatibility with Small Modular Reactors (SMRs) for 24/7 zero-carbon baseload.", potentialImpact: "Very High" }
        )
    ],
    vehicle: {
        car: [
            createAnalysis(
                "Fleet analysis suggests transition to EV is the primary pathway for passenger sedans.",
                [{ title: "EV Transition", description: "Replace 20% of fleet with BEVs annually.", impact: "high", category: "transport" }, { title: "Eco-Driving Training", description: "Train drivers on smooth acceleration/braking.", impact: "medium", category: "optimization" }, { title: "Route Optimization", description: "Software to minimize mileage.", impact: "medium", category: "transport" }],
                [{ title: "Fuel Volatility", description: "Exposure to oil price shocks.", severity: "warning" }],
                { title: "V2G Integration", description: "EV fleet acts as grid storage when parked.", potentialImpact: "High" }
            ),
            createAnalysis(
                "Corporate commute emissions are significant. Hybrid adoption recommended as bridge.",
                [{ title: "PHEV Adoption", description: "Switch to Plug-in Hybrids for flexibility.", impact: "high", category: "transport" }, { title: "Carpool Incentives", description: "Gamified app for employee carpooling.", impact: "medium", category: "general" }, { title: "Tire Pressure Monitoring", description: "Enforce monthly TPMS checks (10% fuel save).", impact: "low", category: "optimization" }],
                [{ title: "Legislative Risk", description: "ICE vehicle zones expanding in cities.", severity: "info" }],
                { title: "Solar Carports", description: "Charge EVs directly from parking lot solar canopies.", potentialImpact: "Medium" }
            ),
            createAnalysis(
                "High annual mileage per vehicle detected. Utilization rate optimization required.",
                [{ title: "Fleet Rightsizing", description: "Remove underutilized vehicles; use ride-share.", impact: "high", category: "optimization" }, { title: "Remote Maintenance", description: "Predictive AI for engine tuning.", impact: "medium", category: "transport" }, { title: "Aerodynamic Mods", description: "Remove roof racks when not in use.", impact: "low", category: "transport" }],
                [{ title: "Depreciation", description: "High mileage accelerating asset depreciation.", severity: "info" }],
                { title: "Mobility-as-a-Service", description: "Ditch ownership for subscription-based corporate EV access.", potentialImpact: "High" }
            ),
        ],
        truck: [
            createAnalysis(
                "Heavy duty logistics are the primary emission source. Aerodynamic drag is a key factor.",
                [{ title: "Aerodynamic Fairings", description: "Install side skirts and boat tails.", impact: "medium", category: "transport" }, { title: "Low Rolling Resistance Tires", description: "Switch to Class A efficiency tires.", impact: "medium", category: "transport" }, { title: "Speed Governance", description: "Cap max speed to 85km/h (optimum efficiency).", impact: "high", category: "optimization" }],
                [{ title: "Diesel Regulations", description: "Euro 7 / EPA standards tightening.", severity: "critical" }],
                { title: "Platooning Technology", description: "Automated convoy drafting to reduce drag by 20%.", potentialImpact: "High" }
            ),
            createAnalysis(
                "Idling time is excessively high (~20% of engine runtime).",
                [{ title: "APU Installation", description: "Auxiliary Power Units for cabin power during rest.", impact: "high", category: "transport" }, { title: "Auto-Stop Systems", description: "Automatic engine shutoff after 3 min idle.", impact: "medium", category: "technology" }, { title: "Driver Scorecards", description: "Weekly efficiency rankings/bonuses.", impact: "low", category: "general" }],
                [{ title: "Fuel Waste", description: "Idling burns ~4L/hour per truck.", severity: "warning" }],
                { title: "Hydrogen Fuel Cell", description: "Pilot FCEV trucks for long-haul routes.", potentialImpact: "Very High" }
            ),
            createAnalysis(
                "Route analysis shows significant 'empty mile' travel.",
                [{ title: "Backhaul Optimization", description: "Brokerage platforms to fill empty return legs.", impact: "high", category: "optimization" }, { title: "Hub-and-Spoke", description: "Reconfigure logistics network.", impact: "medium", category: "transport" }, { title: "Intermodal Switching", description: "Shift long legs to rail where possible.", impact: "medium", category: "transport" }],
                [{ title: "License to Operate", description: "City center access restrictions for heavy diesel.", severity: "critical" }],
                { title: "Electric Highway", description: "Overhead catenary wires for pantograph-equipped trucks.", potentialImpact: "High" }
            ),
            createAnalysis(
                "Cold chain logistics: Refrigeration units are consuming high diesel volumes.",
                [{ title: "Electric TRUs", description: "Replace diesel Transport Refrigeration Units with electric/hybrid.", impact: "high", category: "transport" }, { title: "Pre-Cooling Cargo", description: "Chill cargo at warehouse before loading.", impact: "medium", category: "optimization" }, { title: "Insulated Dividers", description: "Multi-temp zone management.", impact: "low", category: "transport" }],
                [{ title: "Refrigerant Leakage", description: "High GWP refrigerants pose leak risks.", severity: "warning" }],
                { title: "Cryogenic Cooling", description: "Liquid Nitrogen cooling systems with zero tailpipe emissions.", potentialImpact: "High" }
            ),
            createAnalysis(
                "Last-mile delivery efficiency is dropping due to traffic congestion.",
                [{ title: "Cargo E-Bikes", description: "Shift urban <5km deliveries to e-bikes.", impact: "high", category: "transport" }, { title: "Night Deliveries", description: "Off-peak scheudling to avoid congestion.", impact: "medium", category: "optimization" }, { title: "Route AI", description: "Real-time traffic avoidance.", impact: "medium", category: "technology" }],
                [{ title: "Congestion Charges", description: "Urban access fees increasing.", severity: "info" }],
                { title: "Drone Delivery", description: "Aerial drones for urgent, small-parcel last-mile drops.", potentialImpact: "Medium" }
            ),
            createAnalysis(
                "Maintenance intervals are reactive, causing efficiency drops.",
                [{ title: "Predictive Maintenance", description: "IoT sensors for oil/filter health.", impact: "medium", category: "technology" }, { title: "Synthetic Lubricants", description: "Low-viscosity oils to reduce friction.", impact: "low", category: "transport" }, { title: "Injector Cleaning", description: "Regular cleaning schedule for diesel injectory.", impact: "low", category: "optimization" }],
                [{ title: "Breakdown Risk", description: "Unplanned downtime increasing.", severity: "warning" }],
                { title: "3D Printed Spares", description: "On-demand manufacturing of parts to reduce inventory waste.", potentialImpact: "Low" }
            ),
            createAnalysis(
                "Driver behavior is the largest variable in current fuel efficiency data.",
                [{ title: "Gamification App", description: "Driver league tables for efficiency.", impact: "high", category: "general" }, { title: "Cabin Feedback", description: "Real-time dash alerts for hard braking.", impact: "medium", category: "technology" }, { title: "Incentive Pay", description: "Bonus tied to L/100km targets.", impact: "medium", category: "general" }],
                [{ title: "Retention", description: "Driver turnover affects efficiency culture.", severity: "info" }],
                { title: "Autonomous Convoy", description: "Level 4 autonomy on highways.", potentialImpact: "High" }
            )
        ]
    },
    shipping: [
        createAnalysis(
            "Air freight usage is disproportionately high. Mode shifting to sea/rail is critical.",
            [{ title: "Sea-Air Hybrid", description: "Ship to hub by sea, fly final leg.", impact: "high", category: "transport" }, { title: "Inventory Buffering", description: "Increase safety stock to allow slower shipping.", impact: "medium", category: "optimization" }, { title: "Packing Density", description: "Redesign packaging to reduce air volumetric weight.", impact: "medium", category: "waste" }],
            [{ title: "Cost/Carbon correlation", description: "Air freight is both most expensive and most carbon intensive.", severity: "critical" }],
            { title: "Hydrogen Airships", description: "Lighter-than-air heavy cargo ships for zero-carbon air freight.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Container fill rates are suboptimal (LCL). Consolidation required.",
            [{ title: "FCL Optimization", description: "Wait to fill Full Container Load (FCL).", impact: "high", category: "optimization" }, { title: "Packaging Resize", description: "Modular packaging to fit pallet dimensions exactly.", impact: "medium", category: "waste" }, { title: "3PL Consolidation", description: "Use 3PL hubs to merge shipments.", impact: "medium", category: "transport" }],
            [{ title: "Wasted Space", description: "Shipping 20% air in containers.", severity: "warning" }],
            { title: "Foldable Containers", description: "Use collapsible containers to reduce empty return leg emissions.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Ocean freight route selection is not optimizing for carbon intensity.",
            [{ title: "Slow Steaming", description: "Contract/Select carriers that steam at lower knots.", impact: "high", category: "transport" }, { title: "Clean Carrier Selection", description: "Prioritize carriers with newer, efficient fleets.", impact: "medium", category: "general" }, { title: "Port Electrification", description: "Ensure carriers use shore power at berth.", impact: "low", category: "energy" }],
            [{ title: "IMO 2023", description: "CII ratings affecting ship availability.", severity: "info" }],
            { title: "Wind-Assist Propulsion", description: "Rotor sails or kites on cargo ships to reduce fuel use.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Rail freight potential is underutilized for continental logistics.",
            [{ title: "Road-to-Rail Shift", description: "Move loads >500km to rail intermodal.", impact: "high", category: "transport" }, { title: "Double Stacking", description: "Utilize double-stack routes where cleared.", impact: "medium", category: "optimization" }, { title: "Electric Rail", description: "Prioritize electrified rail corridors.", impact: "medium", category: "energy" }],
            [{ title: "Dependency", description: "Single rail provider reliance.", severity: "info" }],
            { title: "Autonomous Rail Cars", description: "Self-propelled battery rail pods for direct P2P delivery.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Packaging weight contributes significantly to shipping emissions.",
            [{ title: "Lightweighting", description: "Switch from glass/metal to high-grade polymers where possible.", impact: "high", category: "waste" }, { title: "Reusable Crates", description: "Implement closed-loop tote systems.", impact: "medium", category: "waste" }, { title: "Dunnage reduction", description: "Air pillow reduction.", impact: "low", category: "waste" }],
            [{ title: "Plastics Tax", description: "Virgin plastic taxes increasing.", severity: "warning" }],
            { title: "Mycelium Packaging", description: "Grow packaging from mushroom roots locally to eliminate sourcing shipping.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Inbound logistics lack vendor coordination.",
            [{ title: "Milk Run", description: "Single truck picks up from multiple local suppliers.", impact: "high", category: "optimization" }, { title: "Vendor Clustering", description: "Sourcing from geographically proximal suppliers.", impact: "medium", category: "general" }, { title: "Drop Shipping", description: "Ship direct from vendor to client.", impact: "medium", category: "transport" }],
            [{ title: "Scope 3 Visibility", description: "Lack of data from Tier 2 suppliers.", severity: "warning" }],
            { title: "Hyperloop Freight", description: "Vacuum tube logistics for near-supersonic ground transport.", potentialImpact: "Very High - Futurist" }
        ),
        createAnalysis(
            "Cold chain logistics integrity issues causing spoilage and reshipment.",
            [{ title: "IoT Loggers", description: "Real-time temp monitoring to prevent spoilage.", impact: "high", category: "technology" }, { title: "Better Insulation", description: "Phase Change Material (PCM) usage.", impact: "medium", category: "waste" }, { title: "Faster Modes", description: "Balance speed vs spoilage waste.", impact: "low", category: "optimization" }],
            [{ title: "Food Waste", description: "Spoilage = wasted production + disposal + reshipment emissions.", severity: "critical" }],
            { title: "Solar Refrigerated Containers", description: "Active cooling units powered by container-top solar films.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Last mile return rates (Reverse Logistics) are adding 15% to carbon footprint.",
            [{ title: "Return Prevention", description: "Better sizing tools/descriptions.", impact: "high", category: "optimization" }, { title: "Consolidated Returns", description: "Aggregated return points (lockers).", impact: "medium", category: "transport" }, { title: "Local Refurbish", description: "Process returns regionally, don't ship back to HQ.", impact: "medium", category: "waste" }],
            [{ title: "Consumer Behavior", description: "Bracketing (buying multiple sizes) is rising.", severity: "warning" }],
            { title: "Circular Economy Hubs", description: "Local repair/resell centers to prevent returns entering the logistics chain.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Distribution Network design is centralized, increasing average km to customer.",
            [{ title: "Decentralization", description: "Open regional micro-fulfillment centers.", impact: "high", category: "optimization" }, { title: "Pop-up Warehousing", description: "Seasonal forward stocking locations.", impact: "medium", category: "optimization" }, { title: "Store Fulfillment", description: "Ship from retail store (Omnichannel).", impact: "medium", category: "transport" }],
            [{ title: "Delivery Time", description: "Customers demanding same-day increases carbon intensity.", severity: "info" }],
            { title: "Dark Stores", description: "Automated micro-warehouses in city centers for walking delivery.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Dangerous goods (DG) shipping restrictions forcing inefficient routing.",
            [{ title: "Product Reformulation", description: "Remove volatile components to de-classify DG.", impact: "high", category: "general" }, { title: "Dry Powder", description: "Ship concentrate/powder, add water locally.", impact: "high", category: "waste" }, { title: "Bulk Shipping", description: "Ship bulk ISO tanks vs drums.", impact: "medium", category: "transport" }],
            [{ title: "Compliance", description: "DG documentation errors causing delays.", severity: "warning" }],
            { title: "On-site Synthesis", description: "Print or synthesize chemical products at demand point.", potentialImpact: "High" }
        )
    ],
    supply: [
        createAnalysis(
            "Scope 3 purchased goods represent the largest carbon chunk. Supplier engagement required.",
            [{ title: "Supplier Code of Conduct", description: "Mandate carbon reporting for Tier 1.", impact: "high", category: "general" }, { title: "Green Procurement", description: "Weight carbon intensity in RFP scoring.", impact: "high", category: "general" }, { title: "Audit Program", description: "Third-party validation of supplier claims.", impact: "medium", category: "optimization" }],
            [{ title: "Reputational Risk", description: "Upstream labor/environmental violations.", severity: "critical" }],
            { title: "Blockchain Transparency", description: "End-to-end material passport on blockchain.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Raw material intensity (steel/cement) is high.",
            [{ title: "Material Substitution", description: "Switch to low-carbon aluminum / timber.", impact: "high", category: "waste" }, { title: "Scrap Integration", description: "Increase recycled content %.", impact: "medium", category: "waste" }, { title: "Lightweighting", description: "Redesign product to use less material.", impact: "medium", category: "technology" }],
            [{ title: "Green Premium", description: "Low carbon materials currently cost 20% more.", severity: "warning" }],
            { title: "Green Steel", description: "Source Hydrogen-reduced steel (zero coal).", potentialImpact: "High" }
        ),
        createAnalysis(
            "Services and IT spend has a hidden cloud footprint.",
            [{ title: "Green Host Selection", description: "Enforce Google/Azure/AWS (100% RE) usage.", impact: "high", category: "technology" }, { title: "Code Effectiveness", description: "Refactor bloatware to reduce compute cycles.", impact: "medium", category: "optimization" }, { title: "Device Lifespan", description: "Extend laptop refresh cycle to 4 years.", impact: "medium", category: "waste" }],
            [{ title: "E-waste", description: "End-of-life device disposal compliance.", severity: "info" }],
            { title: "DNA Data Storage", description: "Ultra-efficient archival storage in synthesized DNA.", potentialImpact: "Futurist" }
        ),
        createAnalysis(
            "Business travel intensity is returning to pre-pandemic levels.",
            [{ title: "Virtual First", description: "Strict approval workflow for travel.", impact: "high", category: "general" }, { title: "Rail over Air", description: "Mandate rail for trips < 4h.", impact: "medium", category: "transport" }, { title: "Economy Class", description: "Business class emits 3x more CO2.", impact: "medium", category: "transport" }],
            [{ title: "Cost Savings", description: "Reducing travel also cuts massive opex.", severity: "info" }],
            { title: "Holographic Presence", description: "High-fidelity telepresence booths to replace site visits.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Waste management in supply chain is linear (Take-Make-Waste).",
            [{ title: "Circular Design", description: "Design for disassembly.", impact: "high", category: "waste" }, { title: "Take-back Program", description: "Recover products at EOL.", impact: "high", category: "waste" }, { title: "Packaging Loops", description: "Reusable B2B transport packaging.", impact: "medium", category: "waste" }],
            [{ title: "Resource Scarcity", description: "Critical material prices rising.", severity: "warning" }],
            { title: "Urban Mining", description: "Recover trace minerals from old electronics onsite.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Water intensity in supply chain is a heavy localized impact.",
            [{ title: "Water Remediation", description: "Suppliers must treat effluent.", impact: "high", category: "general" }, { title: "Closed Loop Water", description: "Zero Liquid Discharge (ZLD) mandates.", impact: "high", category: "technology" }, { title: "Rainwater Harvesting", description: "Mandate for agricultural suppliers.", impact: "medium", category: "general" }],
            [{ title: "Drought Risk", description: "Suppliers in water-stressed regions.", severity: "critical" }],
            { title: "Atmospheric Water Generators", description: "Extract industrial water from humid air.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Employee commuting (Scope 3) is significant.",
            [{ title: "Remote Work Policy", description: "Official 4-day WFH policy.", impact: "high", category: "general" }, { title: "Transit Subsidies", description: "Pay for train/bus passes.", impact: "medium", category: "transport" }, { title: "EV Charging", description: "Free workplace charging.", impact: "medium", category: "energy" }],
            [{ title: "Talent Retention", description: "Green policies attract Gen Z talent.", severity: "info" }],
            { title: "Corporate Shuttle", description: "Electric localized bus loops for campus processing.", potentialImpact: "Medium" }
        ),
        createAnalysis(
            "Capital goods (construction/machinery) embody huge carbon.",
            [{ title: "Refurbished Equipment", description: "Buy certified pre-owned machinery.", impact: "high", category: "waste" }, { title: "Low-Carbon Concrete", description: "Use fly-ash or slag blends.", impact: "medium", category: "general" }, { title: "Adaptive Reuse", description: "Renovate old buildings vs new build.", impact: "high", category: "waste" }],
            [{ title: "Stranded Assets", description: "High carbon assets losing value.", severity: "warning" }],
            { title: "Mass Timber Construction", description: "Use cross-laminated timber instead of steel/concrete for structural frame.", potentialImpact: "High" }
        ),
        createAnalysis(
            "Marketing and digital ad spend generates server emissions.",
            [{ title: "Asset Optimization", description: "Compress video/images in ads.", impact: "medium", category: "technology" }, { title: "Green Media Buying", description: "Advertise on carbon-neutral publishers.", impact: "medium", category: "general" }, { title: "Dark Mode UX", description: "Redesign app/site for OLED efficiency.", impact: "low", category: "technology" }],
            [{ title: "Digital Bloat", description: "Ad-tech intermediaries consume vast compute.", severity: "info" }],
            { title: "Generative Compression", description: "AI recreates textures client-side to save bandwidth.", potentialImpact: "Low" }
        ),
        createAnalysis(
            "Franchise/Leased asset emissions are opaque.",
            [{ title: "Green Lease Clauses", description: "Landlord must provide energy data.", impact: "high", category: "general" }, { title: "Sub-metering", description: "Tenant-level monitoring.", impact: "medium", category: "energy" }, { title: "Tenant Guidelines", description: "Mandatory efficiency standards.", impact: "medium", category: "general" }],
            [{ title: "Scope 3.8", description: "Leased assets are often ignored but significant.", severity: "warning" }],
            { title: "District Energy", description: "Connect to district heating/cooling loops.", potentialImpact: "High" }
        )
    ]
};
