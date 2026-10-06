import {
    FiHome,
    FiMapPin,
    FiMessageCircle,
    FiUser,
} from "react-icons/fi";
import { NavLink } from "react-router";

const navItems = [
    { to: "/", label: "홈", icon: FiHome, end: true },
    { to: "/dojang", label: "도장", icon: FiMapPin },
    { to: "/chats", label: "채팅", icon: FiMessageCircle },
    { to: "/me", label: "내정보", icon: FiUser },
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-kta-border bg-kta-surface/95 backdrop-blur">
            <div className="mx-auto grid h-16 max-w-3xl grid-cols-4 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            className={({ isActive }) =>
                                isActive
                                    ? "flex flex-col items-center justify-center gap-1 text-xs font-bold text-kta-navy"
                                    : "flex flex-col items-center justify-center gap-1 text-xs font-bold text-kta-muted"
                            }
                            end={item.end}
                            key={item.to}
                            to={item.to}
                        >
                            <Icon aria-hidden="true" className="text-lg" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
