export const bannerDimensions = {
  topo: { width: 650, height: 114 },
  destaque: { width: 900, height: 560 },
  sidebar: { width: 330, height: 500 },
  noticia: { width: 730, height: 250 },
};

export type BannerType = keyof typeof bannerDimensions;
