# GrokCon Agent

AI-powered government contracting opportunities platform.

## Features

- Government contract opportunity discovery
- AI-powered relevance scoring
- Automated opportunity matching
- Deadline tracking and alerts
- Agency and solicitation filtering

## API Routes

### Opportunities
- `GET /api/opportunities` - List opportunities with AI scoring and filtering
- `POST /api/opportunities` - Create new opportunity (with automatic AI analysis)

## Dashboard

Access the dashboard at `/dashboard` to view:
- Top matched opportunities sorted by AI relevance
- High-value contracts ($5M+)
- Urgent deadlines
- AI-generated summaries and insights

## AI Integration

GrokCon leverages the shared `@hbu/ai` package for:
- Relevance scoring based on keywords and criteria
- Automated content summarization
- Future enhancements: NLP search, proposal assistance, win probability

## Future Enhancements

- Natural language search
- Personalized matching based on company capabilities
- Automated proposal generation
- Competitive analysis
- Win probability predictions
