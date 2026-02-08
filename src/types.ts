export interface SquarespaceJsonResponse{
  upcoming: Event[]
}

export interface Event{
  id: string
  collectionId: string
  recordType: number
  addedOn: number
  updatedOn: number
  starred: boolean
  passthrough: boolean
  tags: any[]
  categories: string[]
  workflowState: number
  publishOn: number
  authorId: string
  systemDataId: string
  systemDataVariants: string
  systemDataSourceType: string
  filename: string
  urlId: string
  title: string
  sourceUrl?: string
  body: string
  excerpt: string
  location: Location
  customContent: any
  likeCount: number
  commentCount: number
  publicCommentCount: number
  commentState: number
  unsaved: boolean
  fullUrl: string
  assetUrl: string
  contentType: string
  startDate: number
  endDate: number
  items: any[]
  recordTypeLabel: string
  originalSize: string
}

export interface Location {
  mapZoom: number
  mapLat: number
  mapLng: number
  markerLat: number
  markerLng: number
  addressTitle: string
  addressLine1: string
  addressLine2: string
  addressCountry: string
}

