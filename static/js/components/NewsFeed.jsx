function NewsFeed() {
    const { useState, useEffect } = React;
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadNews();
    }, []);

    // Initialize Feather icons after component renders
    useEffect(() => {
        if (window.feather) {
            window.feather.replace();
        }
    }, [news]);

    const loadNews = async (refresh = false) => {
        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        setError('');

        try {
            const response = await axios.get('/api/news', {
                params: {
                    page_size: 20,
                    category: 'health'
                }
            });

            if (response.data.status === 'ok') {
                setNews(response.data.articles);
                setLastUpdated(new Date());
                
                if (response.data.articles.length === 0) {
                    setError('No medical news articles found at the moment. Please try again later.');
                }
            } else {
                setError('Failed to load news articles');
            }
        } catch (error) {
            console.error('News loading error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to load medical news. Please check your internet connection.';
            setError(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadNews(true);
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown date';
        }
    };

    const getTimeAgo = (dateString) => {
        try {
            const now = new Date();
            const date = new Date(dateString);
            const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
            
            if (diffInHours < 1) return 'Just now';
            if (diffInHours < 24) return `${diffInHours}h ago`;
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays}d ago`;
            
            return formatDate(dateString);
        } catch {
            return 'Unknown time';
        }
    };

    const truncateText = (text, maxLength = 150) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="medical-gradient rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i data-feather="activity" className="w-8 h-8 text-white"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical News Feed</h1>
                <p className="text-gray-600">Stay updated with the latest medical research and health news</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-4 sm:mb-0">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-health-500 rounded-full mr-2 pulse-slow"></div>
                        <span className="text-sm text-gray-600">
                            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading news...'}
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="btn-medical px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                    <i data-feather="refresh-cw" className={`w-4 h-4 mr-2 inline ${refreshing ? 'animate-spin' : ''}`}></i>
                    {refreshing ? 'Refreshing...' : 'Refresh News'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <i data-feather="alert-circle" className="w-5 h-5 text-red-500 mr-2"></i>
                        <span className="text-red-800">{error}</span>
                    </div>
                    <button
                        onClick={() => loadNews()}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-4"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* News Articles */}
            {!loading && news.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((article, index) => (
                        <article key={index} className="card-hover bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Article Image */}
                            {article.urlToImage && (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div 
                                        className="h-48 bg-medical-gradient hidden items-center justify-center"
                                        style={{display: 'none'}}
                                    >
                                        <i data-feather="image" className="w-12 h-12 text-white opacity-50"></i>
                                    </div>
                                </div>
                            )}

                            {/* Article Content */}
                            <div className="p-6">
                                {/* Source and Time */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-medical-100 text-medical-800">
                                        <i data-feather="globe" className="w-3 h-3 mr-1"></i>
                                        {article.source.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {getTimeAgo(article.publishedAt)}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                                    {article.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {truncateText(article.description)}
                                </p>

                                {/* Author */}
                                {article.author && article.author !== 'Unknown' && (
                                    <div className="flex items-center mb-4 text-xs text-gray-500">
                                        <i data-feather="user" className="w-3 h-3 mr-1"></i>
                                        {article.author}
                                    </div>
                                )}

                                {/* Read More Button */}
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-medical-600 hover:text-medical-700 font-medium text-sm transition-colors"
                                >
                                    Read full article
                                    <i data-feather="external-link" className="w-3 h-3 ml-1"></i>
                                </a>
                            </div>

                            {/* News Item Border */}
                            <div className="news-item border-l-4 border-medical-500 pl-0"></div>
                        </article>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && news.length === 0 && !error && (
                <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <i data-feather="file-text" className="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No news articles available</h3>
                    <p className="text-gray-600 mb-4">We couldn't find any medical news articles at the moment.</p>
                    <button
                        onClick={() => loadNews()}
                        className="btn-medical px-6 py-2 rounded-lg font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* News Categories */}
            <div className="mt-12 bg-medical-gradient-light rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Medical News Categories
                </h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <i data-feather="activity" className="w-8 h-8 text-medical-600 mb-2"></i>
                        <span className="text-sm font-medium text-gray-700">Clinical Research</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <i data-feather="heart" className="w-8 h-8 text-health-600 mb-2"></i>
                        <span className="text-sm font-medium text-gray-700">Public Health</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <i data-feather="zap" className="w-8 h-8 text-medical-600 mb-2"></i>
                        <span className="text-sm font-medium text-gray-700">Medical Innovation</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <i data-feather="shield" className="w-8 h-8 text-health-600 mb-2"></i>
                        <span className="text-sm font-medium text-gray-700">Prevention & Wellness</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
