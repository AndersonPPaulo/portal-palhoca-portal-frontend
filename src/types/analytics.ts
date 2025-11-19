// Interfaces para os eventos de analytics

export interface IBaseEvent {
  id: string;
  timestamp: string;
}

export interface IArticleEvent extends IBaseEvent {
  event_type: string;
  extra_data: {
    deviceType: string;
    categoryName: string;
    articleTitle: string;
  };
}

export interface IBannerEvent extends IBaseEvent {
  banner: {
    name: string;
    banner_style: string;
  };
  event_type: string;
}

export interface ICompanyEvent extends IBaseEvent {
  company: {
    name: string;
  };
  event_type: string;
}

export type ReportType = "article" | "banner" | "company";
