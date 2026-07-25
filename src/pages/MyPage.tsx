import { useNavigate } from "react-router";
import type { CurrentUser } from "../types/user";

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
        <section className="rounded-kta-lg border border-kta-border bg-kta-surface p-5 shadow-kta-sm">
            <h2 className="text-lg font-black text-kta-navy">내정보</h2>
            <dl className="mt-4 grid gap-3 text-sm">
                <div>
                    <dt className="font-bold text-kta-muted">이름</dt>
                    <dd className="mt-1 font-semibold text-kta-text">
                        {currentUser.name || "-"}
                    </dd>
                </div>
                <div>
                    <dt className="font-bold text-kta-muted">아이디</dt>
                    <dd className="mt-1 font-semibold text-kta-text">
                        {currentUser.loginId}
                    </dd>
                </div>
                <div>
                    <dt className="font-bold text-kta-muted">공용 닉네임</dt>
                    <dd className="mt-1 font-semibold text-kta-text">
                        {currentUser.nickname}
                    </dd>
                </div>
            </dl>
            <button
                className="mt-5 h-11 w-full rounded-kta-md bg-kta-subtle text-sm font-bold text-kta-muted"
                onClick={handleLogout}
                type="button"
            >
                로그아웃
            </button>
        </section>
    );
}
