function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    // Fall back to a plain link rather than rendering a broken embed.
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-sm border border-line px-4 py-3 text-sm text-bottle underline decoration-brass underline-offset-4"
      >
        {url}
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-sm border border-line bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
