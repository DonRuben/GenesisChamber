import './Skeleton.css';

export function SkeletonLine({ width = '100%', height = 14 }) {
  return <div className="sk-line" style={{ width, height }} />;
}

export function SkeletonCircle({ size = 32 }) {
  return <div className="sk-circle" style={{ width: size, height: size }} />;
}

export function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-card-header">
        <SkeletonCircle size={32} />
        <div className="sk-card-lines">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" height={10} />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine width="80%" />
      <SkeletonLine width="45%" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="sk-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPreset() {
  return (
    <div className="sk-preset">
      <SkeletonCircle size={28} />
      <SkeletonLine width="70%" height={12} />
      <SkeletonLine width="50%" height={10} />
    </div>
  );
}
