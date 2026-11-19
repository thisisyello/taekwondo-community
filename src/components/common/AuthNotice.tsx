type AuthNoticeProps = {
    message: string;
    onRetry: () => void;
    onLogout: () => void;
};

export default function AuthNotice({ message, onRetry, onLogout }: AuthNoticeProps) {
    return (
        <div role="alert" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-kta-border pb-3 text-sm">
            <p className="min-w-0 flex-1 basis-full text-kta-red">{message}</p>
            <button type="button" onClick={onRetry} className="min-h-11 font-semibold text-kta-navy">다시 확인</button>
            <button type="button" onClick={onLogout} className="min-h-11 font-semibold text-kta-muted">로그아웃</button>
        </div>
    );
}
