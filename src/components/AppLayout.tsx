import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

type AppLayoutProps = {
    title: string;
    children: ReactNode;
    showBackButton?: boolean;
    showSearchButton?: boolean;
};

export default function AppLayout({
    title,
    children,
    showBackButton = false,
    showSearchButton = false,
}: AppLayoutProps) {
    return (
        <section className="min-h-svh bg-kta-bg text-kta-text">
            <TopBar
                title={title}
                showBackButton={showBackButton}
                showSearchButton={showSearchButton}
            />
            <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-24 pt-4">
                {children}
            </main>
            <BottomNav />
        </section>
    );
}
