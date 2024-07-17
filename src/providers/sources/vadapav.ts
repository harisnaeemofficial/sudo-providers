import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const searchUrl = `https://vadapav.mov/s/${encodeURIComponent(ctx.media.title)}`;
  const htmlContent = await ctx.fetcher(searchUrl);
  const regex = new RegExp(`<a class="directory-entry wrap" href="(.*)">${ctx.media.title}</a>`);
  const match = htmlContent.match(regex);

  if (!match || match.length < 2) throw new NotFoundError('No matching link found');

  const endpoint = match[1];
  const pageContent = await ctx.fetcher(endpoint);
  const seasonEpisodeRegex = /S(\d+)E(\d+)/i;
  const seasonEpisodeMatch = pageContent.match(seasonEpisodeRegex);

  if (!seasonEpisodeMatch) throw new NotFoundError('Season and Episode number not found');
  const seasonNumber = seasonEpisodeMatch[1].padStart(2, '0');
  const episodeNumber = seasonEpisodeMatch[2].padStart(2, '0');
  const embeds = [
    {
      embedId: `${seasonNumber}${episodeNumber}`,
      url: `${searchUrl}|${endpoint}`,
    },
  ];

  return {
    embeds,
  };
}

export const vadapavScraper = makeSourcerer({
  id: 'vadapav',
  name: 'Vadapav',
  rank: 135,
  flags: [],
  disabled: false,
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
