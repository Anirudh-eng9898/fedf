const Skeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return skeletons.map((_, i) => (
      <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    ));
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {skeletons.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-gray-800/30 rounded-xl">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-48 bg-gray-700/50 rounded-xl"></div>
      </div>
    );
  }

  return null;
};

export default Skeleton;
