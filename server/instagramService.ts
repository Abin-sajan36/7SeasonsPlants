import type { Request, Response } from "express";

export interface InstagramMetadataResult {
  success: boolean;
  shortcode: string;
  formattedUrl: string;
  embedUrl: string | null;
  title: string;
  caption: string;
  thumbnailUrl: string;
  likesCount: number;
  viewsCount: string;
  date: string;
  author: string;
  isExactMatch: boolean;
  message: string;
}

export async function fetchInstagramMetadata(input: string): Promise<InstagramMetadataResult> {
  const trimmed = (input || "").trim();

  // 1. Check if input is an Instagram Embed HTML blockquote
  let embedCaption = "";
  let embedAuthor = "";
  let parsedPermalink: string | null = null;

  if (trimmed.includes("<blockquote") || trimmed.includes("data-instgrm-permalink") || trimmed.includes("instagram-media")) {
    const permalinkMatch =
      trimmed.match(/data-instgrm-permalink=["']([^"']+)["']/i) ||
      trimmed.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p|tv)\/[a-zA-Z0-9_-]+[^"']*)["']/i);
    if (permalinkMatch) {
      parsedPermalink = permalinkMatch[1].split("?")[0];
    }

    const pMatch = trimmed.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      embedCaption = pMatch[1].replace(/<[^>]+>/g, "").trim();
    }

    const authorMatch = trimmed.match(/A post shared by ([^(@<]+)/i) || trimmed.match(/@([a-zA-Z0-9._-]+)/);
    if (authorMatch) {
      embedAuthor = authorMatch[1].trim();
    }
  }

  // 2. Extract shortcode
  const sourceToScan = parsedPermalink || trimmed;
  let shortcode: string | null = null;
  const shortcodeMatch = sourceToScan.match(/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (shortcodeMatch) {
    shortcode = shortcodeMatch[1];
  } else if (/^[a-zA-Z0-9_-]{5,35}$/.test(sourceToScan) && !sourceToScan.includes('/') && !sourceToScan.includes('.')) {
    shortcode = sourceToScan;
  }

  const formattedUrl = shortcode
    ? `https://www.instagram.com/reel/${shortcode}/`
    : (trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  const embedUrl = shortcode ? `https://www.instagram.com/reel/${shortcode}/embed/` : null;

  let title = "";
  let caption = embedCaption;
  let thumbnailUrl = "";
  let likesCount = 750;
  let viewsCount = "10.2K";
  let date = "Recent";
  const author = embedAuthor || "7seasonsplants";
  let isExactMatch = Boolean(embedCaption);
  let message = isExactMatch ? "Exact reel caption imported from embed snippet ✨" : "";

  // 3. If exact caption was not in embed snippet, attempt to fetch real metadata
  if (!caption && shortcode) {
    // 3A. Try Facebook Graph API oEmbed for Instagram
    try {
      const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(formattedUrl)}&omitscript=true`;
      const oembedRes = await fetch(oembedUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(3000),
      });
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        if (oembedData && oembedData.title) {
          caption = oembedData.title;
          isExactMatch = true;
        }
        if (oembedData && oembedData.thumbnail_url) {
          thumbnailUrl = oembedData.thumbnail_url;
        }
      }
    } catch (_) {}

    // 3B. Try scraping OpenGraph / HTML with crawler User-Agents
    if (!caption) {
      const candidates = [
        `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
        `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      ];

      for (const targetUrl of candidates) {
        try {
          const resp = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(3000),
          });

          if (resp.ok) {
            const html = await resp.text();

            // Check for OpenGraph image
            const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
            if (ogImgMatch && ogImgMatch[1]) {
              thumbnailUrl = ogImgMatch[1].replace(/&amp;/g, "&");
            }

            // Check for OpenGraph title
            const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
            if (ogTitleMatch && ogTitleMatch[1] && !ogTitleMatch[1].toLowerCase().includes("instagram")) {
              title = ogTitleMatch[1].replace(/&amp;/g, "&");
              isExactMatch = true;
            }

            // Check for OpenGraph description
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
            if (ogDescMatch && ogDescMatch[1] && !ogDescMatch[1].toLowerCase().includes("instagram photos and videos")) {
              caption = ogDescMatch[1].replace(/&amp;/g, "&");
              isExactMatch = true;
              const likesMatch = caption.match(/([0-9,]+)\s+likes/i);
              if (likesMatch) {
                const parsedLikes = parseInt(likesMatch[1].replace(/,/g, ""), 10);
                if (!isNaN(parsedLikes)) likesCount = parsedLikes;
              }
            }

            if (caption || title) break;
          }
        } catch (_) {}
      }
    }
  }

  // 4. Derive title from caption if available
  if (caption && !title) {
    const firstLine = caption.split("\n")[0].trim();
    title = firstLine.length > 70 ? firstLine.slice(0, 67) + "..." : firstLine;
  }

  // 5. Clean, non-destructive fallbacks
  if (!title) {
    title = shortcode ? `Nursery Reel ${shortcode} 🌿` : "Instagram Reel from @7seasonsplants 🌿";
  }
  if (!thumbnailUrl) {
    thumbnailUrl = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80";
  }

  if (!message) {
    message = isExactMatch
      ? "Reel metadata imported successfully! ✨"
      : "Reel embed player linked successfully! Enter your title and caption below or use AI Polish.";
  }

  return {
    success: true,
    shortcode: shortcode || "",
    formattedUrl,
    embedUrl,
    title,
    caption,
    thumbnailUrl,
    likesCount,
    viewsCount,
    date,
    author,
    isExactMatch,
    message,
  };
}

export async function generateInstagramAiCopy(
  params: { notes?: string; currentTitle?: string; currentCaption?: string; reelUrl?: string },
  ai: any,
  generateWithFallback: Function
) {
  const { notes, currentTitle, currentCaption, reelUrl } = params;

  const contextText = [
    notes ? `Admin notes/topic: "${notes}"` : "",
    currentTitle ? `Current title: "${currentTitle}"` : "",
    currentCaption ? `Current caption: "${currentCaption}"` : "",
    reelUrl ? `Reel link: "${reelUrl}"` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are a social media specialist for 7Seasonsplants (Mannaratharayil Gardens LLP nursery in Kerala, South India).
Generate polished, engaging copy for an Instagram Reel blog showcase based on the following input:
${contextText || "Topic: Nursery plant care, tropical propagation, and lush garden routines."}

Return a valid JSON object with:
1. "title": A catchy, professional gardening title (5 to 10 words, with 1-2 botanical emojis, e.g. "Adenium Repotting & Root Aeration Secrets 🪴✨").
2. "caption": An authentic, engaging description (2-4 sentences) highlighting plant varieties, nursery care tips, and 3-5 relevant hashtags like #7seasonsplants #Mannaratharayil #keralagarden #indoorplants.
3. "estimatedLikes": A realistic number between 500 and 2200.
4. "estimatedViews": A realistic formatted string like "9.4K" or "18.2K".

Respond ONLY with valid JSON.`;

  const aiResponse = await generateWithFallback(ai, {
    contents: prompt,
    primaryModel: "gemini-3.1-flash-lite",
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = aiResponse?.text || aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response generated from AI");
  }

  return JSON.parse(text);
}
