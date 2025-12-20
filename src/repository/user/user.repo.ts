export interface UserRepository {
  // MVP用の基本機能のみ
  create(user: any): Promise<any>;
  findByAuth0Id(auth0Id: string): Promise<any | null>;
  update(auth0Id: string, data: any): Promise<any>;
}