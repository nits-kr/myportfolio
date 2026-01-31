export const loaderStyles = `
.modern-loader {
    position: relative;
    width: 100px;
    height: 100px;
}

.loader-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #7c3aed; /* Primary color */
    animation: simple-spin 1.5s linear infinite;
}

.loader-ring:nth-child(1) {
    border-top-color: #7c3aed;
    animation: simple-spin 1.5s linear infinite;
}

.loader-ring:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: #a855f7; /* Secondary color */
    animation: simple-spin 2s linear infinite reverse;
}

.loader-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    animation: pulse 2s ease-in-out infinite;
}

.loader-icon svg {
    width: 40px;
    height: 40px;
}

@keyframes simple-spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(0.95);
    }
    50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.05);
    }
}
`;
