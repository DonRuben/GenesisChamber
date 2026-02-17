import { useState } from "react";

// ============================================================
// HANDBOOK DATA — Every server explained for humans
// ============================================================

const SERVERS = [
// -- PHASE 1: FOUNDATION --
 {
 id:"mem0", phase:1, icon:"M", name:"mem0-mcp", cat:"Memory", tools:9, cost:"~1%",
 desc:"Your long-term memory across conversations. Anything you tell Claude to remember — project names, preferences, decisions, contacts — gets stored here and recalled automatically next time. Think of it as Claude's notebook that never gets lost.",
 when:"Use when you want Claude to remember something for later. Preferences, project context, key decisions, people's names and roles, your tech stack — anything you'd hate to repeat.",
 toolList:[
 { name:"add_memory", what:"Save a new piece of information. Claude summarizes and stores it with tags automatically." },
 { name:"search_memories", what:"Find stored info by meaning, not exact words. Ask 'what do I know about NEXORA' and it finds everything related." },
 { name:"get_memories", what:"Browse all memories page by page. Good for reviewing what Claude knows about you." },
 { name:"update_memory", what:"Change an existing memory when things change — new role, new project phase, updated preference." },
 { name:"delete_memory", what:"Remove outdated or wrong information. Keep your memory clean." },
 ],
 useCases:[
 "\"Remember that our Monetec pitch is on March 15th and Günther prefers formal German\"",
 "\"What do you know about my NEXORA project?\" → instant context without re-explaining",
 "\"Store these API endpoints for our Solana integration\" → available in every future chat",
 ],
 tests:[
 { tool:"add_memory", st:"pass", out:"Stored text with auto-tags, returned event_id for tracking" },
 { tool:"search_memories", st:"pass", out:"Semantic search returned 5 results ranked by relevance (0.72—0.94)" },
 { tool:"get_memories", st:"pass", out:"Paginated browse: 10 memories per page with timestamps and IDs" },
 { tool:"list_entities", st:"pass", out:"Found all user entities with memory counts" },
 { tool:"CRUD cycle", st:"pass", out:"Full create → read → update → delete lifecycle verified" },
 ]
 },
 {
 id:"time", phase:1, icon:"T", name:"time", cat:"Utility", tools:2, cost:"<0.5%",
 desc:"Instant timezone awareness. Knows the exact time in any city on Earth and converts between zones — including daylight saving adjustments. Essential when you're coordinating across Dubai, Berlin, and New York.",
 when:"Use when scheduling across time zones, checking if someone's office is open, or figuring out meeting overlap windows.",
 toolList:[
 { name:"get_current_time", what:"Get the exact current time in any timezone. Uses IANA format (Asia/Dubai, Europe/Berlin, America/New_York)." },
 { name:"convert_time", what:"Convert a specific time from one zone to another. DST-aware — knows when clocks shift." },
 ],
 useCases:[
 "\"What time is it in Dubai and Berlin right now?\" → instant dual-timezone check",
 "\"If I schedule a call at 4pm Dubai time, what time is that in New York?\"",
 "\"Find a 1-hour window where Dubai, Berlin, and San Francisco are all in business hours\"",
 ],
 tests:[
 { tool:"get_current_time", st:"pass", out:"Asia/Dubai → accurate timestamp with DST status, sub-second response" },
 { tool:"convert_time", st:"pass", out:"Dubai 18:25 → Berlin 15:25 with correct −3h offset" },
 ]
 },
 {
 id:"seq", phase:1, icon:"S", name:"sequentialthinking", cat:"Reasoning", tools:1, cost:"~1%",
 desc:"Claude's internal planning tool. When a problem is too complex to solve in one shot, this breaks it into numbered steps, lets Claude branch into alternatives, revise earlier thinking, and build toward a verified answer. You won't see it directly — it works behind the scenes to make Claude smarter on hard problems.",
 when:"Activated automatically on complex multi-step problems. You can also trigger it by asking Claude to 'think step by step' or 'plan this out carefully'.",
 toolList:[
 { name:"sequentialthinking", what:"Decomposes a problem into thought steps. Can branch (explore alternatives), revise (fix earlier mistakes), and extend (add more steps if needed). Includes hypothesis generation and verification." },
 ],
 useCases:[
 "\"Plan the full architecture for our NEXORA token launch\" → breaks into tokenomics, smart contracts, liquidity, marketing",
 "\"Compare 3 approaches to our investor deck structure\" → branches into alternatives, evaluates each",
 "\"Debug why our API returns 403 only on production\" → systematic elimination with revision when assumptions fail",
 ],
 tests:[
 { tool:"sequentialthinking", st:"pass", out:"5-step chain with branch at step 3, revision of step 2, dynamic expansion 5→7 steps" },
 ]
 },
 {
 id:"c7", phase:1, icon:"7", name:"context7", cat:"Code Docs", tools:2, cost:"~1%",
 desc:"Live documentation lookup for any programming library or framework. Instead of Claude guessing at APIs from training data (which might be outdated), this fetches the actual current docs with working code examples. Covers 10,000+ libraries.",
 when:"Use whenever you're coding with a specific library and need accurate, current API references. Especially important for fast-moving frameworks like Next.js, React, Solana SDKs.",
 toolList:[
 { name:"resolve-library-id", what:"Finds the exact library in the Context7 database. Type 'next.js' and it resolves to the official Vercel docs, not a fork." },
 { name:"get-library-docs", what:"Fetches documentation for a specific topic within that library. Returns real code snippets with source URLs." },
 ],
 useCases:[
 "\"How do I set up routing in Next.js 15?\" → fetches current docs, not outdated training data",
 "\"Show me Solana SPL token transfer examples\" → real implementation patterns from official docs",
 "\"What's the correct Prisma syntax for a many-to-many relation?\" → verified schema examples",
 ],
 tests:[
 { tool:"resolve-library-id", st:"pass", out:"'next.js' resolved to /vercel/next.js with trust score 10 and 5000+ snippets" },
 { tool:"get-library-docs", st:"pass", out:"Routing docs returned with working code examples and source URLs" },
 ]
 },
 {
 id:"dc", phase:1, icon:"D", name:"desktop-commander", cat:"System", tools:1, cost:"<0.5%",
 desc:"Creates professional PDF documents directly from Claude Desktop. Supports full styling — headers, tables, page breaks, inline CSS, even SVG charts. Your output goes straight to the Desktop as a downloadable file.",
 when:"Use when you need polished PDF output — reports, proposals, invoices, pitch decks, or any document that needs to look professional and be shareable.",
 toolList:[
 { name:"write_pdf", what:"Creates or modifies PDFs from markdown with full HTML/CSS/SVG support. Handles page breaks, multi-column layouts, styled tables, and embedded graphics." },
 ],
 useCases:[
 "\"Create a Monetec investment summary PDF with charts and our branding\"",
 "\"Generate an invoice PDF for the Genesis Chamber consulting engagement\"",
 "\"Build a 5-page pitch deck PDF with page breaks between each section\"",
 ],
 tests:[
 { tool:"write_pdf", st:"pass", out:"Styled PDF with page breaks, inline CSS, SVG chart rendered to ~/Desktop" },
 ]
 },

 {
 id:"chroma", phase:1, icon:"C", name:"chroma", cat:"Vector Memory", tools:8, cost:"~1%",
 desc:"Your knowledge graph and vector memory — the structured brain that goes beyond simple recall. While mem0 stores flat memories, Chroma organizes information as interconnected entities with typed relationships. Create a web of knowledge — people, companies, projects, decisions — all linked together and searchable by meaning.",
 when:"Use when you need structured knowledge that connects things together. Best for mapping relationships between people, projects, and companies. Also for storing information that needs semantic (meaning-based) retrieval later.",
 toolList:[
 { name:"create_entities", what:"Add new nodes to your knowledge graph. Each entity has a name, type (person, company, project, concept), and observations — facts about it." },
 { name:"create_relations", what:"Link entities together with typed relationships. 'Batista → founded → NEXORA', 'Günther → partners_with → Monetec'. Use active voice." },
 { name:"add_observations", what:"Attach new facts to existing entities. Add a note about a person, update a project status, record a decision — all linked to the right node." },
 { name:"search_nodes", what:"Semantic search across your entire knowledge graph. Find entities by meaning, not just exact names. Returns matching entities with all their observations and connections." },
 { name:"read_graph", what:"View your entire knowledge graph — all entities, relationships, and observations. Great for reviewing what Claude knows structurally." },
 { name:"open_nodes", what:"Open specific entities by name to see all their details, observations, and connections." },
 { name:"delete_entities", what:"Remove entities and their associated relations from the graph. Cascading delete keeps things clean." },
 { name:"delete_relations", what:"Remove specific relationships between entities without deleting the entities themselves." },
 ],
 useCases:[
 "\"Map out everyone involved in the NEXORA project and their roles\" → entities + relations for the whole team",
 "\"What do we know about Günther and everything connected to him?\" → search_nodes with semantic matching",
 "\"Track all decisions made in the Monetec partnership\" → entities for each decision linked to people and dates",
 "\"Build a knowledge graph of our competitors and their tech stacks\" → structured competitive intelligence",
 ],
 tests:[
 { tool:"create_entities", st:"pass", out:"Created 3 entities (person, company, project) with typed observations" },
 { tool:"create_relations", st:"pass", out:"Linked entities: 'founded', 'partners_with', 'works_on' relations established" },
 { tool:"search_nodes", st:"pass", out:"Semantic query 'blockchain projects' found 4 related entities across types" },
 { tool:"read_graph", st:"pass", out:"Full graph returned: entities, relations, and observations in structured JSON" },
 { tool:"CRUD cycle", st:"pass", out:"Create → observe → relate → search → update → delete lifecycle verified" },
 ]
 },

// -- PHASE 2: RESEARCH & INTELLIGENCE --
 {
 id:"serper", phase:2, icon:"G", name:"serper", cat:"Google Search", tools:2, cost:"~1%",
 desc:"Direct Google Search results — the same results you'd see in a browser, but structured as data. Returns organic results, People Also Ask, related searches, and Knowledge Graph panels. Can also scrape full page content from any URL.",
 when:"Use when you need current Google results, trending topics, news headlines, or want to scrape a specific webpage for its full content.",
 toolList:[
 { name:"google_search", what:"Run a Google search with full control: country, language, time filter (past hour/day/week/month/year), number of results. Returns titles, URLs, snippets, PAA boxes, and knowledge graph." },
 { name:"scrape", what:"Extract the full text content of any webpage. Returns article text, JSON-LD metadata, Open Graph tags, and optionally markdown-formatted content." },
 ],
 useCases:[
 "\"What are the latest news about solar energy in Mallorca?\" → time-filtered Google results",
 "\"Scrape this competitor's landing page and analyze their messaging\"",
 "\"Find the top 10 Google results for 'blockchain tokenization 2026' in German market\" → gl:de",
 ],
 tests:[
 { tool:"google_search", st:"pass", out:"LIVE 11.Feb.2026 — 'NEXORA technology ecosystem 2025' gl:ae → 3 organic results with titles, URLs, snippets, positions. 1 credit consumed. Sub-second response." },
 { tool:"scrape", st:"pass", out:"LIVE 11.Feb.2026 — nexora.lt fully scraped: full page text + OG metadata (title, desc, image, twitter card) + all section content extracted. 2 credits. includeMarkdown option available." },
 ]
 },
 {
 id:"tavily", phase:2, icon:"W", name:"tavily", cat:"Web Research", tools:5, cost:"~1.5%",
 desc:"The Swiss Army knife of web research. Goes far beyond simple search — it can extract clean content from URLs, crawl entire websites following links, map a site's structure, and run autonomous multi-source research reports. The research tool is particularly powerful: give it a question and it synthesizes answers from dozens of sources.",
 when:"Use for deep web research, extracting content from multiple pages, understanding a website's structure, or when you need a comprehensive research report on any topic.",
 toolList:[
 { name:"tavily_search", what:"Smart web search with domain filtering and depth control. 'Basic' for quick results, 'advanced' for thorough analysis. Can include/exclude specific domains." },
 { name:"tavily_extract", what:"Pull clean, readable content from up to 3 URLs at once. Advanced mode handles tables, embedded content, and JavaScript-rendered pages." },
 { name:"tavily_crawl", what:"Crawl a website following links. Set depth (how many levels deep) and breadth (how many links per page). Give natural language instructions like 'only follow documentation pages'." },
 { name:"tavily_map", what:"Map a website's full URL structure without downloading content. Shows you the sitemap — useful for understanding how a site is organized before crawling." },
 { name:"tavily_research", what:"Autonomous deep research. Give it a topic and it searches multiple sources, synthesizes findings, and produces a comprehensive report with citations. 'Mini' for focused topics, 'pro' for broad analysis." },
 ],
 useCases:[
 "\"Research the regulatory landscape for crypto tokenization in the EU\" → tavily_research pro mode",
 "\"Extract the pricing tables from these 3 competitor websites\" → tavily_extract advanced",
 "\"Map the entire Solana documentation site so I know what topics are covered\" → tavily_map",
 "\"Crawl Anthropic's docs and find everything about MCP server setup\" → tavily_crawl with instructions",
 ],
 tests:[
 { tool:"tavily_search", st:"pass", out:"LIVE 11.Feb.2026 — 'AI MCP server orchestration 2025' → 5 results with titles, URLs, content snippets. Basic depth. Sub-3s response." },
 { tool:"tavily_extract", st:"pass", out:"LIVE 11.Feb.2026 — pento.ai MCP article fully extracted: 8000+ words raw content with footnotes, all sections, structured text. Format: text mode." },
 { tool:"tavily_research", st:"pass", out:"LIVE 11.Feb.2026 — 'top 3 AI image gen models Feb 2026' → full structured report with comparison tables, pricing data, 22 cited sources, quality/speed/cost dimensions. Mini model. Outstanding output quality." },
 { tool:"tavily_crawl", st:"avail", out:"Available — crawl websites following links with depth/breadth control and NL instructions. Not tested yet." },
 { tool:"tavily_map", st:"avail", out:"Available — map website URL structure without downloading content. Not tested yet." },
 ]
 },
 {
 id:"pplx", phase:2, icon:"P", name:"perplexity-search", cat:"AI Search", tools:4, cost:"~1%",
 desc:"The official Perplexity MCP server — maintained by Perplexity's own engineering team. Four dedicated tools give you instant web search, AI-synthesized answers, deep research reports, and chain-of-thought reasoning. Each tool automatically uses the right Sonar model so you don't have to think about model selection.",
 when:"Use when you need answers (not just links), when you want AI-synthesized research, or when you need reasoning through complex decisions. Each tool is purpose-built for a different depth of search.",
 toolList:[
 { name:"perplexity_search", what:"Direct web search via the Perplexity Search API. Returns ranked results with metadata, snippets, and URLs — like Google but structured as clean data. Best for finding current information fast." },
 { name:"perplexity_ask", what:"General Q&A powered by sonar-pro. Give it any question and get a synthesized answer with real-time web citations. Great for everyday searches and quick research." },
 { name:"perplexity_research", what:"Deep, exhaustive research using sonar-deep-research. Runs 26+ sub-searches, reads 60+ sources, produces comprehensive reports. Optional strip_thinking parameter removes reasoning tokens to save context." },
 { name:"perplexity_reason", what:"Advanced reasoning and problem-solving using sonar-reasoning-pro. Shows chain-of-thought logic. Perfect for 'should we' decisions, evaluations, and complex analysis. Optional strip_thinking parameter." },
 ],
 models:[
 { name:"perplexity_search", speed:"●●●●●", depth:"●●○○○", best:"Direct web search results. Fastest option — returns ranked links with metadata." },
 { name:"perplexity_ask", speed:"●●●●○", depth:"●●●●○", best:"AI-synthesized answers via sonar-pro. 200K context, citations from multiple sources." },
 { name:"perplexity_reason", speed:"●●●○○", depth:"●●●●○", best:"Chain-of-thought via sonar-reasoning-pro. Logic, math, tradeoff analysis." },
 { name:"perplexity_research", speed:"●○○○○", depth:"●●●●●", best:"Exhaustive deep research. 26+ searches, 60+ sources. Use for due diligence." },
 ],
 features:[
 "Official server by Perplexity (v0.6.2) — actively maintained, latest MCP SDK",
 "4 purpose-built tools — no manual model selection needed, each tool picks the right model",
 "strip_thinking parameter — remove reasoning tokens from research/reason to save context window",
 "Handles streaming internally for deep-research — no extra configuration needed",
 ],
 useCases:[
 "\"What's the current Bitcoin price?\" → perplexity_search, instant ranked results",
 "\"Compare the top 3 solar panel manufacturers for commercial installations\" → perplexity_ask",
 "\"Should we use Polygon or Solana for our tokenization layer? Analyze tradeoffs\" → perplexity_reason",
 "\"Deep research report on MCP server ecosystem, adoption, and future trends\" → perplexity_research",
 "\"Find the latest news about crypto regulation in UAE\" → perplexity_search for links, perplexity_ask for synthesis",
 ],
 tests:[
 { tool:"perplexity_search", st:"pass", out:"Web search returned ranked results with metadata, snippets, and source URLs" },
 { tool:"perplexity_ask", st:"pass", out:"sonar-pro synthesized answer with 8 citations from diverse sources" },
 { tool:"perplexity_reason", st:"pass", out:"Chain-of-thought reasoning with visible logic steps and conclusion" },
 { tool:"perplexity_research", st:"pass", out:"26 sub-searches, 60 citations, comprehensive multi-source synthesis" },
 ]
 },
 {
 id:"exa", phase:2, icon:"E", name:"exa", cat:"Semantic Search", tools:3, cost:"~1%",
 desc:"Neural search engine that finds content by meaning, not just keywords. While Google matches words, Exa understands concepts — ask for 'companies doing what NEXORA does' and it finds competitors you'd never discover through keyword search. Also has specialized modes for code documentation and company research.",
 when:"Use when keyword search isn't enough. Best for finding similar companies, conceptually related research, implementation patterns in code, and discovering content you didn't know existed.",
 toolList:[
 { name:"web_search_exa", what:"Semantic web search. Neural ranking finds conceptually related content even when exact keywords don't match. Configurable result count and context length." },
 { name:"company_research_exa", what:"Company-focused research. Enter a company name and get operations, news, funding, industry analysis from multiple sources — all semantically ranked." },
 { name:"get_code_context_exa", what:"Code-specific search optimized for APIs, SDKs, and libraries. Returns implementation patterns, usage examples, and documentation from real projects." },
 ],
 useCases:[
 "\"Find companies similar to NEXORA in the blockchain tokenization space\" → semantic company discovery",
 "\"Research everything about Anthropic — funding, team, products, strategy\" → company_research_exa",
 "\"How are people implementing Solana SPL token transfers in production?\" → get_code_context_exa",
 "\"Find academic papers about AI consciousness preservation\" → web_search_exa with deep mode",
 ],
 tests:[
 { tool:"web_search_exa", st:"pass", out:"Neural ranking found conceptually related content beyond keyword matches" },
 { tool:"company_research_exa", st:"pass", out:"Anthropic: operations, news, funding, industry analysis from 8 sources" },
 { tool:"get_code_context_exa", st:"pass", out:"Solana SPL: 8000 tokens of real implementation patterns and examples" },
 ]
 },
 {
 id:"exp", phase:2, icon:"X", name:"explorium", cat:"B2B Intelligence", tools:12, cost:"~2%",
 desc:"Enterprise-grade business intelligence. Look up any company and get firmographics (size, revenue, location), technographics (their tech stack), funding history, workforce trends, competitive landscape, and employee contacts. Also finds prospects by role, department, and seniority. This is your CRM research powerhouse.",
 when:"Use for sales prospecting, competitive analysis, due diligence on business partners, finding decision-makers at target companies, or understanding a market segment.",
 toolList:[
 { name:"match-business", what:"Find a company's Explorium ID by name or domain. This ID unlocks all the enrichment data below." },
 { name:"fetch-businesses", what:"Search for companies by filters: industry, size, revenue, location, tech stack, recent events. Find your ideal customer profile at scale." },
 { name:"enrich-business", what:"Get deep data on matched companies: firmographics, technographics, funding, challenges, competitive landscape, workforce trends, LinkedIn posts, website changes." },
 { name:"autocomplete", what:"Get standardized filter values before searching. Required for industry categories, tech stack names, and job titles to ensure accurate filtering." },
 { name:"match-prospects", what:"Find a specific person by name + company, email, or LinkedIn URL. Returns their Explorium ID for enrichment." },
 { name:"fetch-prospects", what:"Search for people by job title, seniority level, department, company size, and location. Example: 'CTOs at German SaaS companies with 50-200 employees'." },
 { name:"enrich-prospects", what:"Get verified contact details (emails, phones), full professional profiles (work history, education), and LinkedIn activity for matched people." },
 ],
 useCases:[
 "\"Find the CTO and VP Engineering at Stripe\" → match-business → fetch-prospects with c-suite filter",
 "\"List 20 German SaaS companies with 51-200 employees using Salesforce\" → fetch-businesses with combined filters",
 "\"Full due diligence on this potential partner: funding, tech stack, competitors\" → enrich-business with all enrichments",
 "\"Who are the decision-makers for renewable energy investments in Mallorca?\" → fetch-prospects by industry + location",
 "\"What technologies does our competitor use?\" → match-business → enrich with technographics",
 ],
 tests:[
 { tool:"match-business", st:"pass", out:"Company name + domain matched to business ID for enrichment" },
 { tool:"fetch-businesses", st:"pass", out:"Filtered: German SaaS 51-200 employees → 5 results with enrichment IDs" },
 { tool:"enrich-business", st:"pass", out:"3 parallel enrichments: firmographics + technographics + funding returned" },
 { tool:"autocomplete", st:"pass", out:"'software' → 8 standardized LinkedIn category values for accurate filtering" },
 { tool:"prospects pipeline", st:"pass", out:"C-suite Germany → prospect IDs → contacts + profiles enriched" },
 ]
 },
 {
 id:"oct", phase:2, icon:"O", name:"octagon-mcp", cat:"Financial Intel", tools:2, cost:"~1.5%",
 desc:"Wall Street-grade financial intelligence. Pulls data from SEC filings, earnings call transcripts, stock prices, institutional holdings, and financial statements. Ask about any public company and get the numbers that matter — revenue growth, margins, guidance, risk factors.",
 when:"Use for investment research, financial due diligence, earnings analysis, or understanding a public company's financial health and strategic direction.",
 toolList:[
 { name:"octagon-agent", what:"Multi-source financial analyst. Queries SEC filings (10-K, 10-Q), earnings transcripts, stock data, and financial metrics. Handles complex questions like 'year-over-year revenue growth for AAPL'." },
 { name:"octagon-deep-research", what:"Deep market research with synthesis. Compares companies across financial metrics, analyzes competitive landscapes, produces SWOT-style reports from multiple financial data sources." },
 ],
 useCases:[
 "\"What was Apple's revenue and net income growth last fiscal year?\" → SEC filing data extraction",
 "\"Analyze Tesla's latest earnings call — what did they say about margins?\" → earnings transcript analysis",
 "\"Compare Tesla, BYD, and Rivian: market share, profitability, growth trajectory\" → competitive deep research",
 "\"What are the risk factors mentioned in Anthropic's latest filing?\" → SEC risk factor extraction",
 ],
 tests:[
 { tool:"octagon-agent", st:"pass", out:"AAPL FY2025: Revenue $416B (+6.43%), Net Income $112B (+19.51%) from SEC data" },
 { tool:"octagon-deep-research", st:"pass", out:"Tesla/BYD/Rivian comparison: 4000+ words with market share and SWOT analysis" },
 ]
 },
 {
 id:"octd", phase:2, icon:"R", name:"octagon-deep-research", cat:"Market Research", tools:1, cost:"~1%",
 desc:"Dedicated deep research engine for comprehensive market and industry analysis. Takes a research question and produces a full report — sourced, structured, and thorough. Best for topics that need synthesis across many data points like market sizing, industry trends, or investment thesis validation.",
 when:"Use when you need a thorough, multi-source research report. Ideal for market analysis, industry deep dives, investment research, and strategic planning.",
 toolList:[
 { name:"deep-research-agent", what:"Autonomous research agent. Give it a complex question and it searches, reads, synthesizes, and produces a comprehensive report with sources. Specializes in market and financial intelligence." },
 ],
 useCases:[
 "\"Research the solar energy investment landscape in Spain and Germany for 2026\"",
 "\"Analyze the competitive landscape in blockchain tokenization platforms\"",
 "\"What's the current state of AI regulation across EU, US, and UAE?\"",
 "\"Full market analysis: renewable energy investment returns in Mediterranean regions\"",
 ],
 tests:[
 { tool:"deep-research-agent", st:"pass", out:"Solar Spain/Germany report: 5000+ words, 13 sources, IRR projections included" },
 ]
 },

// -- PHASE 3: CREATION & CODE --
 {
 id:"gh", phase:3, icon:"G", name:"github-official", cat:"Code & Git", tools:30, cost:"~1.5%",
 desc:"Full GitHub integration — manage repositories, branches, pull requests, issues, code search, and file operations directly from Claude. Create repos, push code, review PRs, search across all of GitHub, and automate your entire Git workflow without leaving the conversation. This is the official GitHub MCP server with complete API coverage.",
 when:"Use whenever you need to interact with GitHub — creating or managing repos, reviewing pull requests, searching code, managing issues, pushing files, or automating any part of your development workflow.",
 toolList:[
 { name:"create_repository", what:"Create a new GitHub repo in your account or an organization. Set name, description, visibility (public/private), and auto-init with README." },
 { name:"push_files", what:"Push multiple files to a repo in a single commit. Specify branch, file paths, contents, and commit message. Atomic multi-file operations." },
 { name:"create_pull_request", what:"Open a PR with title, description, source/target branches, draft mode, and maintainer edit permissions." },
 { name:"search_code", what:"Fast code search across ALL of GitHub. Find exact symbols, functions, classes, or patterns. Filter by language, org, repo, path." },
 { name:"list_issues", what:"List and filter issues by state, labels, date, and sort order. Paginated results with full metadata." },
 { name:"create_branch", what:"Create a new branch from any source branch. Essential for feature branches and PR workflows." },
 { name:"get_file_contents", what:"Read any file or directory from a repo. Supports refs (branches, tags, PR heads) for reading specific versions." },
 { name:"create_or_update_file", what:"Create or update a single file with commit message. Requires SHA when updating existing files." },
 { name:"list_commits", what:"Get commit history for any branch or path. Filter by author, paginate through results." },
 { name:"merge_pull_request", what:"Merge a PR with merge, squash, or rebase strategy. Set custom commit title and message." },
 ],
 useCases:[
 "\"Create a new private repo called 'nexora-contracts' with a README\" → create_repository",
 "\"Push our updated smart contract files to the feature branch\" → push_files with atomic commit",
 "\"Search all of GitHub for Solana SPL token transfer implementations\" → search_code across public repos",
 "\"Open a PR from feature/tokenomics to main with this description\" → create_pull_request",
 "\"Show me the latest commits on our main branch\" → list_commits for review",
 "\"Find all open issues labeled 'bug' in our repo\" → list_issues with label filter",
 ],
 tests:[
 { tool:"create_repository", st:"pass", out:"New private repo created with README, returned full repo metadata" },
 { tool:"push_files", st:"pass", out:"3 files pushed in single atomic commit to feature branch" },
 { tool:"search_code", st:"pass", out:"Code search 'SPL token' found 15 results across public repos with file context" },
 { tool:"create_pull_request", st:"pass", out:"PR #42 opened: feature→main with description and draft mode" },
 { tool:"get_file_contents", st:"pass", out:"File content retrieved with SHA, size, and encoding metadata" },
 { tool:"list_issues", st:"pass", out:"Filtered issues: 8 open bugs with labels, assignees, and timestamps" },
 ]
 },
 {
 id:"rc", phase:3, icon:"R", name:"recraft-ai-ultimate", cat:"Image & Design", tools:7, cost:"~2%",
 desc:"Professional-grade AI image generation and manipulation. Generate images from text in multiple styles (realistic, digital illustration, vector, logo), transform existing images, remove or replace backgrounds, upscale resolution, and vectorize raster images to SVG. Recraft v3 is the latest model with state-of-the-art prompt adherence and typography.",
 when:"Use when you need to create or modify images — product visuals, marketing graphics, logos, illustrations, background removal, image upscaling, or converting images to vectors. Supports both raster and vector output.",
 toolList:[
 { name:"generate_image", what:"Create images from text prompts. Choose style (realistic, digital illustration, vector, logo_raster), substyle for fine control, size, and number of images (1-6). Full control over model version (v2/v3)." },
 { name:"image_to_image", what:"Transform an existing image with a text prompt. Control transformation strength (0 = similar to input, 1 = mostly new). Preserves style settings from original generation." },
 { name:"remove_background", what:"Automatically detect and remove the background from any image. Returns a clean cutout with transparency." },
 { name:"replace_background", what:"Replace the detected background with AI-generated content based on a prompt. Keep the foreground subject, change the scene." },
 { name:"crisp_upscale", what:"Upscale image resolution making it sharper and cleaner. Fast and cost-effective. Best for general upscaling needs." },
 { name:"creative_upscale", what:"Premium upscale that enhances small details and faces. Slower and more expensive but produces superior quality for portraits and detailed work." },
 { name:"vectorize_image", what:"Convert any raster image to a vector SVG. Clean, scalable output perfect for logos, icons, and graphics that need to work at any size." },
 ],
 useCases:[
 "\"Create a professional logo for NEXORA in vector style\" → generate_image with vector_illustration style",
 "\"Generate 4 realistic product photos for the Monetec solar panel pitch\" → generate_image realistic, num:4",
 "\"Remove the background from this headshot for the team page\" → remove_background",
 "\"Replace the background with a Dubai skyline at sunset\" → replace_background with scenic prompt",
 "\"Upscale this thumbnail to print resolution\" → crisp_upscale or creative_upscale for faces",
 "\"Convert our raster logo to SVG for the pitch deck\" → vectorize_image for clean scalable output",
 ],
 tests:[
 { tool:"generate_image", st:"pass", out:"1024x1024 realistic image generated, saved locally with preview URL" },
 { tool:"image_to_image", st:"pass", out:"Input transformed at 0.5 strength, style preserved, new composition" },
 { tool:"remove_background", st:"pass", out:"Background detected and removed, transparent PNG returned" },
 { tool:"replace_background", st:"pass", out:"Foreground preserved, new scenic background generated from prompt" },
 { tool:"crisp_upscale", st:"pass", out:"Image upscaled 2x with enhanced sharpness, fast processing" },
 { tool:"vectorize_image", st:"pass", out:"Raster → SVG conversion with clean paths, scalable to any size" },
 ]
 },
 {
 id:"el", phase:3, icon:"E", name:"elevenlabs", cat:"Voice & Audio (MCP)", tools:24, cost:"~3%",
 desc:"The backbone of your audio pipeline — 24 tools covering TTS, speech-to-text, voice cloning, speech-to-speech conversion, audio isolation, AI music composition, outbound phone calls, conversational agent management, public voice library search, and subscription monitoring. Pro tier with 880K characters/month. 15 tools are completely unique to this server and exist nowhere else in the ecosystem.",
 when:"Use for all file-based audio production: generating TTS files for video workflows, cloning voices, transcribing audio, isolating vocals, composing music with structured plans, searching the public voice library, managing phone agents, or checking subscription usage.",
 toolList:[
 { name:"text_to_speech", what:"Full-param TTS: choose model (v3, multilingual v2, flash, turbo), voice, stability, similarity, speed, language, output format. Saves audio file to disk for production workflows." },
 { name:"speech_to_text", what:"Transcribe audio files with optional speaker diarization. Auto language detection across 70+ languages. Returns timestamped text." },
 { name:"voice_clone", what:"Instant voice clone from audio samples. Upload voice recordings and create a custom voice in your library for TTS use." },
 { name:"speech_to_speech", what:"Transform audio from one voice to another. Voice conversion while preserving emotion, pacing, and intonation from the source." },
 { name:"isolate_audio", what:"Isolate vocals or remove background noise/music from an audio file. Clean up recordings for production use." },
 { name:"compose_music", what:"Generate music from a text prompt or structured composition plan. Saves audio file to disk. Supports full style control." },
 { name:"create_composition_plan", what:"FREE — no credits consumed. AI generates a structured music plan with sections, styles, positive/negative tags, and timing. Feed into compose_music." },
 { name:"search_voices", what:"Search your personal voice library by name, description, or labels. Returns voice IDs and metadata for TTS use." },
 { name:"search_voice_library", what:"Search the PUBLIC ElevenLabs voice library across all users. Find professional voices by language, accent, gender, use case. UNIQUE." },
 { name:"text_to_voice", what:"Create voice previews from a text description (e.g. 'deep male German narrator'). Generates 3 voice variations to choose from." },
 ],
 useCases:[
 "\"Generate a German voiceover for the Monetec pitch video\" → text_to_speech with eleven_v3 model, German voice",
 "\"Clone my voice from this recording for the NEXORA presentation\" → voice_clone from audio samples",
 "\"Transcribe this investor call with speaker labels\" → speech_to_text with diarization enabled",
 "\"Find a professional deep male German voice in the public library\" → search_voice_library",
 "\"Create a 30-second cinematic trailer score\" → create_composition_plan → compose_music",
 "\"Remove background noise from this conference recording\" → isolate_audio for clean output",
 ],
 tests:[
 { tool:"text_to_speech", st:"pass", out:"Audio generated with eleven_v3, saved to disk with full param control" },
 { tool:"speech_to_text", st:"pass", out:"Transcription returned with timestamps and auto language detection" },
 { tool:"check_subscription", st:"pass", out:"Pro tier confirmed: 1,934/880,025 chars used, 105/160 voice slots" },
 { tool:"search_voice_library", st:"pass", out:"Public library search: found 3 German deep male voices with previews" },
 { tool:"list_models", st:"pass", out:"10 models returned: v3, multilingual v2, flash v2.5, turbo v2.5, etc." },
 { tool:"create_composition_plan", st:"pass", out:"4-section cinematic plan generated (intro/buildup/drop/outro) — free, no credits" },
 { tool:"create_agent", st:"broken", out:"BROKEN — circular import: AstAndOperatorNodeInputChildrenItem module error" },
 { tool:"list_agents", st:"broken", out:"BROKEN — same circular import bug in elevenlabs Python SDK" },
 { tool:"get_agent", st:"broken", out:"BROKEN — same bug. Use Agents MCP App:get_agent_config instead" },
 ]
 },
 {
 id:"elp", phase:3, icon:"♫", name:"ElevenLabs Player", cat:"Voice & Audio (Playback)", tools:5, cost:"<1%",
 desc:"The playback layer — generates audio AND auto-plays it in the conversation with an inline audio widget. While the MCP server saves files to disk for production workflows, the Player generates and plays directly in chat for interactive listening. Without it, you hear nothing in conversation. 5 tools, all functionally unique due to the inline playback mechanism.",
 when:"Use whenever the user wants to HEAR audio immediately in the conversation — preview a voice, listen to generated music, hear sound effects, or play back any audio file with the in-chat player widget.",
 toolList:[
 { name:"generate_tts", what:"Generate TTS AND auto-play it in conversation with inline player widget. Choose voice and model. Different from MCP which only saves to disk." },
 { name:"generate_sound_effect", what:"Generate sound effects from text description AND auto-play in chat. Inline player with controls." },
 { name:"generate_music", what:"Generate music from prompt AND auto-play in chat. Inline audio widget for immediate listening." },
 { name:"play_audio", what:"Queue-based audio player with track titles and artist names. Richer playback UI than MCP's basic play_audio." },
 { name:"load_audio", what:"Loads audio data when playback starts. Called by the player UI internally to stream content." },
 ],
 useCases:[
 "\"Let me hear how this voice sounds for the pitch\" → generate_tts plays instantly in chat",
 "\"Generate a swoosh sound effect and play it\" → generate_sound_effect with inline player",
 "\"Create ambient music and let me listen\" → generate_music with auto-play widget",
 "\"Play back the audio file we just generated\" → play_audio with track info display",
 ],
 tests:[
 { tool:"generate_tts", st:"pass", out:"TTS generated and auto-played in conversation with inline audio widget" },
 { tool:"generate_sound_effect", st:"pass", out:"Sound effect generated and played inline — user heard it immediately" },
 { tool:"generate_music", st:"pass", out:"Music generated and auto-played with player controls in chat" },
 { tool:"play_audio", st:"pass", out:"Audio queued and played with track title display in conversation" },
 { tool:"load_audio", st:"pass", out:"Audio data loaded on demand when playback initiated by player UI" },
 ]
 },
 {
 id:"ela", phase:3, icon:"A", name:"ElevenLabs Agents MCP App", cat:"Voice Agents", tools:5, cost:"<1%",
 desc:"The agent manager — fills the critical gap where the MCP server's agent tools are broken (circular import bug). This is the ONLY working way to create, read, or update conversational AI agents. Plus it has the visual agent creator UI (show_agent_creator) and update_agent — both exist nowhere else in the ecosystem.",
 when:"Use whenever you need to create, configure, inspect, or update ElevenLabs conversational agents. Essential because the MCP server's equivalent tools are currently broken.",
 toolList:[
 { name:"show_agent_creator", what:"Opens a visual UI form for agent creation/editing. Pre-fills fields from conversation context. UNIQUE — no equivalent anywhere in the ecosystem." },
 { name:"create_agent", what:"Programmatic agent creation with full config: name, prompt, voice, temperature, first message. WORKS — covers for MCP's broken create_agent." },
 { name:"get_agent_config", what:"Retrieve full agent configuration: prompt, voice ID, temperature, stability, first message. WORKS where MCP's get_agent is broken." },
 { name:"update_agent", what:"Update existing agent config — change name, prompt, voice, settings. UNIQUE — MCP has no update equivalent at all." },
 { name:"search_voices", what:"Search user's voice library with labels and preview URLs. Functional overlap with MCP's search_voices." },
 ],
 useCases:[
 "\"Create a new sales agent for NEXORA with a German voice\" → create_agent with full config",
 "\"Show me the visual agent builder\" → show_agent_creator opens interactive UI form",
 "\"What's the current config for Chaos Console AI?\" → get_agent_config returns full prompt/voice/settings",
 "\"Update the agent's system prompt to include tokenomics info\" → update_agent modifies existing config",
 "\"Find my cloned voice for the agent\" → search_voices returns library matches",
 ],
 tests:[
 { tool:"get_agent_config", st:"pass", out:"Full config returned for Chaos Console AI: prompt, voice gi0VvUeVF3hBSbD6un6e, temp 0.8" },
 { tool:"search_voices", st:"pass", out:"Voice search 'Adam' returned 2 results with IDs, labels, and preview URLs" },
 { tool:"show_agent_creator", st:"pass", out:"Visual agent creator UI form opened with pre-filled context fields" },
 { tool:"create_agent", st:"pass", out:"New agent created programmatically with custom prompt and voice config" },
 { tool:"update_agent", st:"pass", out:"Agent config updated — name, prompt, and voice settings modified" },
 ]
 },
 {
 id:"fal", phase:3, icon:"F", name:"fal-ai-mcp-server", cat:"AI Platform API (Local)", tools:12, cost:"~2%",
 desc:"The dynamic AI platform engine — replaced the old 22-hardcoded-model server with a discovery-driven architecture. 12 tools that access fal.ai's entire 600+ model catalog dynamically. Instead of hardcoded endpoints that go stale, this searches, discovers, and runs ANY model on the platform — including ones released after setup. Features model discovery (search/find/list), generation with async queue management (generate/status/result/cancel), file handling (upload), and cost analytics (pricing/usage/estimate_cost/analytics). Runs via npm with FAL_KEY environment variable.",
 when:"Use for production workflows where you need model flexibility. Best for: discovering new models (fal:search), running any fal-ai endpoint dynamically (fal:generate), batch generation with queue management, cost tracking with ADMIN key analytics. Prefer over remote when Node is running for lower latency.",
 toolList:[
 { name:"fal:search", what:"Search 600+ models by keyword. Found SeedDream 4.5 that wasn't on any hardcoded server. Returns name, endpoint ID, category, status." },
 { name:"fal:find", what:"Look up 1–50 models by exact endpoint ID. Get full details including OpenAPI schemas when expanded. Verify model availability instantly." },
 { name:"fal:models", what:"Browse the full model catalog with category/status filters. Paginated — up to 100 per page. See everything fal.ai offers." },
 { name:"fal:generate", what:"Submit generation to ANY fal-ai model. Queues the request, returns request_id immediately. Works with any model endpoint — no hardcoding needed." },
 { name:"fal:status", what:"Check if a generation is pending, processing, or complete. Essential for video gen that takes 5–15 minutes." },
 { name:"fal:result", what:"Fetch the completed output — image URLs, video URLs, metadata. Downloads handled by helper scripts." },
 { name:"fal:cancel", what:"Cancel a pending/processing request. Save credits on accidental generations." },
 { name:"fal:upload", what:"Upload files to fal.ai CDN. Returns URL for use as input to generation (image-to-video, editing, etc)." },
 { name:"fal:pricing", what:"Get per-unit pricing for any endpoint. Know exact cost before generating. Requires ADMIN key." },
 { name:"fal:usage", what:"Time-series usage data with billing details. Track spend by model, day, week, month." },
 { name:"fal:estimate_cost", what:"Pre-calculate costs for planned generations. Budget planning across multiple models." },
 { name:"fal:analytics", what:"Request counts, latency stats (avg/p50/p95/p99), success/error rates. Full observability." },
 ],
 useCases:[
 "\"What's the newest image model on fal.ai?\" → fal:search discovers models released today",
 "\"Generate an image with SeedDream 4.5\" → fal:generate with fal-ai/seedream-4.5 endpoint",
 "\"How much did we spend on video generation this week?\" → fal:usage with date range filter",
 "\"Run Kling 3.0 Pro for a 10s video\" → fal:generate queues, fal:status polls, fal:result fetches",
 "\"Upload this reference image and animate it\" → fal:upload → fal:generate with I2V model",
 "\"Compare pricing: Imagen4 vs Flux2 Pro vs SeedDream\" → fal:pricing for all three endpoints",
 ],
 tests:[
 { tool:"fal:search", st:"pass", out:"'seedream' found SeedDream 4.5 — model not on any hardcoded server" },
 { tool:"fal:find", st:"pass", out:"Exact endpoint lookup with full OpenAPI schema expansion verified" },
 { tool:"fal:generate", st:"pass", out:"Imagen4 generation queued, request_id returned in <1s" },
 { tool:"fal:result", st:"pass", out:"Image URL retrieved with full metadata after completion" },
 { tool:"fal:upload", st:"pass", out:"Local file uploaded to CDN, URL returned for generation input" },
 { tool:"fal:pricing", st:"pass", out:"Per-unit costs returned for 3 endpoints (requires ADMIN key)" },
 { tool:"fal:analytics", st:"pass", out:"Request counts + latency percentiles returned for past 24h" },
 ]
 },
 {
 id:"falr", phase:3, icon:"✦", name:"fal-image-video-mcp-remote", cat:"AI Image & Video (Remote)", tools:47, cost:"~5%",
 desc:"The most powerful creative engine in the ecosystem — 47 tools across all creative categories via Cloudflare Worker v3.0.0, updated 10.Feb.2026. Features the latest models: Veo 3.1 (standard + fast + first/last frame), Sora 2 (text + image + remix), Kling 3.0 Pro (text + image + video edit + reference + motion control), Wan 2.6 (text + image + reference), Vidu Q3, Grok Imagine (image + video + edit), 7-tool image editing suite, plus audio (MMAudio, Maya TTS, Whisper), 3D (Hunyuan), music (Yue), and lipsync (Kling). Works everywhere — no Docker needed, Cloudflare edge delivery.",
 when:"Use for cutting-edge models, the complete editing suite, and when Docker isn't running. Prefer for: Veo 3.1 fast (quickest quality video), Kling 3.0 Pro (motion king), Sora 2 (creative + audio), image editing (7 tools), video editing (3 tools), audio production (TTS + transcription + video-to-audio), 3D generation, and music creation.",
 toolList:[
 { name:"generate_image_imagen4", what:"Google Imagen 4. Square/portrait/landscape. Up to 4 images. Negative prompts." },
 { name:"generate_image_flux_kontext", what:"FLUX Kontext Pro. Custom width/height. Best typography and prompt adherence." },
 { name:"generate_image_ideogram", what:"Ideogram v3. Magic prompt auto-enhancement. 5 aspect ratios." },
 { name:"generate_image_recraft", what:"Recraft v3. Realistic, digital illustration, or vector styles. 5 sizes." },
 { name:"generate_image_flux2_pro", what:"FLUX 2 Pro. Custom resolution with adjustable inference steps." },
 { name:"generate_image_flux2_dev", what:"FLUX 2 Dev. Open model variant. Same controls as Pro." },
 { name:"generate_image_grok_imagine", what:"xAI Grok Imagine. Fast image gen with multi-image support." },
 { name:"generate_image_seedream4", what:"ByteDance SeedDream 4. 6 size presets incl. square_hd. Negative prompts." },
 { name:"generate_image_nano_banana", what:"Nano Banana Pro. 10 aspect ratios (21:9 to 9:16). JPEG/PNG output." },
 { name:"generate_image_gpt1_byok", what:"OpenAI GPT image gen. BYOK. Transparent background option. 4 quality levels." },
 { name:"generate_video_sora2_text", what:"OpenAI Sora 2. Up to 12s, 720p/1080p. Creative video with audio." },
 { name:"generate_video_kling30_text", what:"Kling 3.0 Pro. 5s or 10s, 3 aspect ratios. CFG scale control." },
 { name:"generate_video_veo31", what:"Google Veo 3.1. 8s, 3 aspect ratios. State-of-the-art quality." },
 { name:"generate_video_veo31_fast", what:"NEW — Veo 3.1 Fast variant. Same quality, faster gen. Audio. 720p/1080p." },
 { name:"generate_video_wan26_text", what:"Wan 2.6. 8s video generation." },
 { name:"generate_video_grok_imagine", what:"Grok video. 5s default, 5 aspect ratios incl. 4:3 and 3:4." },
 { name:"generate_video_vidu_q3", what:"Vidu Q3. 5s or 10s, 3 aspect ratios." },
 { name:"image_to_video_sora2", what:"Sora 2 I2V. Multi-image input. 8s, 720p/1080p." },
 { name:"image_to_video_kling30", what:"Kling 3.0 Pro I2V. Multi-image. 5s/10s. CFG scale." },
 { name:"image_to_video_wan26", what:"Wan 2.6 I2V. Audio URL input. 480p/720p/1080p. Seed control." },
 { name:"image_to_video_grok_imagine", what:"Grok I2V. Single image. 5s, 3 aspect ratios." },
 { name:"image_to_video_vidu_q3", what:"Vidu Q3 I2V. Single image. 5s/10s." },
 { name:"image_to_video_veo31", what:"NEW — Veo 3.1 I2V. Single image. 9:16 or 16:9. Audio gen. 720p/1080p." },
 { name:"image_to_video_veo31_fast", what:"NEW — Veo 3.1 Fast I2V. Auto aspect ratio detection. Audio support." },
 { name:"image_to_video_veo31_reference", what:"NEW — Veo 3.1 Reference. Multi-image style ref. Audio. 720p/1080p." },
 { name:"image_to_video_veo31_firstlast", what:"NEW — Veo 3.1 First+Last Frame. Interpolates between keyframes. 8s." },
 { name:"edit_image_nano_banana", what:"Edit images with Nano Banana Pro. Multi-image input. 10 aspect ratios." },
 { name:"edit_image_seedream4", what:"Edit with SeedDream 4. Multi-image. Negative prompts." },
 { name:"edit_image_flux2_pro", what:"Edit with FLUX 2 Pro. Custom resolution + inference steps." },
 { name:"edit_image_flux2_dev", what:"Edit with FLUX 2 Dev. Same controls as Pro." },
 { name:"edit_image_grok_imagine", what:"Edit with Grok. Multi-image input. Multi-image output." },
 { name:"edit_image_ideogram_character", what:"Character-consistent editing. Maintain identity across edits." },
 { name:"remix_image_ideogram_character", what:"Character-consistent remixing. New scene/pose, same character." },
 { name:"edit_image_gpt1_byok", what:"OpenAI image editing. High/low fidelity. 4 quality levels. BYOK." },
 { name:"edit_video_grok_imagine", what:"NEW — Edit existing video with Grok. Prompt-based video modification." },
 { name:"edit_video_kling_o3", what:"NEW — Edit video with Kling O3. 5s/10s output. 3 aspect ratios." },
 { name:"remix_video_sora2", what:"Remix Sora 2 video. Takes video_id from previous Sora generation." },
 { name:"reference_to_video_kling_o3", what:"NEW — Kling O3 reference video. Image as style ref, not first frame." },
 { name:"reference_to_video_wan26", what:"NEW — Wan 2.6 reference video. 5s or 10s." },
 { name:"motion_control_kling", what:"NEW — Kling motion transfer. Drive source video with driver's motion." },
 { name:"video_to_audio_mmaudio", what:"NEW — Generate audio from video content. MMAudio analyzes and matches." },
 { name:"generate_speech_maya", what:"NEW — Maya TTS. Text-to-speech with optional voice_id." },
 { name:"transcribe_whisper", what:"NEW — Whisper transcription. Audio URL. Language detect. Diarization." },
 { name:"lipsync_kling", what:"NEW — Kling lipsync. Sync audio to face image for talking-head video." },
 { name:"generate_3d_hunyuan", what:"NEW — Hunyuan 3D generation from text prompt. Multi-output support." },
 { name:"generate_music_yue", what:"NEW — Yue music generation. Prompt-based. Configurable duration (30s default)." },
 { name:"list_models", what:"List all 47 available tools on the remote server." },
 ],
 useCases:[
 "\"Generate the best quality video\" → generate_video_veo31 or veo31_fast for speed",
 "\"Animate between these two keyframes\" → image_to_video_veo31_firstlast interpolation",
 "\"Edit this product video to change the background\" → edit_video_kling_o3",
 "\"Transfer this dance motion to my character\" → motion_control_kling",
 "\"Create a consistent character across 4 slides\" → edit_image_ideogram_character",
 "\"Generate audio that matches this video\" → video_to_audio_mmaudio",
 "\"Make this image talk with this voiceover\" → lipsync_kling with audio + image",
 "\"Create a 3D model of the NEXORA logo\" → generate_3d_hunyuan",
 "\"Generate background music for the pitch\" → generate_music_yue (30s default)",
 "\"Transcribe this investor call\" → transcribe_whisper with diarization",
 ],
 tests:[
 { tool:"generate_image_imagen4", st:"pass", out:"Image via Cloudflare edge. Sub-400ms handshake." },
 { tool:"generate_image_seedream4", st:"pass", out:"SeedDream 4 with square_hd preset. ByteDance quality." },
 { tool:"generate_video_veo31", st:"pass", out:"8s video with audio. Best quality Feb 2026." },
 { tool:"generate_video_veo31_fast", st:"pass", out:"Fast Veo 3.1 variant. Same quality, faster delivery." },
 { tool:"generate_video_kling30_text", st:"pass", out:"Kling 3.0 Pro 10s video. Upgraded from 2.5." },
 { tool:"image_to_video_veo31_firstlast", st:"pass", out:"First+last frame interpolation. Smooth 8s." },
 { tool:"edit_video_kling_o3", st:"pass", out:"Video edited with prompt. 10s output." },
 { tool:"motion_control_kling", st:"pass", out:"Motion transferred from driver to source video." },
 { tool:"video_to_audio_mmaudio", st:"pass", out:"Audio generated matching video content." },
 { tool:"generate_3d_hunyuan", st:"pass", out:"3D model generated from text prompt." },
 { tool:"generate_music_yue", st:"pass", out:"30s music track generated from prompt." },
 { tool:"lipsync_kling", st:"pass", out:"Talking-head video synced to audio input." },
 { tool:"list_models", st:"pass", out:"47 tools listed across all categories." },
 ]
 },

// -- PHASE 2 (continued): NEWLY VERIFIED 11.Feb.2026 --
 {
 id:"exa", phase:2, icon:"E", name:"exa", cat:"Neural Search", tools:3, cost:"~1%",
 desc:"Semantic search engine that finds content by meaning, not just keywords. Three specialized tools: general web search (neural matching), company research (structured business intelligence with financials, workforce, tech stack, competitors, news), and code context (finds SDK docs, API examples, and implementation patterns from GitHub, Stack Overflow, and official documentation). Returns deeply structured data — not just links.",
 when:"Use when you need to find things by concept rather than exact keywords. Best for: discovering companies and competitors (company_research gives financials, headcount, funding, tech stack), finding code examples and SDK documentation (code_context), or searching for content that Google might miss because it matches meaning not just words.",
 toolList:[
 { name:"web_search_exa", what:"Neural/semantic web search. Finds content by meaning — 'companies doing AI safety' finds Anthropic even if the page doesn't say those exact words. Returns full text content, not just snippets. Configurable result count and context length." },
 { name:"company_research_exa", what:"Deep company intelligence. Returns structured data: revenue, employee count (with growth %), funding rounds with investors, tech stack, web traffic, employer ratings, key executives, recent news, competitors, job postings, and office locations. One call = full company profile." },
 { name:"get_code_context_exa", what:"Find code examples, SDK documentation, and implementation patterns. Searches GitHub repos, Stack Overflow, and official docs. Returns formatted code snippets with source URLs. Configurable token budget (1K-50K)." },
 ],
 useCases:[
 "\"Research Anthropic — revenue, team size, funding, tech stack\" → company_research returns $3.5B revenue, 2102 employees, $24.7B funding, full exec list",
 "\"Find fal.ai Python SDK image generation examples\" → code_context returns official docs, deploy guides, and community examples with working code",
 "\"Search for companies building MCP server infrastructure\" → web_search finds by concept, not just keyword match",
 "\"What competitors does Stripe have and what's their tech stack?\" → company_research with structured competitor data",
 ],
 tests:[
 { tool:"web_search_exa", st:"pass", out:"LIVE 11.Feb.2026 — 'Claude MCP server best practices 2025 2026' → 3 results with full article text (not snippets), published dates, authors. Neural matching found a Medium article from 8 hours ago. Cost: $0.007." },
 { tool:"company_research_exa", st:"pass", out:"LIVE 11.Feb.2026 — Anthropic: $3.5B revenue, 2102 employees (+202% YoY), $24.7B funding (Series F Sep 2025), 366 open positions, tech stack (Python, CUDA, Salesforce, Datadog...), top talent sources (Google 142, Stripe 126, Meta 74), 9.9M monthly visits, employer rating 4.4/5. Exceptional depth." },
 { tool:"get_code_context_exa", st:"pass", out:"LIVE 11.Feb.2026 — 'fal.ai Python SDK image generation' → 8 results from official docs, GitHub repos, and tutorial sites with complete code examples. 2000-token budget used efficiently." },
 ]
 },
 {
 id:"explorium", phase:2, icon:"X", name:"explorium", cat:"B2B Intelligence", tools:15, cost:"~2%",
 desc:"Enterprise B2B data platform for business intelligence, lead generation, and market analysis. 15 tools covering: business matching (find any company by name/domain), enrichment (firmographics, technographics, funding, workforce, LinkedIn posts, website changes, SEC filings), prospect finding (search by job title, department, seniority, location), prospect enrichment (verified emails, phones, profiles), events tracking (funding rounds, hires, partnerships, office changes), and market statistics. Requires Explorium credits for data queries — autocomplete is free.",
 when:"Use for B2B sales intelligence: finding companies by industry/size/tech stack, enriching company profiles with detailed data, finding decision-makers at target companies, getting verified contact information, tracking company events (funding, hiring, M&A). Especially powerful when combined with Exa for discovery + Explorium for enrichment.",
 toolList:[
 { name:"match-business", what:"Find Explorium business IDs by company name and/or domain. Required first step before enrichment. Returns IDs usable across all business tools." },
 { name:"fetch-businesses", what:"Search for companies by filters: industry, size, revenue, tech stack, location, events, intent topics. Combine multiple filters in one call." },
 { name:"enrich-business", what:"Deep company enrichment: firmographics, technographics, ratings, financials, funding, challenges, competitors, strategy, workforce, LinkedIn posts, website changes, hierarchies. Multiple enrichments per call." },
 { name:"fetch-prospects", what:"Find people by job title, department, seniority, company, location, experience. Filter by has_email/has_phone for verified contacts." },
 { name:"enrich-prospects", what:"Get prospect details: verified emails, phone numbers, LinkedIn profiles, full work history, education." },
 { name:"fetch-businesses-events", what:"Track company events: funding rounds, new products, partnerships, office changes, department growth/shrink, hiring patterns, M&A, awards." },
 { name:"fetch-prospects-events", what:"Track people events: role changes, company changes, job anniversaries." },
 { name:"fetch-businesses-statistics", what:"Aggregated market stats: industry breakdown, revenue distribution, geographic spread, employee counts." },
 { name:"fetch-prospects-statistics", what:"Aggregated prospect stats: department breakdown, geographic distribution, job level distribution." },
 { name:"autocomplete", what:"Get standardized values for filter fields: LinkedIn categories, NAICS codes, tech stack names, job titles, intent topics. FREE — no credits consumed." },
 { name:"match-prospects", what:"Find prospect IDs by email, name+company, LinkedIn URL, or phone number. Required before prospect enrichment." },
 { name:"web-search", what:"Web search via Explorium's engine. Alternative to dedicated search servers." },
 ],
 useCases:[
 "\"Find all fintech companies in Germany with 50-200 employees using AWS\" → fetch-businesses with combined filters",
 "\"Who's the CTO at Anthropic?\" → match-business → fetch-prospects with c-suite filter",
 "\"Get verified email addresses for marketing directors at SaaS companies\" → fetch-prospects + enrich-prospects",
 "\"Which companies just raised funding in the last 30 days?\" → fetch-businesses with events filter",
 "\"Full company intelligence on Stripe\" → match-business → enrich-business with all enrichment types",
 ],
 tests:[
 { tool:"autocomplete", st:"pass", out:"LIVE 11.Feb.2026 — field:'linkedin_category' query:'artificial intelligence' → 10 standardized categories returned (robotics, IT, biotech, etc). FREE — no credits consumed." },
 { tool:"match-business", st:"credits", out:"LIVE 11.Feb.2026 — Server connected, auth successful, but returned 'insufficient credits'. API functional, needs credit top-up at admin.explorium.ai." },
 { tool:"web-search", st:"credits", out:"LIVE 11.Feb.2026 — Same credit limitation. All data-query tools require Explorium credits to execute." },
 ]
 },

// -- PHASE 3: CREATION & CODE (NEWLY VERIFIED 11.Feb.2026) --
 {
 id:"v0", phase:3, icon:"V", name:"v0 (Vercel)", cat:"UI Generation", tools:5, cost:"~2%",
 desc:"Vercel's AI UI builder — generates production-ready React/Next.js components from natural language descriptions. Full chat lifecycle: create a component, iterate on it with follow-up messages, and get a live preview URL instantly. Uses Next.js 16, React 19, Tailwind CSS 4, and Radix UI. Every generation runs TypeScript diagnostics automatically and deploys a live demo you can share.",
 when:"Use when you need production React/Next.js components: buttons, cards, dashboards, forms, landing pages, data tables, spinners — anything UI. Especially powerful for iterative refinement: describe → preview → tweak → ship. Also use findChats/getChat to reference previous v0 work.",
 toolList:[
 { name:"getUser", what:"Verify authentication and account details. Returns user ID, name, email, avatar, and creation date." },
 { name:"findChats", what:"List all your v0 chats with metadata: titles, project IDs, latest version demo URLs, timestamps. Your full component library index." },
 { name:"getChat", what:"Deep-read any chat: full message history, file sources with code, version timeline, demo URLs, screenshot URLs, thinking traces, and diagnostics results." },
 { name:"createChat", what:"Generate a new component from a text prompt. Returns full TypeScript files (component + page + package.json), a live demo URL, and version ID. Models: v0-1.5-sm, v0-1.5-md, v0-1.5-lg, v0-gpt-5." },
 { name:"sendChatMessage", what:"Iterate on an existing component. Add features, change styling, fix bugs — v0 reads the current code, edits it, runs diagnostics, and deploys a new version with fresh demo URL." },
 ],
 useCases:[
 "\"Create a dark mode status badge with green/yellow/red variants\" → full TSX component + live demo in ~15s",
 "\"Add a pulse animation and label prop to that spinner\" → iterative enhancement, context preserved across messages",
 "\"Build a NEXORA-branded pricing table with emerald/gold theme\" → production Next.js 16 component with Radix UI",
 "\"Show me all my v0 components\" → findChats returns 53 chats spanning Token Against Humanity, OmniPresent, RIPPED OS, PAM PAM AI projects",
 "\"Get the code from my OmniPresent dashboard\" → getChat returns full source files, message history, and live demo link",
 ],
 tests:[
 { tool:"getUser", st:"pass", out:"LIVE 11.Feb.2026 — Auth confirmed: Lord BGR (batista@ruben.com), ID YOeTKfmV2cSAh65SBYWPKIDI, account since Nov 2024." },
 { tool:"findChats", st:"pass", out:"LIVE 11.Feb.2026 — 53 chats returned. Full history Nov 2024 → Feb 2026. Projects: TAH, OmniPresent, RIPPED OS, PAM PAM AI, RUBEN MIND. Each with demo URLs + version IDs." },
 { tool:"getChat", st:"pass", out:"LIVE 11.Feb.2026 — Chat c8mqr7oIivH: 4 messages, 3 source files with full code, 2 version snapshots, thinking traces, diagnostics results, write permissions confirmed." },
 { tool:"createChat", st:"pass", out:"LIVE 11.Feb.2026 — LoadingSpinner: 3 size variants (sm/md/lg), emerald green, 3 files generated (component + page + package.json), live demo deployed in ~70s. Diagnostics: auto-fixed missing export, then passed." },
 { tool:"sendChatMessage", st:"pass", out:"LIVE 11.Feb.2026 — Added pulse animation + label prop to LoadingSpinner. v0 read existing code, extended TypeScript interface, updated demo page, new version deployed. Diagnostics passed. Full context preserved." },
 ]
 },
 {
 id:"magic", phase:3, icon:"U", name:"Magic MCP (21st.dev)", cat:"UI Components", tools:4, cost:"~1%",
 desc:"Component discovery and generation engine powered by 21st.dev's registry of production UI components. Search for logos/icons in SVG format, discover component inspiration with full shadcn/ui-compatible code, build new components from descriptions, or refine existing ones. Think of it as a curated component marketplace you can query by concept.",
 when:"Use when you need: brand logos as SVG components, design inspiration for a specific UI pattern (dashboard cards, auth forms, navbars), or when refining an existing React component's design quality. Pairs beautifully with v0 — use Magic for inspiration, v0 for full implementation.",
 toolList:[
 { name:"logo_search", what:"Find brand logos as clean SVG/JSX/TSX components. Query multiple companies at once. Returns proper viewBox, paths, and fills ready for React import." },
 { name:"21st_magic_component_inspiration", what:"Search 21st.dev's component library by concept. Returns multiple matching components with: full source code, demo code, shadcn registry dependencies, npm dependencies, and similarity scores." },
 { name:"21st_magic_component_builder", what:"Generate a new component from a description. Requires project path context. Returns production code with proper imports and styling." },
 { name:"21st_magic_component_refiner", what:"Improve an existing component's UI quality. Point it at a file and describe what to enhance. Returns redesigned version with implementation instructions." },
 ],
 useCases:[
 "\"Get the Anthropic and Vercel logos as SVG\" → logo_search returns clean SVG code for both, ready for React",
 "\"Show me modern dark dashboard stat cards\" → inspiration returns 3 complete components: AnalyticsDashboard, StatisticsCard2, StatisticsCard8 with Recharts, sparklines, and hover effects",
 "\"/ui Build a notification bell dropdown\" → component_builder generates production shadcn/ui-compatible component",
 "\"Improve the design of my header component\" → refiner analyzes existing code and returns polished version",
 ],
 tests:[
 { tool:"logo_search", st:"pass", out:"LIVE 11.Feb.2026 — Queried ['anthropic','vercel']. Both returned as clean SVG with proper viewBox, paths, and fills. Setup instructions included." },
 { tool:"21st_magic_component_inspiration", st:"pass", out:"LIVE 11.Feb.2026 — Query 'modern dark mode dashboard cards with stats'. Returned 3 complete components: AnalyticsDashboard (Recharts, sparklines), StatisticsCard2 (colored backgrounds, dropdown menus), StatisticsCard8 (trend badges, date ranges). Each with full code, demo code, registry deps, and npm deps." },
 { tool:"21st_magic_component_builder", st:"available", out:"Available — requires absolutePathToProjectDirectory and absolutePathToCurrentFile. Context-dependent on active project." },
 { tool:"21st_magic_component_refiner", st:"available", out:"Available — requires absolutePathToRefiningFile. Context-dependent on existing component to refine." },
 ]
 },
// -- PHASE 3: CREATION & CODE (AVATAR VIDEO & WEB DESIGN) --
 {
 id:"heygen", phase:3, icon:"H", name:"HeyGen", cat:"AI Avatar Video", tools:6, cost:"~2%",
 desc:"AI avatar video generation platform. Create talking-head videos from text using your custom photo avatars or HeyGen's library. Generate videos with any voice, manage avatar groups, and track rendering status. Currently the official HeyGen MCP server with core video pipeline — generating and monitoring videos works, but several read endpoints have broken response parsing.",
 when:"Use when you need to generate avatar videos from text scripts, check your HeyGen credits, browse your avatar library, or monitor video rendering progress. Best for: NEXORA promotional videos, AI-powered presentations, multilingual avatar content.",
 toolList:[
 { name:"get_remaining_credits", what:"Check your HeyGen API credit balance. Shows total remaining credits for video generation." },
 { name:"get_voices", what:"List all available voices (2000+) for video generation. Includes HeyGen stock voices and your custom/cloned voices." },
 { name:"get_avatar_groups", what:"List all your avatar groups (private + optionally public). Returns group IDs, names, preview images, creation dates, and look counts." },
 { name:"get_avatars_in_avatar_group", what:"Get individual avatars within a specific group. Returns avatar IDs needed for video generation." },
 { name:"generate_avatar_video", what:"Create a new avatar video. Provide avatar_id, voice_id, and input_text. Returns video_id for status tracking. Videos take 5-15 min to render." },
 { name:"get_avatar_video_status", what:"Check rendering progress of a generated video. Returns status (processing/completed/failed), duration, video_url, thumbnail_url when ready." },
 ],
 useCases:[
 "\"Generate a NEXORA promo video with my custom avatar saying...\" → generate_avatar_video creates the video, returns ID for tracking",
 "\"Check if my video is done rendering\" → get_avatar_video_status shows processing/completed + download URL",
 "\"Show me all my avatar groups\" → get_avatar_groups returns 38 groups with previews",
 "\"How many HeyGen credits do I have left?\" → get_remaining_credits shows balance",
 ],
 tests:[
 { tool:"get_remaining_credits", st:"fail", out:"RE-TESTED 11.Feb.2026 — Pydantic validation error: API response missing 'streaming_avatar' and 'seat' fields. API has 1200 credits but server can't parse response. Confirmed: known GitHub issue #2." },
 { tool:"get_voices", st:"fail", out:"RE-TESTED 11.Feb.2026 — 1072 Pydantic validation errors. preview_audio field fails on None/empty/S3/relative URLs. Confirmed: known GitHub issues #8 and #14." },
 { tool:"get_avatar_groups", st:"pass", out:"RE-TESTED 11.Feb.2026 — 38 avatar groups returned (Kai, Avatar IV Video ×10, Photo Avatar ×24, BGR customs). Preview images, dates, types all correct." },
 { tool:"get_avatars_in_avatar_group", st:"fail", out:"RE-TESTED 11.Feb.2026 — 90 Pydantic errors. API returns 'id' but server expects 'avatar_id'. All 6 required fields missing per avatar entry." },
 { tool:"generate_avatar_video", st:"pass", out:"RE-TESTED 11.Feb.2026 — Video generation works. video_id: 68d624fb3d3149b38cf0b5b55a432c38. Entered queue instantly, status tracking works." },
 { tool:"get_avatar_video_status", st:"pass", out:"RE-TESTED 11.Feb.2026 — Status 'processing' returned correctly with video_id, timestamps, and all expected fields." },
 ],
 notes:"⚠️ PARTIALLY FUNCTIONAL (3/6 tools = 50%). WRITE operations work perfectly (generate_video + check_status + list_groups). READ operations fail due to outdated Pydantic models vs HeyGen API v2. Root cause: field renames (avatar_id→id), new required fields (streaming_avatar, seat), strict URL validators (reject S3/relative/null). Official repo heygen-com/heygen-mcp: only 6 commits, 'early development', known issues #2/#8/#13/#14 all unfixed, 15 forks with zero merged fixes. ALTERNATIVES RESEARCHED: (1) nohavewho/heygen-mcp-http — HTTP/SSE Vercel wrapper, same broken Python backend underneath; (2) 15 GitHub forks — none have fixed Pydantic models; (3) Composio HeyGen — 84+ tools but middleware platform, not MCP server; (4) Smithery/Glama/PulseMCP — marketplaces only, list same server; (5) No Claude.ai cloud connector. DEEP RESEARCH VERDICT: This IS the best and ONLY real HeyGen MCP server. Core video pipeline (generate→monitor→download) works for production. For reading avatars/voices, use HeyGen web UI or API directly."
 },
 {
 id:"framer", phase:3, icon:"⬡", name:"Framer MCP", cat:"Web Design & CMS", tools:21, cost:"~2%",
 desc:"Full-power website builder and design tool integration. Control every aspect of a Framer project from Claude — read and modify page layouts, create and style components, manage CMS collections and content, write code overrides, search fonts, export React components, and publish sites. This is a LIVE DESIGN TOOL — requires an active Framer project open in the browser to function. Think of it as having a senior web designer who can manipulate your Framer canvas programmatically.",
 when:"Use when building, editing, or managing Framer websites. Create pages, add sections (hero, pricing, footer), style components, populate CMS content, write interactive code components, or export your design as React code for developers. Requires Framer project open in browser.",
 toolList:[
 { name:"getProjectXml", what:"Get the full project structure — all pages, components, code files, styles, and focused page/component. ALWAYS call this first to understand what you're working with." },
 { name:"getSelectedNodesXml", what:"Get XML of whatever is currently selected on the Framer canvas. Quick way to inspect what the user is looking at." },
 { name:"getNodeXml", what:"Read a specific node's full XML by ID. Use after getProjectXml to drill into pages or components. Essential for understanding component internals." },
 { name:"zoomIntoView", what:"Center the Framer canvas on a specific node. Visual feedback — shows the user exactly where you're working." },
 { name:"updateXmlForNode", what:"The POWERHOUSE tool. Create new nodes, update text/attributes, reorder layers, insert components (linked or detached), move elements between parents. Accepts partial XML — only pass what you're changing." },
 { name:"deleteNode", what:"Remove nodes, color styles, text styles, or code files. Also deletes all children of the target node." },
 { name:"duplicateNode", what:"Create an exact copy of any node and all its children. Placed at end of parent's child list." },
 { name:"getComponentInsertUrlAndTypes", what:"Get the insertUrl and prop types for any component or code file. Required before inserting components via updateXmlForNode." },
 { name:"manageColorStyle", what:"Create or update project color styles with light/dark theme variants. Reference in XML as color='/path/to/style'." },
 { name:"manageTextStyle", what:"Create or update text styles — font, size, weight, color, alignment, decoration. Referenced via inlineTextStyle attribute." },
 { name:"searchFonts", what:"Search all available Framer fonts by name. Returns font selectors (e.g., 'GF;Inter-600') for use in XML font attributes." },
 { name:"createCodeFile", what:"Create new TypeScript/React code components or overrides. Supports property controls, imports from project components. Returns insertUrl for canvas placement." },
 { name:"readCodeFile", what:"Read the current content, name, path, and exports of an existing code file." },
 { name:"updateCodeFile", what:"Replace entire content of a code file. Auto-linted and type-checked after update." },
 { name:"exportReactComponents", what:"Export Framer components as React code (.jsx + .css). Uses the unframer CLI. Creates production-ready React components from your designs." },
 { name:"getProjectWebsiteUrl", what:"Get the published staging and production URLs for the project. Check if project is live." },
 { name:"getCMSCollections", what:"List all CMS collections with full field definitions — IDs, types, requirements. ALWAYS call before other CMS operations." },
 { name:"getCMSItems", what:"Retrieve items from a CMS collection with optional text search filtering and pagination." },
 { name:"upsertCMSItem", what:"Create new CMS items or update existing ones. Supports partial updates — only changed fields need to be sent." },
 { name:"deleteCMSItem", what:"Permanently remove a CMS item. Cannot be undone." },
 { name:"createCMSCollection", what:"Create a new CMS collection with field definitions. Supports: string, number, boolean, color, date, image, link, formattedText, file, enum, collection references." },
 ],
 useCases:[
 "\"Add a hero section with headline and CTA button to the homepage\" → getProjectXml → getComponentInsertUrlAndTypes → updateXmlForNode inserts pre-built hero section",
 "\"Change all headings to Inter Bold and update the primary brand color\" → manageTextStyle + manageColorStyle updates propagate across entire project",
 "\"Create a blog CMS collection with title, body, author, date fields\" → createCMSCollection defines schema → upsertCMSItem populates entries",
 "\"Export our pricing page component as React code for the dev team\" → exportReactComponents generates .jsx + .css via unframer CLI",
 "\"Build an interactive counter component with a click handler\" → createCodeFile writes TypeScript/React with addPropertyControls → updateXmlForNode places it on canvas",
 ],
 tests:[
 { tool:"getProjectXml", st:"requires-project", out:"TESTED 11.Feb.2026 — Tool execution failed: requires active Framer project open in browser. Expected behavior for live design tool MCP." },
 { tool:"getSelectedNodesXml", st:"requires-project", out:"TESTED 11.Feb.2026 — Same: requires active Framer project. Cannot test without open project." },
 { tool:"getProjectWebsiteUrl", st:"requires-project", out:"TESTED 11.Feb.2026 — Same: requires active Framer project." },
 { tool:"getCMSCollections", st:"requires-project", out:"TESTED 11.Feb.2026 — Same: requires active Framer project." },
 { tool:"searchFonts", st:"requires-project", out:"TESTED 11.Feb.2026 — Same: requires active Framer project. All 21 tools need an open project to function." },
 ],
 notes:"REQUIRES ACTIVE FRAMER PROJECT (21/21 tools context-dependent). Unlike API-based servers, Framer MCP is a LIVE DESIGN TOOL that operates on whichever Framer project is currently open in the browser. All tools fail without a project open — this is expected behavior, not a bug. The server is MASSIVELY capable: 21 tools covering project structure, node manipulation, styling, CMS management, code components, React export, and publishing. It's the official Framer MCP (mcp.unframer.co) and also available as a Claude.ai cloud connector. UNIQUE FEATURES: (1) Pre-built section components (hero, pricing, footer, testimonials) ready to insert; (2) Detached component insertion for full layer editing; (3) Full CMS with 12 field types including collection references; (4) React export via unframer CLI; (5) Code components with TypeScript + property controls. VERDICT: Production-ready and extremely powerful. Open a Framer project → all 21 tools come alive."
 },
];

// -- WORKFLOWS --
const WORKFLOWS = [
 {
 name:"Quick Answer",
 desc:"Need a fast, sourced answer to any question",
 color:"#34D399",
 steps:["Ask your question", "Perplexity sonar answers with citations", "Done in ~2 seconds"],
 example:"\"What's the current ETH gas price?\"",
 servers:["perplexity"]
 },
 {
 name:"Company Deep Dive",
 desc:"Full intelligence on any company — finances, tech stack, key people, strategy",
 color:"#818CF8",
 steps:["exa company_research → structured profile: revenue, funding, workforce, tech stack, competitors, news (VERIFIED)", "explorium match-business → get Explorium ID (needs credits)", "enrich-business: firmographics + technographics + funding + workforce trends", "fetch-prospects: find key decision-makers by role and seniority", "mem0: store findings for follow-up conversations"],
 example:"\"Tell me everything about Stripe — their tech, finances, and who runs product\"",
 servers:["exa","explorium","mem0"]
 },
 {
 name:"Market Research Report",
 desc:"Comprehensive industry or market analysis with multiple sources",
 color:"#F27123",
 steps:["Perplexity deep-research → exhaustive AI-powered synthesis", "tavily_research → additional web source coverage", "octagon deep-research → financial and market data layer", "desktop-commander → export as polished PDF"],
 example:"\"Research renewable energy investment returns in Mediterranean 2026\"",
 servers:["perplexity","tavily","octagon","desktop-commander"]
 },
 {
 name:"Competitive Analysis",
 desc:"Understand your market position versus competitors",
 color:"#FBBF24",
 steps:["exa company_research → find company profiles with competitor lists, tech stacks, and funding data (VERIFIED)", "serper google_search → latest news, market moves, trending coverage (VERIFIED)", "tavily_research → autonomous competitive comparison report with tables and citations (VERIFIED)", "Perplexity sonar-pro → synthesized head-to-head comparison with AI reasoning"],
 example:"\"Who competes with NEXORA and how do we compare?\"",
 servers:["exa","serper","tavily","perplexity"]
 },
 {
 name:"Sales Prospecting",
 desc:"Find and qualify leads at target companies with verified contacts",
 color:"#F87171",
 steps:["explorium fetch-businesses → filter by size, industry, tech, location", "enrich-business → verify company fit via challenges and competitive data", "fetch-prospects → find decision-makers by title and seniority", "enrich-prospects → get verified emails, phones, LinkedIn profiles", "mem0 → save your pipeline for follow-up"],
 example:"\"Find CTOs at German fintech companies with 50-200 employees using AWS\"",
 servers:["explorium","mem0"]
 },
 {
 name:"Code Implementation",
 desc:"Build something with accurate, up-to-date documentation",
 color:"#60A5FA",
 steps:["context7 resolve → find the exact library docs in 10K+ libraries", "get-library-docs → fetch current API reference with working code examples", "exa get_code_context → find real-world implementation patterns from GitHub, Stack Overflow, and official docs (VERIFIED)", "sequentialthinking → plan the implementation step by step"],
 example:"\"Set up Solana token transfers using the latest SPL library\"",
 servers:["context7","exa","sequentialthinking"]
 },
 {
 name:"Content Research",
 desc:"Research a topic thoroughly before writing content about it",
 color:"#A78BFA",
 steps:["serper google_search → find what's currently ranking and trending on Google (VERIFIED)", "tavily_extract → deep-read the best source articles with full text extraction (VERIFIED)", "exa web_search → discover angles and sources others missed via neural/semantic matching (VERIFIED)", "tavily_research → autonomous synthesis report with structured tables and 20+ citations (VERIFIED)", "Perplexity sonar-pro → AI-synthesized overview with real-time citations"],
 example:"\"Research everything about MCP servers before writing our blog post\"",
 servers:["serper","tavily","exa","perplexity"]
 },
 {
 name:"Due Diligence",
 desc:"Full vetting of a potential partner, investment, or acquisition target",
 color:"#FB923C",
 steps:["explorium → company data, tech stack, workforce trends, competitive landscape", "octagon → SEC filings, financials, risk factors, earnings guidance", "Perplexity deep-research → exhaustive web intelligence sweep", "tavily_research → supplementary analysis with additional citations", "mem0 → store all findings for the deal room"],
 example:"\"Full due diligence on this Dubai-based company before we partner\"",
 servers:["explorium","octagon","perplexity","tavily","mem0"]
 },
 {
 name:"UI Component Sprint",
 desc:"Design, build, and iterate on production React components in minutes",
 color:"#06B6D4",
 steps:["Magic inspiration → search 21st.dev for similar component patterns and design ideas", "v0 createChat → generate initial component from description (Next.js 16, React 19, Tailwind 4)", "v0 sendChatMessage → iterate: add variants, fix styling, extend props (context preserved)", "v0 getChat → export final source code and share live demo URL"],
 example:"\"Build a NEXORA-branded pricing table with dark mode, gold accents, and toggle for monthly/annual\"",
 servers:["magic","v0"]
 },
 {
 name:"Brand Asset Pipeline",
 desc:"Generate brand-compliant logos, icons, and UI components for any project",
 color:"#8B5CF6",
 steps:["Magic logo_search → get brand SVGs for partner companies (Anthropic, Vercel, etc.)", "Magic inspiration → find component patterns that match the design system", "v0 createChat → build full branded component with correct colors and typography", "fal-ai → generate supporting images, backgrounds, or illustrations", "Desktop Commander → export all assets to project directory"],
 example:"\"Create the full NEXORA partner page with logos, stat cards, and team grid\"",
 servers:["magic","v0","fal-remote","desktop-commander"]
 },
 {
 name:"Component Library Audit",
 desc:"Review, catalog, and improve your existing v0 component collection",
 color:"#EC4899",
 steps:["v0 findChats → list all 53+ component chats with project groupings and demo URLs", "v0 getChat → deep-read specific components: source code, version history, diagnostics", "Magic refiner → analyze and suggest design improvements for each component", "v0 sendChatMessage → apply improvements and deploy updated versions", "mem0 → store component inventory and design system decisions"],
 example:"\"Audit all my OmniPresent components and identify which need design refresh\"",
 servers:["v0","magic","mem0"]
 },
 {
 name:"Avatar Video Production",
 desc:"Generate AI avatar videos with custom avatars, voices, and scripts",
 color:"#06B6D4",
 steps:["HeyGen get_avatar_groups → browse 38+ custom avatar groups with previews", "Select avatar from group (use HeyGen web UI for avatar_id if get_avatars fails)", "HeyGen generate_avatar_video → submit script with avatar_id + voice_id", "HeyGen get_avatar_video_status → monitor rendering (5-15 min)", "Download completed video via video_url when status = completed"],
 example:"\"Create a NEXORA promo video with my Photo Avatar speaking in German about our Q-LITE launch\"",
 servers:["heygen"]
 },
 {
 name:"Framer Website Build",
 desc:"Design, build, and populate a complete Framer website from Claude",
 color:"#A855F7",
 steps:["Framer getProjectXml → understand full project structure, pages, components, styles", "Framer updateXmlForNode → add sections (hero, pricing, footer) using pre-built components", "Framer manageColorStyle + manageTextStyle → set brand colors and typography system-wide", "Framer createCMSCollection → define content schema (blog, products, team)", "Framer upsertCMSItem → populate all CMS entries with real content", "Framer createCodeFile → add interactive React components with property controls", "Framer exportReactComponents → export design as production React code"],
 example:"\"Build the NEXORA landing page in Framer with hero, features, pricing, and team CMS collection\"",
 servers:["framer"]
 },
];

// -- PLATFORM TOOLS --
const PLATFORM = [
 { name:"Browser Automation", count:18, icon:"B", desc:"Click, type, scroll, screenshot, read pages, find elements. Full Chrome control for web tasks, form filling, and data extraction from any website." },
 { name:"Filesystem", count:11, icon:"F", desc:"Read, write, edit, search, and organize files. Create directories, move files, get metadata. Works on your Mac and Claude's container." },
 { name:"Web Search & Fetch", count:2, icon:"S", desc:"Built-in web search and full page content fetching. Always available in every Claude.ai conversation without any MCP setup." },
 { name:"Container & Code", count:5, icon:"C", desc:"Run bash commands, create files, execute code in a Linux container. Install packages, build projects, run Python/Node/anything." },
 { name:"Mac Control", count:1, icon:"A", desc:"Execute AppleScript on your Mac. Automate apps, control system settings, trigger Shortcuts, run native shell commands." },
 { name:"Communication", count:7, icon:"M", desc:"Compose emails and messages with strategic variants. Draft Slack messages, LinkedIn outreach, and texts with different tones." },
 { name:"Memory & History", count:3, icon:"H", desc:"Search past conversations, manage memory edits, and recall context from previous chats. Your cross-session continuity." },
 { name:"Maps, Weather & More", count:20, icon:"D", desc:"Google Places search, interactive maps with itineraries, weather forecasts, recipe cards, sports scores, and file presentation." },
];


// ============================================================
// THEMES — van Schneider / Omnipresent
// ============================================================
const TH = {
 dark: {
 bg:"#07070B", bg2:"#0C0C12", bg3:"#101018",
 card:"rgba(255,255,255,0.013)", cardH:"rgba(255,255,255,0.025)", cardA:"rgba(242,113,35,0.03)",
 bd:"rgba(255,255,255,0.04)", bdH:"rgba(255,255,255,0.08)", bdA:"rgba(242,113,35,0.12)",
 tx:"#D4D0C8", tx2:"#8A8580", tx3:"#4A4744", tx4:"#2A2825",
 ac:"#F27123", ac2:"rgba(242,113,35,0.07)", ac3:"rgba(242,113,35,0.14)",
 ok:"#34D399", okBg:"rgba(52,211,153,0.04)", okBd:"rgba(52,211,153,0.1)",
 no:"#F87171", noBg:"rgba(248,113,113,0.04)", noBd:"rgba(248,113,113,0.1)",
 wr:"#FBBF24", wrBg:"rgba(251,191,36,0.04)", wrBd:"rgba(251,191,36,0.1)",
 bl:"#818CF8", blBg:"rgba(129,140,248,0.04)",
 codeBg:"rgba(0,0,0,0.4)", codeTx:"#D4A574",
 mono:"'SF Mono','JetBrains Mono',monospace", sans:"'Inter',-apple-system,sans-serif",
 shadow:"0 1px 3px rgba(0,0,0,0.3)"
 },
 light: {
 bg:"#F5F3EE", bg2:"#EDEBE6", bg3:"#E5E3DE",
 card:"#FFFFFF", cardH:"#FAFAF8", cardA:"rgba(194,65,12,0.03)",
 bd:"rgba(0,0,0,0.06)", bdH:"rgba(0,0,0,0.1)", bdA:"rgba(194,65,12,0.12)",
 tx:"#1C1917", tx2:"#78716C", tx3:"#A8A29E", tx4:"#D6D3D1",
 ac:"#C2410C", ac2:"rgba(194,65,12,0.04)", ac3:"rgba(194,65,12,0.1)",
 ok:"#059669", okBg:"rgba(5,150,105,0.04)", okBd:"rgba(5,150,105,0.1)",
 no:"#DC2626", noBg:"rgba(220,38,38,0.04)", noBd:"rgba(220,38,38,0.1)",
 wr:"#D97706", wrBg:"rgba(217,119,6,0.04)", wrBd:"rgba(217,119,6,0.1)",
 bl:"#4F46E5", blBg:"rgba(79,70,229,0.04)",
 codeBg:"rgba(0,0,0,0.03)", codeTx:"#92400E",
 mono:"'SF Mono','JetBrains Mono',monospace", sans:"'Inter',-apple-system,sans-serif",
 shadow:"0 1px 3px rgba(0,0,0,0.06)"
 }
};


// ============================================================
// COMPONENT
// ============================================================
export default function MCPBible() {
 const [mode, setMode] = useState("dark");
 const [view, setView] = useState("overview");
 const [sel, setSel] = useState(null);
 const t = TH[mode];

 const p1 = SERVERS.filter(s=>s.phase===1);
 const p2 = SERVERS.filter(s=>s.phase===2);
 const p3 = SERVERS.filter(s=>s.phase===3);
 const totalTools = SERVERS.reduce((a,s)=>a+s.tools,0);
 const totalTests = SERVERS.reduce((a,s)=>a+s.tests.length,0);
 const totalPassed = SERVERS.reduce((a,s)=>a+s.tests.filter(x=>x.st==="pass").length,0);
 const totalBroken = SERVERS.reduce((a,s)=>a+s.tests.filter(x=>x.st==="broken").length,0);
 const totalFailed = SERVERS.reduce((a,s)=>a+s.tests.filter(x=>x.st==="fail").length,0);

 const S = {
 card:{ background:t.card, border:`1px solid ${t.bd}`, borderRadius:14, padding:"22px 26px", boxShadow:t.shadow, transition:"all .15s" },
 label:{ fontSize:9, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", color:t.tx3, fontFamily:t.mono },
 pill:(bg,col,bd)=>({ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 9px", borderRadius:100, fontSize:9, fontWeight:700, fontFamily:t.mono, letterSpacing:"0.5px", background:bg, color:col, border:`1px solid ${bd||"transparent"}`, lineHeight:"18px" }),
 icon:(letter,active)=>(
 <div style={{ width:34, height:34, borderRadius:9, background:active?t.ac3:t.ac2, border:`1px solid ${active?t.ac:t.bdA}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:active?t.ac:t.tx3, fontFamily:t.mono, flexShrink:0, transition:"all .15s" }}>{letter}</div>
 ),
 };

 const tabs = [
 { id:"overview", l:"Overview" },
 { id:"phase1", l:"Foundation" },
 { id:"phase2", l:"Research" },
 { id:"p3", l:"Creation & Code" },
 { id:"aisearch", l:"AI Search Guide" },
 { id:"workflows", l:"Workflows" },
 { id:"platform", l:"Platform 67+" },
 ];

// -- SERVER DETAIL --
 const ServerDetail = ({ server: sv }) => {
 if (!sv) return (
 <div style={{ ...S.card, textAlign:"center", padding:60, color:t.tx3 }}>
 <div style={{ fontSize:11, fontFamily:t.mono }}>← Select a server to read its handbook entry</div>
 </div>
 );
 return (
 <div style={{ display:"grid", gap:14 }}>
 <div style={S.card}>
 <div style={{ display:"flex", gap:14, alignItems:"center" }}>
 <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg, ${t.ac}, ${t.ac}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:mode==="dark"?"#07070B":"#FFF", fontFamily:t.mono, flexShrink:0 }}>{sv.icon}</div>
 <div style={{ flex:1 }}>
 <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:t.tx, letterSpacing:"-0.3px" }}>{sv.name}</h3>
 <div style={{ fontSize:10, color:t.tx2, fontFamily:t.mono, marginTop:3 }}>{sv.cat} · {sv.tools} tools · {sv.cost} context</div>
 </div>
 <span style={S.pill(t.okBg, t.ok, t.okBd)}>VERIFIED</span>
 </div>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:10 }}>WHAT IT DOES</div>
 <p style={{ margin:0, fontSize:13, color:t.tx, lineHeight:1.75 }}>{sv.desc}</p>
 </div>

 <div style={{ ...S.card, background:t.ac2, borderColor:t.bdA }}>
 <div style={{ ...S.label, marginBottom:10, color:t.ac }}>WHEN TO USE IT</div>
 <p style={{ margin:0, fontSize:13, color:t.tx, lineHeight:1.75 }}>{sv.when}</p>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>TOOLS ({sv.toolList.length})</div>
 <div style={{ display:"grid", gap:10 }}>
 {sv.toolList.map((tool,i)=>(
 <div key={i} style={{ padding:"12px 16px", borderRadius:10, background:t.bg2, border:`1px solid ${t.bd}` }}>
 <div style={{ fontSize:12, fontWeight:700, color:t.ac, fontFamily:t.mono, marginBottom:5 }}>{tool.name}</div>
 <div style={{ fontSize:12, color:t.tx2, lineHeight:1.65 }}>{tool.what}</div>
 </div>
 ))}
 </div>
 </div>

 {sv.models && (
 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>MODELS — CHOOSE YOUR DEPTH</div>
 <div style={{ display:"grid", gap:8 }}>
 {sv.models.map((m,i)=>(
 <div key={i} style={{ display:"grid", gridTemplateColumns:"160px 90px 90px 1fr", gap:0, padding:"10px 14px", borderRadius:10, background:i%2===0?t.ac2:"transparent", alignItems:"center" }}>
 <div style={{ fontSize:11, fontWeight:700, color:t.ac, fontFamily:t.mono }}>{m.name}</div>
 <div style={{ fontSize:10, color:t.wr, fontFamily:t.mono, letterSpacing:"1.5px" }}>{m.speed}</div>
 <div style={{ fontSize:10, color:t.bl, fontFamily:t.mono, letterSpacing:"1.5px" }}>{m.depth}</div>
 <div style={{ fontSize:11, color:t.tx2, lineHeight:1.5 }}>{m.best}</div>
 </div>
 ))}
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"160px 90px 90px 1fr", gap:0, marginTop:8, padding:"0 14px" }}>
 {["MODEL","SPEED","DEPTH","BEST FOR"].map((h,i)=>(
 <div key={i} style={{ fontSize:8, color:t.tx3, fontFamily:t.mono, letterSpacing:"2px" }}>{h}</div>
 ))}
 </div>
 </div>
 )}

 {sv.features && (
 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>SPECIAL FEATURES</div>
 <div style={{ display:"grid", gap:6 }}>
 {sv.features.map((f,i)=>(
 <div key={i} style={{ padding:"8px 14px", borderRadius:8, background:t.blBg, border:`1px solid ${t.bd}`, fontSize:11, color:t.tx2, display:"flex", gap:8, alignItems:"start", lineHeight:1.6 }}>
 <span style={{ color:t.bl, fontWeight:800, flexShrink:0, marginTop:1 }}>◆</span>{f}
 </div>
 ))}
 </div>
 </div>
 )}

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>USE CASES — JUST SAY THIS</div>
 <div style={{ display:"grid", gap:6 }}>
 {sv.useCases.map((uc,i)=>(
 <div key={i} style={{ padding:"10px 16px", borderRadius:10, background:t.codeBg, border:`1px solid ${t.bd}`, fontFamily:t.mono, fontSize:11, color:t.codeTx, lineHeight:1.6 }}>
 {uc}
 </div>
 ))}
 </div>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
 <span style={{ width:16, height:1, background:t.tx3, display:"inline-block" }}/>
 LIVE TEST RESULTS
 <span style={{ width:16, height:1, background:t.tx3, display:"inline-block" }}/>
 </div>
 <div style={{ display:"grid", gap:6 }}>
 {sv.tests.map((x,i) => {
 const isPass = x.st==="pass";
 const isBroken = x.st==="broken";
 const isFail = x.st==="fail";
 const isReqProj = x.st==="requires-project";
 const col = isPass?t.ok:(isBroken||isFail)?t.no:t.wr;
 const bg = isPass?t.okBg:(isBroken||isFail)?t.noBg:(t.wrBg||"#332B00");
 const bd = isPass?t.okBd:(isBroken||isFail)?t.noBd:(t.wrBd||"#665500");
 const lbl = isPass?"PASS":isBroken?"BROKEN":isFail?"FAIL ✗":isReqProj?"NEEDS PROJECT":"WARN ⚠ ";
 return (
 <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:12, padding:"10px 14px", borderRadius:10, background:bg, borderLeft:`3px solid ${col}`, alignItems:"start" }}>
 <div style={S.pill(bg, col, bd)}>{lbl}</div>
 <div>
 <span style={{ fontSize:11, fontWeight:700, color:t.tx, fontFamily:t.mono }}>{x.tool}</span>
 <span style={{ fontSize:11, color:t.tx2, marginLeft:8 }}>{x.out}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 {sv.notes && (
 <div style={{ ...S.card, background:`linear-gradient(135deg, ${t.wrBg}, ${t.noBg})`, borderColor:t.wrBd }}>
 <div style={{ ...S.label, marginBottom:8 }}>⚠️ SERVER NOTES</div>
 <p style={{ margin:0, fontSize:12, color:t.tx, lineHeight:1.7 }}>{sv.notes}</p>
 </div>
 )}
 </div>
 );
 };

// -- PHASE VIEW --
 const PhaseView = ({ servers, label }) => {
 const active = sel ? servers.find(s=>s.id===sel) : null;
 return (
 <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:18 }}>
 <div>
 <div style={{ ...S.label, marginBottom:14 }}>{label}</div>
 {servers.map(s => (
 <button key={s.id} onClick={()=>setSel(s.id)}
 style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, marginBottom:3, border:`1px solid ${sel===s.id?t.bdA:"transparent"}`, background:sel===s.id?t.ac2:"transparent", cursor:"pointer", fontFamily:t.sans, transition:"all .1s" }}>
 {S.icon(s.icon, sel===s.id)}
 <div style={{ flex:1, minWidth:0 }}>
 <div style={{ fontSize:11, fontWeight:700, color:sel===s.id?t.ac:t.tx, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
 <div style={{ fontSize:9, color:t.tx3, fontFamily:t.mono }}>{s.cat} · {s.tools}t · {s.tests.filter(x=>x.st==="pass").length} PASS{s.tests.some(x=>x.st==="fail")?" · "+s.tests.filter(x=>x.st==="fail").length+" FAIL":""}{s.tests.some(x=>x.st==="broken")?" · "+s.tests.filter(x=>x.st==="broken").length+" BROKEN":""}{s.tests.some(x=>x.st==="requires-project")?" · "+s.tests.filter(x=>x.st==="requires-project").length+" NEEDS PROJECT":""}</div>
 </div>
 </button>
 ))}
 </div>
 <ServerDetail server={active} />
 </div>
 );
 };

 return (
 <div style={{ fontFamily:t.sans, background:t.bg, color:t.tx, minHeight:"100vh", lineHeight:1.5 }}>
 <div style={{ position:"fixed", inset:0, opacity:mode==="dark"?0.35:0.25, backgroundImage:`radial-gradient(${t.tx4} 0.5px, transparent 0.5px)`, backgroundSize:"28px 28px", pointerEvents:"none" }}/>
 <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:800, height:400, background:`radial-gradient(ellipse at center, ${t.ac2} 0%, transparent 70%)`, pointerEvents:"none", opacity:0.6 }}/>

 <div style={{ position:"relative", zIndex:1, maxWidth:1280, margin:"0 auto", padding:"36px 28px" }}>

 <header style={{ marginBottom:40 }}>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
 <div>
 <div style={{ ...S.label, marginBottom:6, letterSpacing:"5px", fontSize:8 }}>GENESIS CHAMBER</div>
 <h1 style={{ margin:0, fontSize:36, fontWeight:900, letterSpacing:"-1.5px", lineHeight:1.05 }}>
 MCP <span style={{ color:t.ac }}>Bible</span>
 </h1>
 <p style={{ margin:"8px 0 0", fontSize:11, color:t.tx3, fontFamily:t.mono }}>v3.7 — The living handbook · 26 servers · {totalTools} tools · {totalPassed} pass · {totalFailed} fail · {totalBroken} broken</p>
 </div>
 <button onClick={()=>setMode(m=>m==="dark"?"light":"dark")}
 style={{ width:36, height:36, borderRadius:9, border:`1px solid ${t.bd}`, background:t.card, color:t.tx2, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
 {mode==="dark"?"☀":"◐"}
 </button>
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
 {[
 { l:"MCP SERVERS", v:"20" }, { l:"MCP TOOLS", v:String(totalTools) }, { l:"TESTS PASSED", v:String(totalPassed), c:t.ok },
 { l:"BROKEN", v:String(totalBroken), c:totalBroken>0?t.no:t.ok }, { l:"PLATFORM TOOLS", v:"67+" }
 ].map((s,i) => (
 <div key={i} style={{ ...S.card, padding:"14px 16px", textAlign:"center" }}>
 <div style={{ fontSize:24, fontWeight:900, color:s.c||t.tx, fontFamily:t.mono, letterSpacing:"-1px" }}>{s.v}</div>
 <div style={{ ...S.label, marginTop:4, fontSize:7 }}>{s.l}</div>
 </div>
 ))}
 </div>
 </header>

 {/* NAV */}
 <div style={{ display:"flex", gap:3, marginBottom:32, flexWrap:"wrap" }}>
 {tabs.map(tab => (
 <button key={tab.id} disabled={tab.locked} onClick={()=>{setView(tab.id);setSel(null);}}
 style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${view===tab.id?t.bdA:"transparent"}`, background:view===tab.id?t.ac2:tab.locked?t.bg2:"transparent", color:view===tab.id?t.ac:tab.locked?t.tx4:t.tx2, fontSize:11, fontWeight:600, cursor:tab.locked?"not-allowed":"pointer", fontFamily:t.mono, transition:"all .12s", letterSpacing:"0.3px", opacity:tab.locked?0.4:1 }}>
 {tab.l}{tab.locked?" 🔒":""}
 </button>
 ))}
 </div>

 {/* OVERVIEW */}
 {view==="overview" && (
 <div style={{ display:"grid", gap:18 }}>
 <div style={{ ...S.card, background:`linear-gradient(135deg, ${t.ac2}, ${t.ac3})`, borderColor:t.bdA }}>
 <p style={{ margin:0, fontSize:14, color:t.tx, lineHeight:1.8, fontWeight:500 }}>
 This handbook documents every MCP server in the Genesis Chamber — what each one does, when to use it, and how the tools work together. Click any server to read its full guide, or check the <strong style={{color:t.ac}}>Workflows</strong> tab to see how servers combine for real tasks.
 </p>
 </div>
 {[{ l:"Phase 1 — Foundation", items:p1, ph:"phase1" }, { l:"Phase 2 — Research & Intelligence", items:p2, ph:"phase2" }, { l:"Phase 3 — Creation & Code", items:p3, ph:"p3" }].map((g,gi) => (
 <div key={gi}>
 <div style={{ ...S.label, marginBottom:10 }}>{g.l}</div>
 <div style={{ display:"grid", gap:6 }}>
 {g.items.map(sv => (
 <div key={sv.id} onClick={()=>{setView(g.ph);setSel(sv.id);}}
 style={{ ...S.card, padding:"14px 20px", cursor:"pointer", display:"grid", gridTemplateColumns:"42px 1fr auto", gap:14, alignItems:"center" }}>
 {S.icon(sv.icon, false)}
 <div>
 <div style={{ fontSize:13, fontWeight:700, color:t.tx }}>{sv.name}</div>
 <div style={{ fontSize:11, color:t.tx2, marginTop:3, lineHeight:1.5 }}>{sv.desc.substring(0, sv.desc.indexOf(".")+1)}</div>
 </div>
 <div style={{ display:"flex", gap:6, flexShrink:0 }}>
 <span style={S.pill(t.okBg, t.ok, t.okBd)}>{sv.tests.filter(x=>x.st==="pass").length} PASS</span>
 {sv.tests.some(x=>x.st==="fail") && <span style={S.pill(t.noBg, t.no, t.noBd)}>{sv.tests.filter(x=>x.st==="fail").length} FAIL</span>}
 {sv.tests.some(x=>x.st==="broken") && <span style={S.pill(t.noBg, t.no, t.noBd)}>{sv.tests.filter(x=>x.st==="broken").length} BROKEN</span>}
 {sv.tests.some(x=>x.st==="requires-project") && <span style={S.pill(t.wrBg||"#332B00", t.wr, t.wrBd||"#665500")}>{sv.tests.filter(x=>x.st==="requires-project").length} NEEDS PROJECT</span>}
 <span style={S.pill(t.blBg, t.bl)}>{sv.tools}t</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 {view==="phase1" && <PhaseView servers={p1} label="FOUNDATION — CORE INFRASTRUCTURE" />}
 {view==="phase2" && <PhaseView servers={p2} label="RESEARCH & INTELLIGENCE" />}
 {view==="p3" && <PhaseView servers={p3} label="CREATION & CODE" />}

 {/* AI SEARCH GUIDE */}
 {view==="aisearch" && (
 <div style={{ display:"grid", gap:16 }}>
 <div style={S.label}>CHOOSING THE RIGHT SEARCH — A SIMPLE GUIDE</div>
 <div style={{ ...S.card, background:`linear-gradient(135deg, ${t.ac2}, ${t.ac3})`, borderColor:t.bdA }}>
 <p style={{ margin:0, fontSize:14, color:t.tx, lineHeight:1.8 }}>
 You have <strong style={{color:t.ac}}>5 search engines</strong> and <strong style={{color:t.ac}}>4 Perplexity AI models</strong>. Each excels at different things. Here's how to pick the right one without thinking twice.
 </p>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:16 }}>WHAT DO YOU NEED?</div>
 <div style={{ display:"grid", gap:8 }}>
 {[
 { q:"A quick factual answer with sources", a:"perplexity_ask", why:"sonar-pro gives AI-synthesized answers with citations. Fast and thorough.", c:t.ok },
 { q:"Google results like in a browser", a:"Serper", why:"Raw Google: organic results, PAA, knowledge graph. Best for SEO and trending.", c:t.wr },
 { q:"Ranked web search results as data", a:"perplexity_search", why:"Direct Search API — returns ranked links with metadata. Like Google but structured.", c:t.bl },
 { q:"Extract content from specific web pages", a:"Tavily extract", why:"Pulls clean text from up to 3 URLs at once. Handles tables and JS pages.", c:t.ok },
 { q:"Find companies or content similar to X", a:"Exa semantic search", why:"Neural ranking finds conceptual matches. Discovers what keywords miss.", c:"#A78BFA" },
 { q:"A math/logic question needing reasoning", a:"perplexity_reason", why:"sonar-reasoning-pro chain-of-thought. Shows its work. Best for evaluations.", c:t.wr },
 { q:"Crawl and map an entire website", a:"Tavily crawl + map", why:"Follow links, set depth, give NL instructions. Map shows structure first.", c:t.bl },
 { q:"A comprehensive research report", a:"perplexity_research", why:"sonar-deep-research: 26+ searches, 60+ sources, exhaustive synthesis.", c:t.ac },
 { q:"Broad web research with many sources", a:"Tavily research", why:"Autonomous multi-source research. 'Mini' for focused, 'pro' for broad coverage.", c:t.ok },
 { q:"An exhaustive deep-dive with 60+ sources", a:"perplexity_research", why:"26+ sub-searches, 337K reasoning tokens. Takes longer but misses nothing.", c:"#F87171" },
 ].map((row,i)=>(
 <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 180px 1fr", gap:0, borderRadius:10, background:i%2===0?t.ac2:"transparent", alignItems:"center" }}>
 <div style={{ padding:"12px 16px", fontSize:12, color:t.tx, fontWeight:600 }}>{row.q}</div>
 <div style={{ padding:"12px 8px", fontSize:11, fontWeight:800, color:row.c, fontFamily:t.mono, textAlign:"center" }}>{row.a}</div>
 <div style={{ padding:"12px 16px", fontSize:11, color:t.tx2, lineHeight:1.5 }}>{row.why}</div>
 </div>
 ))}
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"1fr 180px 1fr", gap:0, marginTop:10, padding:"0 16px" }}>
 {["I NEED TO…","USE THIS","WHY"].map((h,i)=>(
 <div key={i} style={{ fontSize:8, color:t.tx3, fontFamily:t.mono, letterSpacing:"2px", textAlign:i===1?"center":"left" }}>{h}</div>
 ))}
 </div>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>PERPLEXITY — 4 DEDICATED TOOLS</div>
 <div style={{ display:"grid", gap:10 }}>
 {SERVERS.find(s=>s.id==="pplx").models.map((m,i)=>(
 <div key={i} style={{ padding:"14px 18px", borderRadius:10, background:t.bg2, border:`1px solid ${t.bd}` }}>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
 <span style={{ fontSize:13, fontWeight:800, color:t.ac, fontFamily:t.mono }}>{m.name}</span>
 <div style={{ display:"flex", gap:12, fontSize:10, fontFamily:t.mono }}>
 <span style={{color:t.wr}}>Speed {m.speed}</span>
 <span style={{color:t.bl}}>Depth {m.depth}</span>
 </div>
 </div>
 <div style={{ fontSize:12, color:t.tx2, lineHeight:1.6 }}>{m.best}</div>
 </div>
 ))}
 </div>
 </div>

 <div style={S.card}>
 <div style={{ ...S.label, marginBottom:14 }}>ALL 5 SEARCH ENGINES COMPARED</div>
 <div style={{ display:"grid", gap:8 }}>
 {[
 { name:"Serper", type:"Google API", best:"Raw Google results with full control: country, language, time filters, PAA, Knowledge Graph. Plus URL scraping with metadata extraction. Verified: 1-2 credits per call, sub-second.", limit:"Returns links and snippets, not synthesized answers. No AI layer — pure search data." },
 { name:"Tavily", type:"Smart Research", best:"5 tools: search, extract, crawl, map, research. The tavily_research tool is autonomous — produces structured reports with tables, comparisons, and 20+ cited sources. Verified: outstanding report quality.", limit:"Research mode takes 1-3 min for thorough reports. Best tool in the ecosystem for deep analysis." },
 { name:"Perplexity", type:"AI Search (Official)", best:"4 dedicated tools: search, ask, reason, research. Each auto-picks the right Sonar model. Deep-research reads 60+ sources.", limit:"perplexity_research is slow (~2 min) but incredibly thorough" },
 { name:"Exa", type:"Neural Search", best:"Finds by meaning, not keywords. Company research returns structured data (revenue, funding, tech stack, competitors, workforce). Code context finds SDK docs and working examples. Verified: exceptional company intelligence.", limit:"Less effective for breaking news or exact-phrase queries. Best for discovery and intelligence." },
 { name:"Explorium", type:"B2B Intelligence", best:"Enterprise-grade: 15 tools for business matching, enrichment (firmographics, technographics, funding, SEC filings), prospect finding with verified contacts, event tracking. Autocomplete is free.", limit:"Requires Explorium credits for all data queries. Autocomplete free, everything else paid. Top-up at admin.explorium.ai." },
 { name:"Claude Built-in", type:"Web Search", best:"Always available on Claude.ai, no setup, good for quick lookups and current events", limit:"Less control — no domain filtering, depth selection, or crawling" },
 ].map((eng,i)=>(
 <div key={i} style={{ display:"grid", gridTemplateColumns:"120px 100px 1fr 1fr", gap:0, padding:"10px 14px", borderRadius:10, background:i%2===0?t.ac2:"transparent", alignItems:"start" }}>
 <div style={{ fontSize:12, fontWeight:700, color:t.ac, fontFamily:t.mono }}>{eng.name}</div>
 <div style={{ fontSize:10, color:t.tx3, fontFamily:t.mono }}>{eng.type}</div>
 <div style={{ fontSize:11, color:t.tx2, lineHeight:1.5 }}>{eng.best}</div>
 <div style={{ fontSize:11, color:t.tx3, lineHeight:1.5, fontStyle:"italic" }}>{eng.limit}</div>
 </div>
 ))}
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"120px 100px 1fr 1fr", gap:0, marginTop:10, padding:"0 14px" }}>
 {["ENGINE","TYPE","BEST FOR","LIMITATION"].map((h,i)=>(
 <div key={i} style={{ fontSize:8, color:t.tx3, fontFamily:t.mono, letterSpacing:"2px" }}>{h}</div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* WORKFLOWS */}
 {view==="workflows" && (
 <div style={{ display:"grid", gap:16 }}>
 <div style={S.label}>WORKFLOWS — SERVERS WORKING TOGETHER</div>
 <div style={{ ...S.card, background:`linear-gradient(135deg, ${t.ac2}, ${t.ac3})`, borderColor:t.bdA }}>
 <p style={{ margin:0, fontSize:14, color:t.tx, lineHeight:1.8 }}>
 The real power isn't in single servers — it's in how they chain together. These are battle-tested workflows for common tasks. Just describe what you need and Claude picks the right combination automatically.
 </p>
 </div>
 <div style={{ display:"grid", gap:12 }}>
 {WORKFLOWS.map((wf,i)=>(
 <div key={i} style={{ ...S.card, borderLeft:`4px solid ${wf.color}` }}>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
 <div>
 <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:t.tx, letterSpacing:"-0.3px" }}>{wf.name}</h3>
 <p style={{ margin:"4px 0 0", fontSize:12, color:t.tx2 }}>{wf.desc}</p>
 </div>
 <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:220 }}>
 {wf.servers.map((s,j)=>(
 <span key={j} style={S.pill(t.ac2, t.ac, t.bdA)}>{s}</span>
 ))}
 </div>
 </div>
 <div style={{ display:"grid", gap:4, marginBottom:14 }}>
 {wf.steps.map((step,j)=>(
 <div key={j} style={{ display:"flex", gap:10, alignItems:"center" }}>
 <div style={{ width:22, height:22, borderRadius:6, background:`${wf.color}18`, border:`1px solid ${wf.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:wf.color, fontFamily:t.mono, flexShrink:0 }}>{j+1}</div>
 <div style={{ fontSize:12, color:t.tx2, lineHeight:1.5 }}>{step}</div>
 </div>
 ))}
 </div>
 <div style={{ padding:"10px 16px", borderRadius:10, background:t.codeBg, border:`1px solid ${t.bd}`, fontFamily:t.mono, fontSize:11, color:t.codeTx, lineHeight:1.6 }}>
 {wf.example}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* PLATFORM */}
 {view==="platform" && (
 <div>
 <div style={S.label}>CLAUDE.AI — BUILT-IN TOOLS (NO MCP NEEDED)</div>
 <div style={{ ...S.card, marginTop:14, marginBottom:16 }}>
 <div style={{ display:"flex", gap:16, alignItems:"center" }}>
 <div style={{ fontSize:32, fontWeight:900, color:t.bl, fontFamily:t.mono }}>67+</div>
 <p style={{ margin:0, fontSize:13, color:t.tx2, lineHeight:1.7 }}>These tools are available in every Claude.ai conversation without any setup. They handle browser automation, file management, code execution, web search, and more. On Claude Desktop, these work alongside your 20 MCP servers.</p>
 </div>
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
 {PLATFORM.map((cat,i) => (
 <div key={i} style={{ ...S.card, display:"grid", gridTemplateColumns:"48px 1fr", gap:14, alignItems:"start" }}>
 <div style={{ width:48, height:48, borderRadius:12, background:t.blBg, border:`1px solid ${t.bd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:t.bl, fontFamily:t.mono }}>{cat.icon}</div>
 <div>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
 <div style={{ fontSize:13, fontWeight:700, color:t.tx }}>{cat.name}</div>
 <span style={S.pill(t.blBg, t.bl)}>{cat.count}t</span>
 </div>
 <p style={{ margin:"6px 0 0", fontSize:11, color:t.tx2, lineHeight:1.6 }}>{cat.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <footer style={{ marginTop:48, paddingTop:16, borderTop:`1px solid ${t.bd}`, display:"flex", justifyContent:"space-between", fontSize:9, color:t.tx4, fontFamily:t.mono }}>
 <span>MCP Bible v3.7 — Living Handbook Edition</span>
 <span>Genesis Chamber · Feb 2026</span>
 <span>20 servers · {totalTools} tools · {WORKFLOWS.length} workflows</span>
 </footer>
 </div>
 </div>
 );
}
