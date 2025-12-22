const { 
  searchChannels, 
  searchVideosForChannels,
  getChannelDetails,
  getRecentVideos,
  getVideoDetails
} = require('./services/youtubeService');
const { applyHardFilters } = require('./filters/channelFilters');
const { analyzeGamingContent } = require('./analyzers/gameDetector');
const { calculateQualityScore } = require('./scoring/qualityScore');
const { saveChannel } = require('./services/dbService');
const { GAMES, GAMING_KEYWORDS } = require('./config/constants');

/**
 * Process a single channel through the entire pipeline
 * @param {string} channelId - Channel ID
 * @returns {Object|null} - Processed channel data or null if filtered
 */
async function processChannel(channelId) {
  try {
    console.log(`\n📺 Processing channel: ${channelId}`);
    
    // 1. Get channel details
    const channelDetails = await getChannelDetails(channelId);
    console.log(`   Title: ${channelDetails.title}`);
    console.log(`   Subscribers: ${channelDetails.subscriberCount}`);
    
    // 2. Get recent videos
    const videoIds = await getRecentVideos(channelDetails.uploadsPlaylistId, 10);
    const recentVideos = await getVideoDetails(videoIds);
    
    // Get last upload date
    const lastUploadDate = recentVideos.length > 0 ? recentVideos[0].publishedAt : null;
    
    const channelData = {
      ...channelDetails,
      recentVideos,
      lastUploadDate
    };
    
    // 3. Apply hard filters
    console.log(`   Applying filters...`);
    const filterResult = await applyHardFilters(channelData);
    
    if (!filterResult.pass) {
      console.log(`   ❌ Filtered out:`);
      filterResult.reasons.forEach(reason => console.log(`      - ${reason}`));
      return null;
    }
    
    console.log(`   ✅ Passed filters`);
    
    // 4. Analyze gaming content
    console.log(`   Analyzing gaming content...`);
    const gamingAnalysis = analyzeGamingContent(channelData);
    console.log(`   Detected games: ${gamingAnalysis.detectedGames.join(', ') || 'none'}`);
    
    // 5. Calculate quality score
    console.log(`   Calculating quality score...`);
    const scoreResult = calculateQualityScore(channelData, gamingAnalysis);
    console.log(`   Quality Score: ${scoreResult.total}/100`);
    console.log(`      - View Reliability: ${scoreResult.breakdown.viewReliability}/30`);
    console.log(`      - Avg View Power: ${scoreResult.breakdown.avgViewPower}/25`);
    console.log(`      - Activity: ${scoreResult.breakdown.activity}/20`);
    console.log(`      - Gaming Fit: ${scoreResult.breakdown.gamingFit}/25`);
    
    // 6. Prepare final data
    const finalData = {
      channelId: channelDetails.channelId,
      channelUrl: `https://youtube.com/channel/${channelDetails.channelId}`,
      title: channelDetails.title,
      subscriberCount: channelDetails.subscriberCount,
      last6Views: recentVideos.slice(0, 6).map(v => v.viewCount),
      detectedGames: gamingAnalysis.detectedGames,
      qualityScore: scoreResult.total,
      scoreBreakdown: scoreResult.breakdown,
      metrics: scoreResult.metrics,
      lastCheckedAt: new Date().toISOString()
    };
    
    // 7. Save to database
    await saveChannel(finalData);
    console.log(`   💾 Saved to database`);
    
    return finalData;
    
  } catch (error) {
    console.error(`   ⚠️  Error processing channel ${channelId}:`, error.message);
    return null;
  }
}

/**
 * Discover channels using multiple strategies
 * @param {Array<string>} queries - Array of search queries
 * @returns {Set<string>} - Set of unique channel IDs
 */
async function discoverChannels(queries) {
  const channelIds = new Set();
  
  console.log('\n🔍 Starting channel discovery...\n');
  
  for (const query of queries) {
    try {
      console.log(`Searching for: "${query}"`);
      
      // Method A: Direct channel search
      const channels = await searchChannels(query);
      channels.forEach(ch => channelIds.add(ch.channelId));
      console.log(`   Found ${channels.length} channels`);
      
      // Method B: Video reverse discovery
      const videoChannelIds = await searchVideosForChannels(query);
      videoChannelIds.forEach(id => channelIds.add(id));
      console.log(`   Found ${videoChannelIds.length} channels from videos`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`   Error searching for "${query}":`, error.message);
    }
  }
  
  console.log(`\n✨ Total unique channels discovered: ${channelIds.size}\n`);
  return channelIds;
}

/**
 * Main pipeline function
 */
async function runPipeline() {
  try {
    console.log('🚀 YouTube Gaming Channel Analyzer');
    console.log('==================================\n');
    
    // Prepare search queries (combine games + keywords)
    const searchQueries = [
      ...GAMES.slice(0, 1), 
      ...GAMING_KEYWORDS.slice(0, 1)
    ];
    
    // 1. Discovery phase
    const channelIds = await discoverChannels(searchQueries);
    
    // 2. Process each channel
    console.log('🔄 Processing channels...\n');
    const results = [];
    
    for (const channelId of channelIds) {
      const result = await processChannel(channelId);
      if (result) {
        results.push(result);
      }
      
      // Small delay between channels
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 3. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total channels discovered: ${channelIds.size}`);
    console.log(`Channels passed filters: ${results.length}`);
    console.log(`Success rate: ${((results.length / channelIds.size) * 100).toFixed(1)}%`);
    
    if (results.length > 0) {
      console.log('\n🏆 Top 5 Channels:');
      results
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 5)
        .forEach((ch, idx) => {
          console.log(`${idx + 1}. ${ch.title} - Score: ${ch.qualityScore}/100`);
        });
    }
    
    console.log('\n✅ Pipeline completed!\n');
    
  } catch (error) {
    console.error('❌ Pipeline error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runPipeline();
}

module.exports = {
  processChannel,
  discoverChannels,
  runPipeline
};
