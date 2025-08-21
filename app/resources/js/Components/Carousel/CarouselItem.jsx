export default function CarouselItem({ item, isActive, onClick, theme }) {
    return (
        <button
            ref={item.ref}
            className={`carousel-item ${isActive ? 'active' : ''} ${theme === 'dark' ? 'dark' : ''}`}
            onClick={() => onClick(item.id)}
            disabled={isActive}
        >
            {item.name}
            {isActive && ' ✓'}
        </button>
    );
}
