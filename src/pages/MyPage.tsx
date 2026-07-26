import { useNavigate } from "react-router";
import type { CurrentUser } from "../types/user";
import { formatDate } from "../utils/date";

type MyPageProps = {
    currentUser: CurrentUser;
    onLogout: () => void;
};

export default function MyPage({ currentUser, onLogout }: MyPageProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <>
            <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-kta-muted">
                            공용 닉네임
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-kta-text">
                            {currentUser.nickname}
                        </h2>
                    </div>
                    <span className="shrink-0 rounded-full bg-kta-subtle px-3 py-1 text-xs font-bold text-kta-navy">
                        도장 미인증
                    </span>
                </div>
            </section>

            <InfoSection
                items={[
                    ["이름", currentUser.name || "-"],
                    ["생년월일", currentUser.birthDate || "-"],
                    ["전화번호", currentUser.phoneNumber || "-"],
                ]}
                title="개인정보"
            />

            <InfoSection
                items={[
                    ["아이디", currentUser.loginId],
                    ["가입일", formatDate(currentUser.createdAt)],
                ]}
                title="계정정보"
            />

            <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
                <h2 className="text-base font-black text-kta-navy">
                    도장 인증
                </h2>
                <p className="mt-3 text-sm leading-6 text-kta-muted">
                    아직 인증된 도장이 없습니다. 도장 인증 기능은 이후 단계에서
                    연결됩니다.
                </p>
            </section>

            <button
                className="h-11 w-full rounded-kta-md bg-kta-subtle text-sm font-bold text-kta-muted"
                onClick={handleLogout}
                type="button"
            >
                로그아웃
            </button>
        </>
    );
}

type InfoSectionProps = {
    title: string;
    items: Array<[string, string]>;
};

function InfoSection({ title, items }: InfoSectionProps) {
    return (
        <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
            <h2 className="text-base font-black text-kta-navy">{title}</h2>
            <dl className="mt-4 grid gap-3 text-sm">
                {items.map(([label, value]) => (
                    <div
                        className="flex items-center justify-between gap-4"
                        key={label}
                    >
                        <dt className="font-bold text-kta-muted">{label}</dt>
                        <dd className="text-right font-semibold text-kta-text">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
