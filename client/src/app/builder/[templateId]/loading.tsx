export default function BuilderLoading() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#060a14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem'
        }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Loading resume builder...
            </p>
        </div>
    );
}
