const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// Sample financial news articles for sentiment analysis
const financialNews = [
  {
    id: 1,
    headline: "Tech stocks surge as AI companies report record profits",
    content:
      "Major technology companies have announced exceptional quarterly earnings driven by artificial intelligence initiatives. Investors are optimistic about future growth prospects.",
  },
  {
    id: 2,
    headline: "Market faces headwinds as inflation concerns resurface",
    content:
      "Economic data suggests inflationary pressures are returning, causing uncertainty in financial markets. Central banks may need to reconsider their monetary policy stance.",
  },
  {
    id: 3,
    headline: "Green energy stocks decline amid regulatory uncertainty",
    content:
      "Solar and wind energy companies faced selling pressure following ambiguous government policy announcements. Industry experts express concern about investment impact.",
  },
  {
    id: 4,
    headline: "Startup ecosystem thrives with record venture capital funding",
    content:
      "Venture capital firms report unprecedented interest in emerging technologies and innovative startups. The entrepreneurial landscape shows strong momentum and confidence.",
  },
  {
    id: 5,
    headline: "Banking sector faces challenges from digital disruption",
    content:
      "Traditional banks struggle as fintech companies gain market share. Industry consolidation and digital transformation efforts are underway but progress is slow.",
  },
];

interface SentimentAnalysis {
  id: number;
  headline: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  explanation: string;
}

async function analyzeNewsSentiment(
  articles: typeof financialNews
): Promise<SentimentAnalysis[]> {
  const results: SentimentAnalysis[] = [];

  for (const article of articles) {
    const prompt = `Analyze the sentiment of the following financial news article. Respond with a JSON object containing:
- sentiment: 'positive', 'negative', or 'neutral'
- confidence: a number between 0 and 1 indicating confidence in the sentiment assessment
- explanation: a brief explanation of why you assigned this sentiment

Article Headline: "${article.headline}"
Article Content: "${article.content}"

Respond ONLY with the JSON object, no other text.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = JSON.parse(responseText);

    results.push({
      id: article.id,
      headline: article.headline,
      sentiment: parsed.sentiment,
      confidence: parsed.confidence,
      explanation: parsed.explanation,
    });
  }

  return results;
}

function generateSentimentSummary(results: SentimentAnalysis[]): void {
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  let totalConfidence = 0;

  for (const result of results) {
    sentimentCounts[result.sentiment]++;
    totalConfidence += result.confidence;
  }

  const averageConfidence = totalConfidence / results.length;
  const sentimentScore =
    (sentimentCounts.positive - sentimentCounts.negative) / results.length;

  console.log("\n" + "=".repeat(80));
  console.log("SENTIMENT ANALYSIS SUMMARY");
  console.log("=".repeat(80));

  console.log("\nArticle-by-Article Analysis:");
  console.log("-".repeat(80));

  for (const result of results) {
    console.log(`\nArticle #${result.id}: "${result.headline}"`);
    console.log(
      `  Sentiment: ${result.sentiment.toUpperCase()} (Confidence: ${(result.confidence * 100).toFixed(1)}%)`
    );
    console.log(`  Explanation: ${result.explanation}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("OVERALL MARKET SENTIMENT");
  console.log("=".repeat(80));
  console.log(`  Positive Articles: ${sentimentCounts.positive}`);
  console.log(`  Negative Articles: ${sentimentCounts.negative}`);
  console.log(`  Neutral Articles: ${sentimentCounts.neutral}`);
  console.log(
    `  Average Confidence: ${(averageConfidence * 100).toFixed(1)}%`
  );
  console.log(
    `  Overall Sentiment Score: ${sentimentScore.toFixed(3)} (range: -1 to +1)`
  );

  if (sentimentScore > 0.2) {
    console.log(
      `  Market Outlook: BULLISH - Predominantly positive sentiment detected`
    );
  } else if (sentimentScore < -0.2) {
    console.log(
      `  Market Outlook: BEARISH - Predominantly negative sentiment detected`
    );
  } else {
    console.log(
      `  Market Outlook: NEUTRAL - Mixed sentiment with no clear direction`
    );
  }

  console.log("=".repeat(80));
}

async function main(): Promise<void> {
  console.log("Financial News Sentiment Analysis Bot");
  console.log("=====================================\n");
  console.log(`Analyzing ${financialNews.length} financial news articles...\n`);

  try {
    const sentimentResults = await analyzeNewsSentiment(financialNews);
    generateSentimentSummary(sentimentResults);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw error;
  }
}

main();