export interface Post {
  id: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  title: string;
  content?: string | null;
  published?: boolean;
  author?: User;
  authorId?: number;
}
export interface Profile {
  id: number;
  bio?: string | null;
  user?: User;
  userId?: number;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  password?: string;
  posts?: Post[];
  profile?: Profile;
}
