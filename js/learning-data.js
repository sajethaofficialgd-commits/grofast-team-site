// Learning Content Data - All Fields

const LEARNING_DATA = {
    video_editor: {
        name: 'Video Editor',
        icon: '🎬',
        modules: [
            {
                id: 'm1',
                title: 'Module 1 – Composition & Camera Basics',
                icon: '📷',
                topics: [
                    { id: 't1', title: 'Introduction to Video Editing', desc: 'Fundamentals of video editing software and workflows.' },
                    { id: 't2', title: 'Composition Basics', desc: 'Understanding frame composition and visual balance.' },
                    { id: 't3', title: 'Rule of Thirds', desc: 'Mastering the rule of thirds for professional framing.' },
                    { id: 't4', title: 'Types of Shots', desc: 'Wide, medium, close-up, and extreme close-up shots.' },
                    { id: 't5', title: 'Camera Angles', desc: 'High angle, low angle, eye level, and Dutch angles.' },
                    { id: 't6', title: 'Visual Framing', desc: 'Using natural frames and leading lines.' },
                    { id: 't7', title: 'Shot Selection', desc: 'Choosing the right shots for storytelling.' },
                    { id: 't8', title: 'Practical Composition', desc: 'Hands-on composition exercises.' }
                ]
            },
            {
                id: 'm2',
                title: 'Module 2 – Primary Editing & Cuts',
                icon: '✂️',
                topics: [
                    { id: 't1', title: 'Timeline Understanding', desc: 'Navigating the editing timeline effectively.' },
                    { id: 't2', title: 'Basic Cuts', desc: 'Standard cuts and when to use them.' },
                    { id: 't3', title: 'Jump Cuts', desc: 'Creating energy with jump cuts.' },
                    { id: 't4', title: 'Match Cuts', desc: 'Seamless transitions between scenes.' },
                    { id: 't5', title: 'Import & File Management', desc: 'Organizing media and project files.' },
                    { id: 't6', title: 'Editing Workflow', desc: 'Efficient editing processes.' },
                    { id: 't7', title: 'Export Basics', desc: 'Export settings for different platforms.' },
                    { id: 't8', title: 'Editing Best Practices', desc: 'Industry standards and tips.' }
                ]
            },
            {
                id: 'm3',
                title: 'Module 3 – Retention Editing',
                icon: '🎯',
                topics: [
                    { id: 't1', title: 'Retention Concepts', desc: 'Understanding viewer retention metrics.' },
                    { id: 't2', title: 'Keyframes', desc: 'Using keyframes for animation.' },
                    { id: 't3', title: 'Zoom Effects', desc: 'Dynamic zooms for engagement.' },
                    { id: 't4', title: 'Motion Effects', desc: 'Adding movement to static footage.' },
                    { id: 't5', title: 'Masking', desc: 'Creative masking techniques.' },
                    { id: 't6', title: 'Green Screen', desc: 'Chroma key fundamentals.' },
                    { id: 't7', title: 'B-Roll Usage', desc: 'Effective use of supplementary footage.' },
                    { id: 't8', title: 'Retention Workflow', desc: 'Complete retention editing process.' }
                ]
            },
            {
                id: 'm4',
                title: 'Module 4 – Storytelling & Advanced Editing',
                icon: '📖',
                topics: [
                    { id: 't1', title: 'Storytelling Fundamentals', desc: 'Core principles of visual storytelling.' },
                    { id: 't2', title: 'Story Structures', desc: 'Three-act structure and story arcs.' },
                    { id: 't3', title: 'Conversational Editing', desc: 'Editing dialogue and conversations.' },
                    { id: 't4', title: 'Visual Metaphors', desc: 'Using imagery to convey meaning.' },
                    { id: 't5', title: 'Advanced Transitions', desc: 'Creative transition techniques.' },
                    { id: 't6', title: 'Speed Ramping', desc: 'Slow motion and speed up effects.' },
                    { id: 't7', title: 'Emotional Flow', desc: 'Pacing for emotional impact.' },
                    { id: 't8', title: 'Narrative Editing', desc: 'Complete narrative project.' }
                ]
            },
            {
                id: 'm5',
                title: 'Module 5 – Color & Audio Mastery',
                icon: '🎨',
                topics: [
                    { id: 't1', title: 'Color Theory', desc: 'Understanding color psychology.' },
                    { id: 't2', title: 'Color Correction', desc: 'Fixing and balancing colors.' },
                    { id: 't3', title: 'Color Grading', desc: 'Creating cinematic looks.' },
                    { id: 't4', title: 'Audio Basics', desc: 'Audio levels and mixing.' },
                    { id: 't5', title: 'Audio Cleanup', desc: 'Removing noise and enhancing audio.' },
                    { id: 't6', title: 'Music Selection', desc: 'Choosing appropriate music.' },
                    { id: 't7', title: 'Sound Design', desc: 'Adding sound effects.' },
                    { id: 't8', title: 'Final Output Polish', desc: 'Final touches and delivery.' }
                ]
            },
            {
                id: 'm6',
                title: 'Module 6 – Professional Editing',
                icon: '💼',
                topics: [
                    { id: 't1', title: 'Editing for Reels', desc: 'Short-form content editing.' },
                    { id: 't2', title: 'Editing for YouTube', desc: 'Long-form content best practices.' },
                    { id: 't3', title: 'Editing for Ads', desc: 'Commercial editing techniques.' },
                    { id: 't4', title: 'Client Communication', desc: 'Working with clients effectively.' },
                    { id: 't5', title: 'Feedback Handling', desc: 'Processing and implementing feedback.' },
                    { id: 't6', title: 'File Delivery', desc: 'Professional file delivery standards.' },
                    { id: 't7', title: 'Portfolio Building', desc: 'Creating a standout portfolio.' },
                    { id: 't8', title: 'Editing SOP', desc: 'Standard operating procedures.' }
                ]
            }
        ]
    },
    gen_ai: {
        name: 'Gen AI / AI Tech',
        icon: '🤖',
        modules: [
            {
                id: 'w1',
                title: 'Week 1 – Gen AI Foundation',
                icon: '🧠',
                topics: [
                    { id: 't1', title: 'AI Basics', desc: 'Introduction to artificial intelligence.' },
                    { id: 't2', title: 'AI vs ML vs DL vs Gen AI', desc: 'Understanding the differences.' },
                    { id: 't3', title: 'Generative AI', desc: 'What makes Gen AI different.' },
                    { id: 't4', title: 'Use Cases', desc: 'Real-world applications.' },
                    { id: 't5', title: 'LLM Overview', desc: 'Large Language Models explained.' },
                    { id: 't6', title: 'Open vs Closed Models', desc: 'Comparing model types.' },
                    { id: 't7', title: 'Productivity', desc: 'AI for productivity boost.' },
                    { id: 't8', title: 'Ethics', desc: 'AI ethics and considerations.' }
                ]
            },
            {
                id: 'w2',
                title: 'Week 2 – Prompt Engineering',
                icon: '✍️',
                topics: [
                    { id: 't1', title: 'Prompt Basics', desc: 'Fundamentals of prompting.' },
                    { id: 't2', title: 'Prompt Engineering', desc: 'Advanced prompting techniques.' },
                    { id: 't3', title: 'System vs User Prompt', desc: 'Understanding prompt types.' },
                    { id: 't4', title: 'Role-Task-Context', desc: 'Structured prompting framework.' },
                    { id: 't5', title: 'Improving Output', desc: 'Getting better responses.' },
                    { id: 't6', title: 'Writing Prompts', desc: 'Crafting effective prompts.' },
                    { id: 't7', title: 'Research Prompts', desc: 'Prompts for research tasks.' },
                    { id: 't8', title: 'Common Mistakes', desc: 'Avoiding prompting errors.' }
                ]
            },
            {
                id: 'w3',
                title: 'Week 3 – Practical Gen AI',
                icon: '🛠️',
                topics: [
                    { id: 't1', title: 'AI Tools', desc: 'Overview of AI tools.' },
                    { id: 't2', title: 'Documentation', desc: 'Using AI for documentation.' },
                    { id: 't3', title: 'Reporting', desc: 'AI-powered reporting.' },
                    { id: 't4', title: 'JSON Prompting', desc: 'Structured output with JSON.' },
                    { id: 't5', title: 'Structured Prompting', desc: 'Templates and frameworks.' },
                    { id: 't6', title: 'Workflow Thinking', desc: 'AI in workflows.' },
                    { id: 't7', title: 'Use Cases', desc: 'Practical applications.' },
                    { id: 't8', title: 'Mini Tasks', desc: 'Hands-on exercises.' }
                ]
            },
            {
                id: 'w4',
                title: 'Week 4 – Advanced Prompting',
                icon: '🎓',
                topics: [
                    { id: 't1', title: 'Chain of Thought', desc: 'CoT prompting technique.' },
                    { id: 't2', title: 'Tree of Thought', desc: 'ToT prompting technique.' },
                    { id: 't3', title: 'ReAct', desc: 'Reasoning and acting.' },
                    { id: 't4', title: 'Prompt Chaining', desc: 'Multi-step prompting.' },
                    { id: 't5', title: 'Prompt Injection Awareness', desc: 'Security considerations.' },
                    { id: 't6', title: 'Context Engineering', desc: 'Managing context windows.' },
                    { id: 't7', title: 'Output Control', desc: 'Controlling AI output.' },
                    { id: 't8', title: 'Best Practices', desc: 'Advanced prompting tips.' }
                ]
            },
            {
                id: 'w5',
                title: 'Week 5 – RAG Fundamentals',
                icon: '📚',
                topics: [
                    { id: 't1', title: 'RAG Intro', desc: 'Retrieval Augmented Generation.' },
                    { id: 't2', title: 'Architecture', desc: 'RAG system architecture.' },
                    { id: 't3', title: 'Data Ingestion', desc: 'Processing documents.' },
                    { id: 't4', title: 'Text Splitting', desc: 'Chunking strategies.' },
                    { id: 't5', title: 'Embeddings', desc: 'Understanding embeddings.' },
                    { id: 't6', title: 'Vector DBs', desc: 'Vector databases explained.' },
                    { id: 't7', title: 'Simple RAG', desc: 'Building basic RAG.' },
                    { id: 't8', title: 'Use Cases', desc: 'RAG applications.' }
                ]
            },
            {
                id: 'w6',
                title: 'Week 6 – Advanced RAG',
                icon: '🔬',
                topics: [
                    { id: 't1', title: 'Corrective RAG', desc: 'Self-correcting RAG systems.' },
                    { id: 't2', title: 'Fusion RAG', desc: 'Multi-query approaches.' },
                    { id: 't3', title: 'Adaptive RAG', desc: 'Context-aware RAG.' },
                    { id: 't4', title: 'Web Search RAG', desc: 'Internet-connected RAG.' },
                    { id: 't5', title: 'Knowledge Graph Basics', desc: 'Graph-based knowledge.' },
                    { id: 't6', title: 'KG-RAG', desc: 'Knowledge Graph RAG.' },
                    { id: 't7', title: 'Optimization', desc: 'RAG performance tuning.' },
                    { id: 't8', title: 'Production RAG', desc: 'Deploying RAG systems.' }
                ]
            },
            {
                id: 'w7',
                title: 'Week 7 – AI Agents',
                icon: '🤖',
                topics: [
                    { id: 't1', title: 'AI Agents', desc: 'Introduction to AI agents.' },
                    { id: 't2', title: 'Agent vs Automation', desc: 'Key differences.' },
                    { id: 't3', title: 'Architecture', desc: 'Agent system design.' },
                    { id: 't4', title: 'Tool Calling', desc: 'Function calling in agents.' },
                    { id: 't5', title: 'Memory', desc: 'Agent memory systems.' },
                    { id: 't6', title: 'Multi-Agent', desc: 'Multi-agent systems.' },
                    { id: 't7', title: 'Human-in-Loop', desc: 'Human oversight in agents.' },
                    { id: 't8', title: 'Use Cases', desc: 'Agent applications.' }
                ]
            },
            {
                id: 'w8',
                title: 'Week 8 – Advanced AI Systems',
                icon: '🚀',
                topics: [
                    { id: 't1', title: 'Fine-Tuning vs RAG', desc: 'When to use each.' },
                    { id: 't2', title: 'Dataset Prep', desc: 'Preparing training data.' },
                    { id: 't3', title: 'Fine-Tuning', desc: 'Model fine-tuning basics.' },
                    { id: 't4', title: 'MCP & A2A', desc: 'Model communication protocols.' },
                    { id: 't5', title: 'AI System Design', desc: 'End-to-end system design.' },
                    { id: 't6', title: 'Micro-SaaS', desc: 'Building AI micro-SaaS.' },
                    { id: 't7', title: 'End-to-End Project', desc: 'Complete AI project.' },
                    { id: 't8', title: 'Future', desc: 'Future of AI technology.' }
                ]
            }
        ]
    },
    automation: {
        name: 'Automation',
        icon: '⚙️',
        modules: [
            {
                id: 'a1', title: 'Agency On-Boarding', icon: '🏢', topics: [
                    { id: 't1', title: 'Client Intake Process', desc: 'Automating client onboarding.' },
                    { id: 't2', title: 'Welcome Sequences', desc: 'Automated welcome emails.' },
                    { id: 't3', title: 'Document Collection', desc: 'Gathering required documents.' },
                    { id: 't4', title: 'Access Provisioning', desc: 'Automated access setup.' }
                ]
            },
            {
                id: 'a2', title: 'Lead Generation', icon: '🎯', topics: [
                    { id: 't1', title: 'Lead Magnets', desc: 'Creating lead magnets.' },
                    { id: 't2', title: 'Landing Pages', desc: 'High-converting pages.' },
                    { id: 't3', title: 'Form Automations', desc: 'Form handling automation.' },
                    { id: 't4', title: 'Lead Scoring', desc: 'Automated lead scoring.' }
                ]
            },
            {
                id: 'a3', title: 'Lead Management', icon: '📊', topics: [
                    { id: 't1', title: 'CRM Setup', desc: 'CRM configuration.' },
                    { id: 't2', title: 'Pipeline Automation', desc: 'Sales pipeline automation.' },
                    { id: 't3', title: 'Follow-up Sequences', desc: 'Automated follow-ups.' },
                    { id: 't4', title: 'Lead Nurturing', desc: 'Nurture campaigns.' }
                ]
            },
            {
                id: 'a4', title: 'Calendar Automation', icon: '📅', topics: [
                    { id: 't1', title: 'Booking Systems', desc: 'Appointment scheduling.' },
                    { id: 't2', title: 'Reminders', desc: 'Automated reminders.' },
                    { id: 't3', title: 'Rescheduling', desc: 'Reschedule workflows.' },
                    { id: 't4', title: 'Calendar Sync', desc: 'Multi-calendar sync.' }
                ]
            },
            {
                id: 'a5', title: 'Finance Automation', icon: '💰', topics: [
                    { id: 't1', title: 'Invoicing', desc: 'Automated invoicing.' },
                    { id: 't2', title: 'Payment Processing', desc: 'Payment automation.' },
                    { id: 't3', title: 'Expense Tracking', desc: 'Expense management.' },
                    { id: 't4', title: 'Reporting', desc: 'Financial reporting.' }
                ]
            },
            {
                id: 'a6', title: 'Community Automation', icon: '👥', topics: [
                    { id: 't1', title: 'Welcome Automation', desc: 'New member welcome.' },
                    { id: 't2', title: 'Engagement Triggers', desc: 'Engagement automation.' },
                    { id: 't3', title: 'Content Distribution', desc: 'Automated content sharing.' },
                    { id: 't4', title: 'Moderation', desc: 'Community moderation.' }
                ]
            },
            {
                id: 'a7', title: 'Settings & Configuration', icon: '⚙️', topics: [
                    { id: 't1', title: 'Platform Setup', desc: 'Initial platform config.' },
                    { id: 't2', title: 'Integrations', desc: 'Third-party integrations.' },
                    { id: 't3', title: 'Permissions', desc: 'Access permissions.' },
                    { id: 't4', title: 'Optimization', desc: 'Performance optimization.' }
                ]
            },
            {
                id: 'a8', title: 'Domain & Sub-Domain Setup', icon: '🌐', topics: [
                    { id: 't1', title: 'DNS Configuration', desc: 'DNS setup basics.' },
                    { id: 't2', title: 'SSL Certificates', desc: 'SSL setup.' },
                    { id: 't3', title: 'Subdomain Routing', desc: 'Subdomain configuration.' },
                    { id: 't4', title: 'Email Setup', desc: 'Email configuration.' }
                ]
            },
            {
                id: 'a9', title: 'Funnel Building Mastery', icon: '🔄', topics: [
                    { id: 't1', title: 'Funnel Strategy', desc: 'Funnel planning.' },
                    { id: 't2', title: 'Page Building', desc: 'Creating funnel pages.' },
                    { id: 't3', title: 'Conversion Optimization', desc: 'Improving conversions.' },
                    { id: 't4', title: 'A/B Testing', desc: 'Testing and optimization.' }
                ]
            },
            {
                id: 'a10', title: 'Lead Automation', icon: '🔄', topics: [
                    { id: 't1', title: 'Lead Routing', desc: 'Automated lead assignment.' },
                    { id: 't2', title: 'Qualification', desc: 'Lead qualification flows.' },
                    { id: 't3', title: 'Notifications', desc: 'Alert automation.' },
                    { id: 't4', title: 'Integration', desc: 'System integration.' }
                ]
            }
        ]
    },
    digital_marketing: {
        name: 'Digital Marketing',
        icon: '📢',
        modules: [
            {
                id: 'd1', title: 'Mindset & Foundation', icon: '🧠', topics: [
                    { id: 't1', title: 'Marketing Mindset', desc: 'Developing the right mindset.' },
                    { id: 't2', title: 'Goal Setting', desc: 'Setting marketing goals.' },
                    { id: 't3', title: 'Industry Overview', desc: 'Digital marketing landscape.' }
                ]
            },
            {
                id: 'd2', title: 'Business Case Studies', icon: '📋', topics: [
                    { id: 't1', title: 'Success Stories', desc: 'Learning from successes.' },
                    { id: 't2', title: 'Failure Analysis', desc: 'Learning from failures.' },
                    { id: 't3', title: 'Strategy Breakdown', desc: 'Analyzing strategies.' }
                ]
            },
            {
                id: 'd3', title: 'Fundamentals of Marketing', icon: '📚', topics: [
                    { id: 't1', title: 'Marketing Basics', desc: 'Core marketing concepts.' },
                    { id: 't2', title: '4 Ps of Marketing', desc: 'Product, Price, Place, Promotion.' },
                    { id: 't3', title: 'Digital vs Traditional', desc: 'Channel comparison.' }
                ]
            },
            {
                id: 'd4', title: 'Understanding Customers', icon: '👤', topics: [
                    { id: 't1', title: 'Customer Personas', desc: 'Creating buyer personas.' },
                    { id: 't2', title: 'Customer Journey', desc: 'Mapping the journey.' },
                    { id: 't3', title: 'Pain Points', desc: 'Identifying customer needs.' }
                ]
            },
            {
                id: 'd5', title: 'Assignments & Practical Thinking', icon: '✏️', topics: [
                    { id: 't1', title: 'Practical Exercises', desc: 'Hands-on assignments.' },
                    { id: 't2', title: 'Case Studies', desc: 'Real-world analysis.' }
                ]
            },
            {
                id: 'd6', title: 'Copywriting Mastery', icon: '✍️', topics: [
                    { id: 't1', title: 'Headlines', desc: 'Writing compelling headlines.' },
                    { id: 't2', title: 'Body Copy', desc: 'Persuasive body copy.' },
                    { id: 't3', title: 'CTAs', desc: 'Call to action writing.' },
                    { id: 't4', title: 'Ad Copy', desc: 'Writing for ads.' }
                ]
            },
            {
                id: 'd7', title: 'Meta Ads Ecosystem', icon: '📱', topics: [
                    { id: 't1', title: 'Platform Overview', desc: 'Understanding Meta Ads.' },
                    { id: 't2', title: 'Account Structure', desc: 'Organizing accounts.' },
                    { id: 't3', title: 'Pixel Setup', desc: 'Installing and configuring pixel.' }
                ]
            },
            {
                id: 'd8', title: 'Meta Ads Setup', icon: '⚙️', topics: [
                    { id: 't1', title: 'Campaign Creation', desc: 'Creating campaigns.' },
                    { id: 't2', title: 'Ad Sets', desc: 'Configuring ad sets.' },
                    { id: 't3', title: 'Ad Creative', desc: 'Creating ad content.' }
                ]
            },
            {
                id: 'd9', title: 'Meta Ads Execution', icon: '🚀', topics: [
                    { id: 't1', title: 'Launch Strategy', desc: 'Launching campaigns.' },
                    { id: 't2', title: 'Monitoring', desc: 'Tracking performance.' },
                    { id: 't3', title: 'Quick Wins', desc: 'Early optimization.' }
                ]
            },
            {
                id: 'd10', title: 'Audiences & Retargeting', icon: '🎯', topics: [
                    { id: 't1', title: 'Custom Audiences', desc: 'Creating custom audiences.' },
                    { id: 't2', title: 'Lookalike Audiences', desc: 'Expanding reach.' },
                    { id: 't3', title: 'Retargeting', desc: 'Re-engaging visitors.' }
                ]
            },
            {
                id: 'd11', title: 'Meta Ads Optimization', icon: '📈', topics: [
                    { id: 't1', title: 'Performance Analysis', desc: 'Analyzing metrics.' },
                    { id: 't2', title: 'A/B Testing', desc: 'Testing variations.' },
                    { id: 't3', title: 'Scaling', desc: 'Scaling successful campaigns.' }
                ]
            },
            {
                id: 'd12', title: 'Funnels Level 1', icon: '🔄', topics: [
                    { id: 't1', title: 'Funnel Basics', desc: 'Understanding funnels.' },
                    { id: 't2', title: 'Lead Funnels', desc: 'Lead generation funnels.' },
                    { id: 't3', title: 'Sales Funnels', desc: 'Sales conversion funnels.' }
                ]
            },
            {
                id: 'd13', title: 'Meta Ads Level 2', icon: '🎓', topics: [
                    { id: 't1', title: 'Advanced Strategies', desc: 'Advanced campaign tactics.' },
                    { id: 't2', title: 'Budget Optimization', desc: 'Budget management.' },
                    { id: 't3', title: 'Attribution', desc: 'Understanding attribution.' }
                ]
            },
            {
                id: 'd14', title: 'AI & Vibe Marketing', icon: '🤖', topics: [
                    { id: 't1', title: 'AI in Marketing', desc: 'Using AI for marketing.' },
                    { id: 't2', title: 'Content Generation', desc: 'AI content creation.' },
                    { id: 't3', title: 'Automation', desc: 'Marketing automation.' }
                ]
            },
            {
                id: 'd15', title: 'LinkedIn, Authority & Growth', icon: '💼', topics: [
                    { id: 't1', title: 'LinkedIn Strategy', desc: 'B2B LinkedIn marketing.' },
                    { id: 't2', title: 'Authority Building', desc: 'Becoming an authority.' },
                    { id: 't3', title: 'Growth Tactics', desc: 'Sustainable growth strategies.' }
                ]
            }
        ]
    }
};
