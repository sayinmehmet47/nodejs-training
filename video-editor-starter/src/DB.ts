import * as fs from 'node:fs';

const usersPath = './data/users';
const sessionsPath = './data/sessions';
const videosPath = './data/videos';

interface User {
  id: number;
  name: string;
  username: string;
  password: string;
}

interface Video {
  id: number;
  videoId: string;
  name: string;
  extension: string;
  dimensions: {
    width: number;
    height: number;
  };

  userId: number;
  extractedAudio: boolean;
  resizes: Record<
    string,
    {
      processing: boolean;
    }
  >;
}

interface Session {
  userId: number;
  token: number;
}

class DB {
  users: User[];
  videos: Video[];
  sessions: Session[];

  constructor() {
    this.users = JSON.parse(fs.readFileSync(usersPath, 'utf8')) || [];
    this.videos = JSON.parse(fs.readFileSync(videosPath, 'utf8')) || [];
    this.sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8')) || [];
  }

  update(): void {
    this.users = JSON.parse(fs.readFileSync(usersPath, 'utf8')) || [];
    this.sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8')) || [];
    this.videos = JSON.parse(fs.readFileSync(videosPath, 'utf8')) || [];
  }

  save(): void {
    fs.writeFileSync(usersPath, JSON.stringify(this.users));
    fs.writeFileSync(sessionsPath, JSON.stringify(this.sessions));
    fs.writeFileSync(videosPath, JSON.stringify(this.videos));
  }
}

const db = new DB();

export default db;
