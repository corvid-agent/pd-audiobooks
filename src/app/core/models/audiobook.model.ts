export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  dod: string | null;
}

export interface Chapter {
  id: string;
  sectionNumber: number;
  title: string;
  listenUrl: string;
  duration: string;
  durationSecs: number;
  readers: string[];
}

export interface AudiobookSummary {
  id: string;
  title: string;
  description: string;
  language: string;
  copyrightYear: string;
  numSections: number;
  totalTime: string;
  totalTimeSecs: number;
  authors: Author[];
  genres: string[];
  coverArtUrl: string | null;
  urlRss: string | null;
  urlZipFile: string | null;
}

export interface AudiobookDetail extends AudiobookSummary {
  sections: Chapter[];
  urlLibrivox: string | null;
  urlProject: string | null;
  translators: string[];
}

/* Raw LibriVox API shapes for mapping */
export interface LibrivoxAuthorRaw {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  dod: string;
}

export interface LibrivoxSectionRaw {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  playtime: string;
  readers: { display_name: string }[];
}

export interface LibrivoxBookRaw {
  id: string;
  title: string;
  description: string;
  language: string;
  copyright_year: string;
  num_sections: string;
  totaltime: string;
  totaltimesecs: number;
  authors: LibrivoxAuthorRaw[];
  genres: { id: string; name: string }[] | string;
  url_rss: string;
  url_zip_file: string;
  url_librivox: string;
  url_project: string;
  url_text_source: string;
  sections?: LibrivoxSectionRaw[];
  translators?: { id: string; first_name: string; last_name: string }[];
}
