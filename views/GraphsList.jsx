const React = require('react');

function GraphsList({ graphs }) {
  const [visibleCount, setVisibleCount] = React.useState(1);
  const visibleGraphs = graphs.slice(0, visibleCount);

  const loadMore = () => {
    console.log("hiii")
    setVisibleCount(prev => prev + 1);
  };

  return (
    <div>
      <h1>Graph Collection</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {visibleGraphs.map((graph) => (
          <div 
            key={graph.hash} 
            style={{ border: '1px solid #ccc', padding: '10px', width: '300px' }}
          >
            <h3>{graph.title}</h3>
            <p>Created: {new Date(graph.created).toLocaleDateString()}</p>
            <img 
              src={graph.thumbUrl} 
              alt={graph.title} 
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"  // Add lazy loading for images
            />
            <a href={graph.stateUrl} target="_blank" rel="noopener noreferrer">
              Open in Desmos
            </a>
          </div>
        ))}
      </div>
      
      {visibleCount < graphs.length && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button 
            onClick={loadMore}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            See More ({graphs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

module.exports = GraphsList;