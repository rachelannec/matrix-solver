import { useEffect, useRef } from 'react';

interface SquaresProps {
    speed?: number;
    size?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal';
    borderColor?: string;
    hoverFillColor?: string;
}

const Squares: React.FC<SquaresProps> = ({
    speed = 0.5,
    size = 40,
    direction = 'diagonal',
    borderColor = '#a2624b1c',
    hoverFillColor = '#222222'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to full window
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Calculate grid dimensions
        const cols = Math.ceil(canvas.width / size);
        const rows = Math.ceil(canvas.height / size);

        // Store square states
        const squares: { x: number; y: number; hovered: boolean }[] = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                squares.push({ x: i * size, y: j * size, hovered: false });
            }
        }

        // Mouse tracking
        let mouseX = -1000;
        let mouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        // Animation offset
        let offset = 0;

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update offset based on direction
            offset += speed;
            if (offset > size) offset = 0;

            squares.forEach((square) => {
                let drawX = square.x;
                let drawY = square.y;

                // Apply direction offset
                switch (direction) {
                    case 'up':
                        drawY -= offset;
                        break;
                    case 'down':
                        drawY += offset;
                        break;
                    case 'left':
                        drawX -= offset;
                        break;
                    case 'right':
                        drawX += offset;
                        break;
                    case 'diagonal':
                        drawX -= offset;
                        drawY -= offset;
                        break;
                }

                // Wrap around
                if (drawX < -size) drawX += canvas.width + size;
                if (drawX > canvas.width) drawX -= canvas.width + size;
                if (drawY < -size) drawY += canvas.height + size;
                if (drawY > canvas.height) drawY -= canvas.height + size;

                // Check hover
                const isHovered = 
                    mouseX >= drawX && 
                    mouseX <= drawX + size && 
                    mouseY >= drawY && 
                    mouseY <= drawY + size;

                // Draw square
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1;

                if (isHovered) {
                    ctx.fillStyle = hoverFillColor;
                    ctx.fillRect(drawX, drawY, size, size);
                }

                ctx.strokeRect(drawX, drawY, size, size);
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [speed, size, direction, borderColor, hoverFillColor]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default Squares;