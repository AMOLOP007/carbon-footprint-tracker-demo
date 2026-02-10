"use client";

import { useState, useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {children}
        </main>
    );
}
