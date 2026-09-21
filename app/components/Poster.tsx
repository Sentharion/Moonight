interface PosterProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    loading?: "lazy" | "eager";
    onError?: () => void;
}

const Poster = ({
    src,
    alt,
    width,
    height,
    className,
    loading = "lazy",
    onError,
}: PosterProps) => {
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            className={className}
            onError={onError}
        />
    );
};

export default Poster;