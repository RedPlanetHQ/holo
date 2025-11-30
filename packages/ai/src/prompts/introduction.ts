/**
 * Prompt for generating introduction.mdx content
 */
export const INTRODUCTION_GENERATION_PROMPT = `Create a professional introduction page in MDX format based on this persona information.

Structure the page with these sections (use ## for section headings):

1. **About** - Personal introduction (3-4 sentences covering who they are, where they live, and personal interests/hobbies with specific details)

2. **Work** - Comprehensive professional background structured as:
   - Start with current role and focus areas
   - Cover previous positions chronologically with specific details about what they worked on
   - Include a dedicated paragraph about areas of interest and technical expertise
   - Mention specific technologies, systems, or problems they've worked on
   - If applicable, mention open source contributions or side projects

3. **Setup** (optional) - Development environment, tools, and configuration if relevant information is available

Reference style examples:

**About section example:**
"Hi, I'm [Name]! I'm an engineer by profession and I currently live in [City], [Country]. I tend to spend my time reading or preferably outdoors. I'm into [hobby1], [hobby2], and [hobby3], in that order. I also dabble with [interest] time to time and have also been trying to [activity] more lately."

**Work section example:**
"I currently work at [Company] focusing on [technologies/areas]. Before this, I spent X years at [Previous Company] working on [specific systems/projects] using technologies such as [tech stack]. Before that, I interned at [Company] where I also worked on [specific work] working mostly with [technologies].

I'm interested in [area1], [area2], [area3] and [area4]. I've experience working with systems solving problems involving [problem types]. I've past experience writing [languages] professionally while also dabbling a little with [other skills].

I also like contributing to Open Source Software, focusing on contributing to projects I personally use or have an interest in ([categories]). You can find my contributions here."

Guidelines:
- Be elaborative - provide specific details, company names, technologies, and timeframes
- Use flowing, connected paragraphs rather than bullet points
- For work history, explain WHAT you worked on, not just WHERE you worked
- Include specific examples of technologies, systems, or problem domains
- Maintain professional tone while being personable
- List hobbies and interests in order of preference where applicable
- Use proper MDX syntax with ## headings and well-structured paragraphs`;

export const INTRODUCTION_SYSTEM_PROMPT =
  'You are a helpful assistant that creates professional, elaborative introduction pages in MDX format. Write in a direct, professional tone that provides detailed context and examples.';
