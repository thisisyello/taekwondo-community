import { Link } from "react-router";

export default function HomePage({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <section className="py-8 text-center">
            <h2 className="text-lg font-bold text-kta-text">우리 도장</h2>
            <p className="mt-3 text-sm leading-6 text-kta-muted">
                {isLoggedIn
                    ? "아직 인증된 도장이 없습니다."
                    : "로그인 후 도장을 인증하면 우리 도장 소식을 볼 수 있습니다."}
            </p>
            <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-kta-sm bg-kta-navy px-5 text-sm font-bold text-white"
                to={isLoggedIn ? "/dojang" : "/login"}
                state={isLoggedIn ? undefined : { from: "/home" }}
            >
                {isLoggedIn ? "도장 찾기" : "로그인하기"}
            </Link>
        </section>
    );
}
