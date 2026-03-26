'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-gray-50 dark:bg-gray-950 flex items-center justify-center min-h-screen p-4">
                <div
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                    className="p-10 max-w-md w-full text-center space-y-6"
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            margin: '0 auto',
                        }}
                    >
                        🌐
                    </div>
                    <div className="space-y-2">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
                            Lỗi nghiêm trọng!
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {error.message || 'Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang.'}
                        </p>
                        {error.digest && (
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                                ID: {error.digest}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff',
                            fontWeight: 600,
                            padding: '0.625rem 1.5rem',
                            borderRadius: '2rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                        }}
                    >
                        Tải lại trang
                    </button>
                </div>
            </body>
        </html>
    )
}
