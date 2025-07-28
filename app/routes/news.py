import os
import logging
import requests
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

news_bp = Blueprint('news', __name__)

@news_bp.route('/api/news', methods=['GET'])
def get_medical_news():
    """Get filtered medical and health news from NewsAPI"""
    try:
        api_key = os.environ.get('NEWS_API_KEY')
        if not api_key:
            return jsonify({"error": "News API key not configured"}), 500
        
        # Get query parameters
        category = request.args.get('category', 'health')
        country = request.args.get('country', 'us')
        page_size = min(int(request.args.get('page_size', 20)), 100)
        
        # Medical keywords for filtering
        medical_keywords = [
            'medical', 'health', 'clinical', 'research', 'study', 'treatment',
            'medicine', 'healthcare', 'patient', 'doctor', 'hospital', 'therapy',
            'drug', 'pharmaceutical', 'disease', 'diagnosis', 'prevention'
        ]
        
        # Try multiple NewsAPI endpoints for comprehensive coverage
        news_articles = []
        
        # 1. Get health category news
        try:
            health_url = "https://newsapi.org/v2/top-headlines"
            health_params = {
                'apiKey': api_key,
                'category': 'health',
                'country': country,
                'pageSize': page_size // 2
            }
            
            health_response = requests.get(health_url, params=health_params, timeout=10)
            if health_response.status_code == 200:
                health_data = health_response.json()
                if 'articles' in health_data:
                    news_articles.extend(health_data['articles'])
        except Exception as e:
            logging.warning(f"Failed to fetch health category news: {e}")
        
        # 2. Get medical research and clinical news
        try:
            research_url = "https://newsapi.org/v2/everything"
            research_params = {
                'apiKey': api_key,
                'q': 'medical research OR clinical trial OR health study',
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': page_size // 2,
                'from': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            }
            
            research_response = requests.get(research_url, params=research_params, timeout=10)
            if research_response.status_code == 200:
                research_data = research_response.json()
                if 'articles' in research_data:
                    news_articles.extend(research_data['articles'])
        except Exception as e:
            logging.warning(f"Failed to fetch medical research news: {e}")
        
        # Remove duplicates and filter for quality
        seen_urls = set()
        filtered_articles = []
        
        for article in news_articles:
            if not article or not article.get('url') or article['url'] in seen_urls:
                continue
            
            # Basic quality filters
            if (not article.get('title') or 
                not article.get('description') or 
                len(article.get('description', '')) < 50):
                continue
            
            # Check if article is medically relevant
            title_lower = article.get('title', '').lower()
            desc_lower = article.get('description', '').lower()
            
            is_medical = any(keyword in title_lower or keyword in desc_lower 
                           for keyword in medical_keywords)
            
            if is_medical:
                seen_urls.add(article['url'])
                
                # Clean and format article data
                clean_article = {
                    'title': article.get('title', '').strip(),
                    'description': article.get('description', '').strip(),
                    'url': article.get('url'),
                    'urlToImage': article.get('urlToImage'),
                    'publishedAt': article.get('publishedAt'),
                    'source': {
                        'name': article.get('source', {}).get('name', 'Unknown')
                    },
                    'author': article.get('author') or 'Unknown'
                }
                
                filtered_articles.append(clean_article)
        
        # Sort by publication date (newest first)
        filtered_articles.sort(
            key=lambda x: x.get('publishedAt', ''), 
            reverse=True
        )
        
        # Limit to requested page size
        filtered_articles = filtered_articles[:page_size]
        
        if not filtered_articles:
            return jsonify({
                "status": "ok",
                "totalResults": 0,
                "articles": [],
                "message": "No medical news articles found. This could be due to API limits or no recent medical news."
            })
        
        return jsonify({
            "status": "ok",
            "totalResults": len(filtered_articles),
            "articles": filtered_articles,
            "last_updated": datetime.now().isoformat()
        })
        
    except requests.RequestException as e:
        logging.error(f"News API request error: {e}")
        return jsonify({
            "error": "Failed to fetch news from external API",
            "details": "Please check your internet connection and API key"
        }), 503
    
    except Exception as e:
        logging.error(f"Error in get_medical_news: {e}")
        return jsonify({
            "error": "Failed to retrieve medical news",
            "details": "An unexpected error occurred while processing news data"
        }), 500

@news_bp.route('/api/news/sources', methods=['GET'])
def get_news_sources():
    """Get available news sources for medical content"""
    try:
        api_key = os.environ.get('NEWS_API_KEY')
        if not api_key:
            return jsonify({"error": "News API key not configured"}), 500
        
        url = "https://newsapi.org/v2/sources"
        params = {
            'apiKey': api_key,
            'category': 'health',
            'language': 'en'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({"error": "Failed to fetch news sources"}), response.status_code
        
    except Exception as e:
        logging.error(f"Error getting news sources: {e}")
        return jsonify({"error": "Failed to retrieve news sources"}), 500
