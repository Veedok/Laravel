export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 400 160"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M160 60 Q 200 30, 240 60 Q 280 90, 240 120 Q 200 150, 160 120 Q 120 90, 160 60" fill="none"
                  stroke="currentColor" strokeWidth="3" opacity="0.7"/>
            <path d="M180 70 Q 200 55, 220 70" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8"/>
            <path d="M180 110 Q 200 95, 220 110" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8"/>
            <text x="200" y="100" textAnchor="middle" fill="currentColor" fontSize="42" fontFamily="Georgia, serif"
                  fontWeight="bold" letterSpacing="3"
                  style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                      textTransform: 'uppercase'
                  }}>
                VEEDOK
            </text>
            <path d="M80 80 Q 100 60, 120 80 Q 100 100, 80 80" fill="none" stroke="currentColor" strokeWidth="2"
                  opacity="0.6"/>
            <path d="M280 80 Q 300 60, 320 80 Q 300 100, 280 80" fill="none" stroke="currentColor" strokeWidth="2"
                  opacity="0.6"/>
            <path d="M60 40 L65 38 L62 45 Z" fill="currentColor" opacity="0.4"/>
            <path d="M340 120 L345 118 L342 125 Z" fill="currentColor" opacity="0.4"/>
        </svg>
    );
}
