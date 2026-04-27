export enum ReportTargetType {
  BLOG = 'BLOG',
  COMMENT = 'COMMENT',
  USER = 'USER',
  WATCH_PARTY = 'WATCH_PARTY',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

export interface ReportPaginationResponse {
  data: Report[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
