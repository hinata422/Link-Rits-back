export interface UserRepository {
  create(user: any): Promise<any>;
  findByAuth0Id(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
}